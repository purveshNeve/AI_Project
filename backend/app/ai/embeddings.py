from __future__ import annotations

from functools import lru_cache
from typing import TYPE_CHECKING, Sequence

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-small-en-v1.5"

@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(MODEL_NAME)

def embed_texts(texts: Sequence[str]) -> list[list[float]]:
    if not texts:
        return []

    embeddings = get_embedding_model().encode(
        list(texts),
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )
    return embeddings.tolist()