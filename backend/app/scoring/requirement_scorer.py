import re
from typing import Literal

from pydantic import BaseModel, Field

from app.processing.jd_parser import JDRequirement
from app.retrieval.retriever import RetrievedChunk

RequirementStatus = Literal[
    "matched",
    "partially_matched",
    "not_demonstrated",
]
EvidenceStatus = Literal[
    "supported",
    "partial",
    "not_found",
    "contradicted",
]

_TOKEN_PATTERN = re.compile(r"[a-z][a-z0-9+#]*")
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
    "years",
    "year",
    "experience",
    "experienced",
    "skill",
    "skills",
    "ability",
    "able",
    "proficient",
    "proficiency",
    "knowledge",
    "required",
    "preferred",
    "minimum",
    "strong",
    "excellent",
    "must",
}
_TOKEN_ALIASES = {
    "availability": "available",
    "communicated": "communicate",
    "communication": "communicate",
    "collaboration": "collaborate",
    "collaborated": "collaborate",
    "developed": "develop",
    "developing": "develop",
    "development": "develop",
    "designed": "design",
    "designing": "design",
    "implemented": "implement",
    "implementing": "implement",
    "led": "lead",
    "leadership": "lead",
    "management": "manage",
    "managed": "manage",
    "occasionally": "occasional",
    "presented": "present",
    "presentation": "present",
    "travelled": "travel",
    "travelling": "travel",
    "traveling": "travel",
}
_NEGATION_PREFIX = re.compile(
    r"\b(?:no (?:prior )?experience (?:with|in)|"
    r"without (?:any )?(?:prior )?experience (?:with|in)|"
    r"no|without|lack\w*|unfamiliar with|not proficient in|"
    r"not experienced (?:with|in)|never used|not certified in|"
    r"unable to|cannot|can['’]t|not available for|"
    r"unwilling to|not willing to|do not have|does not have)\b",
    re.IGNORECASE,
)
MATCH_THRESHOLD = 0.8
MAX_SUPPORTING_EVIDENCE = 5
_YEARS_PATTERN = re.compile(
    r"\b(\d+)\s*(?:\+|[-–]\s*\d+)?\s*(?:years?|yrs?)\b",
    re.IGNORECASE,
)


class RequirementScore(BaseModel):
    requirement: str
    score: float = Field(ge=0, le=100)
    match_level: str
    supporting_evidence: list[RetrievedChunk]
    category: str = "general"
    importance: Literal["required", "preferred", "unspecified"] = "required"
    status: RequirementStatus
    evidence_status: EvidenceStatus
    contradicting_evidence: list[RetrievedChunk] = Field(default_factory=list)


def _normalize_token(token: str) -> str:
    if token in _TOKEN_ALIASES:
        return _TOKEN_ALIASES[token]
    if len(token) > 5 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 3 and token.endswith("s") and not token.endswith(("ss", "us")):
        return token[:-1]
    return token


def requirement_terms(text: str) -> set[str]:
    """Return normalized content terms, excluding category-neutral boilerplate."""
    return {
        _normalize_token(token)
        for token in _TOKEN_PATTERN.findall(text.casefold())
        if token not in _STOPWORDS
    }


def _evidence_coverage(
    required_terms: set[str],
    evidence_text: str,
    required_years: int | None,
) -> float:
    if not required_terms and required_years is None:
        return 0.0
    matched_terms = required_terms & requirement_terms(evidence_text)
    total_criteria = len(required_terms) + int(required_years is not None)
    matched_criteria = len(matched_terms)
    if required_years is not None:
        matched_criteria += _years_coverage(evidence_text, required_years)
    return matched_criteria / total_criteria


def _years_coverage(evidence_text: str, required_years: int) -> float:
    evidence_years = _YEARS_PATTERN.search(evidence_text)
    if not evidence_years:
        return 0.0
    return min(int(evidence_years.group(1)) / required_years, 1.0)


