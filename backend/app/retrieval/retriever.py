import logging
import re
import struct

from pydantic import BaseModel
from redis.commands.search.query import Query

from app.ai.embeddings import embed_texts
from app.processing.chunker import is_indexable_text
from app.retrieval.vector_store import INDEX_NAME, VECTOR_DIM, redis_client

_LOGGER = logging.getLogger(__name__)
_TOKEN_PATTERN = re.compile(r"[a-z0-9+#]+")
_STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "into",
    "is",
    "of",
    "on",
    "or",
    "the",
    "their",
    "to",
    "with",
}

class RetrievedChunk(BaseModel):
    chunk_id: str
    text: str
    section: str
    similarity_score: float


def _as_text(value: object) -> str:
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return str(value)


def _normalize_token(token: str) -> str:
    if len(token) > 5 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 4 and token.endswith("s") and not token.endswith(("ss", "us")):
        return token[:-1]
    return token


def _content_terms(text: str) -> set[str]:
    return {
        _normalize_token(token)
        for token in _TOKEN_PATTERN.findall(text.casefold())
        if token not in _STOPWORDS
    }


def _shares_requirement_terms(requirement: str, text: str) -> bool:
    requirement_terms = _content_terms(requirement)
    return bool(requirement_terms & _content_terms(text))


def retrieve_relevant_chunks(
    requirement: str,
    resume_id: str,
    top_k: int = 5,
) -> list[RetrievedChunk]:
    requirement = requirement.strip()
    if not requirement:
        return []
    if not resume_id:
        raise ValueError("resume_id must not be empty.")
    if top_k < 1:
        return []

    query_embedding = embed_texts([requirement])[0]
    if len(query_embedding) != VECTOR_DIM:
        raise ValueError(
            f"Expected a {VECTOR_DIM}-dimensional query embedding; "
            f"got {len(query_embedding)}."
        )

    candidate_k = min(max(top_k * 5, 25), 100)
    query = (
        Query(
            f'(@resume_id:"{resume_id}")=>'
            f"[KNN {candidate_k} @embedding $query_vector AS distance]"
        )
        .sort_by("distance")
        .return_fields("chunk_id", "text", "section", "distance")
        .paging(0, candidate_k)
        .dialect(2)
    )
    results = redis_client.ft(INDEX_NAME).search(
        query,
        query_params={"query_vector": _pack_embedding(query_embedding)},
    )

    _LOGGER.debug("Evidence retrieval for requirement=%r", requirement)
    evidence: list[RetrievedChunk] = []
    for result in results.docs:
        cosine_distance = float(_as_text(result.distance))
        similarity = max(-1.0, min(1.0, 1.0 - cosine_distance))
        text = _as_text(result.text)
        section = _as_text(result.section)
        valid_content = is_indexable_text(text, section)
        relevant_terms = _shares_requirement_terms(requirement, text)
        accepted = valid_content and relevant_terms
        _LOGGER.debug(
            "Evidence candidate requirement=%r section=%r similarity=%.4f "
            "accepted=%s text=%r",
            requirement,
            section,
            similarity,
            accepted,
            text,
        )
        if not accepted:
            continue
        evidence.append(
            RetrievedChunk(
                chunk_id=_as_text(result.chunk_id),
                text=text,
                section=section,
                similarity_score=similarity,
            )
        )
    return evidence


def _pack_embedding(embedding: list[float]) -> bytes:
    return struct.pack(f"{len(embedding)}f", *embedding)