def _is_explicitly_contradictory(
    required_terms: set[str],
    evidence_text: str,
) -> bool:
    if not required_terms:
        return False

    sentences = re.split(r"[.!?;\n]", evidence_text.casefold())
    for sentence in sentences:
        negation = _NEGATION_PREFIX.search(sentence)
        if not negation:
            continue
        following_text = sentence[negation.end():]
        following_terms = {
            _normalize_token(token)
            for token in _TOKEN_PATTERN.findall(following_text)[:3]
        }
        if required_terms & following_terms:
            return True
    return False


def _section_affinity(category: str, section: str) -> int:
    preferred_sections = {
        "skill": {"skills", "certifications", "experience", "projects"},
        "qualification": {"education", "certifications"},
        "education": {"education", "certifications"},
        "experience": {"experience", "projects", "summary"},
        "responsibility": {"experience", "projects", "summary"},
        "soft_skill": {"experience", "projects", "summary"},
        "work_environment": {"work environment", "summary"},
    }
    sections = preferred_sections.get(category.casefold(), set())
    return int(section.casefold() in sections)


def _requirement_fields(
    requirement: str | JDRequirement,
) -> tuple[str, str, Literal["required", "preferred", "unspecified"]]:
    if isinstance(requirement, JDRequirement):
        importance = (
            "preferred"
            if requirement.importance.casefold() == "preferred"
            else (
                "unspecified"
                if requirement.importance.casefold() == "unspecified"
                else "required"
            )
        )
        return requirement.text, requirement.category, importance
    return requirement, "general", "required"


def score_requirement(
    requirement: str | JDRequirement,
    evidence: list[RetrievedChunk],
) -> RequirementScore:
    """Score lexical evidence coverage; embedding similarity is diagnostic only."""
    text, category, importance = _requirement_fields(requirement)
    required_terms = requirement_terms(text)
    years_match = (
        _YEARS_PATTERN.search(text)
        if category.casefold() == "experience"
        else None
    )
    required_years = int(years_match.group(1)) if years_match else None

    ranked: list[tuple[float, RetrievedChunk, bool]] = []
    for chunk in evidence:
        coverage = _evidence_coverage(
            required_terms,
            chunk.text,
            required_years,
        )
        if coverage <= 0 and not (
            required_years is not None and _YEARS_PATTERN.search(chunk.text)
        ):
            continue
        ranked.append(
            (
                coverage,
                chunk,
                _is_explicitly_contradictory(required_terms, chunk.text),
            )
        )

    ranked.sort(
        key=lambda item: (
            item[0],
            _section_affinity(category, item[1].section),
            item[1].similarity_score,
        ),
        reverse=True,
    )
    contradicting = [
        chunk
        for _, chunk, is_contradictory in ranked
        if is_contradictory
    ][:MAX_SUPPORTING_EVIDENCE]
    supporting = [
        chunk
        for _, chunk, is_contradictory in ranked
        if not is_contradictory
    ][:MAX_SUPPORTING_EVIDENCE]

    best_coverage = max((coverage for coverage, _, _ in ranked), default=0.0)
    if supporting:
        best_supporting_item = max(
            (
                item
                for item in ranked
                if not item[2]
            ),
            key=lambda item: item[0],
        )
        best_support, best_support_chunk, _ = best_supporting_item
        score = round(best_support * 100, 1)
        duration_met = (
            required_years is None
            or _years_coverage(best_support_chunk.text, required_years) >= 1.0
        )
        status: RequirementStatus = (
            "matched"
            if best_support >= MATCH_THRESHOLD and duration_met
            else "partially_matched"
        )
        evidence_status: EvidenceStatus = (
            "supported" if status == "matched" else "partial"
        )
    elif contradicting:
        score = 0.0
        status = "not_demonstrated"
        evidence_status = "contradicted"
    else:
        score = round(best_coverage * 100, 1)
        status = (
            "partially_matched" if best_coverage > 0 else "not_demonstrated"
        )
        evidence_status = "partial" if best_coverage > 0 else "not_found"

    match_level = {
        "matched": "Matched",
        "partially_matched": "Partially matched",
        "not_demonstrated": "Not demonstrated",
    }[status]
    return RequirementScore(
        requirement=text,
        score=score,
        match_level=match_level,
        supporting_evidence=supporting,
        category=category,
        importance=importance,
        status=status,
        evidence_status=evidence_status,
        contradicting_evidence=contradicting,
    )
