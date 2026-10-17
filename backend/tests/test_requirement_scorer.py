from app.processing.jd_parser import JDRequirement
from app.retrieval.retriever import RetrievedChunk
from app.scoring.overall_score import calculate_overall_score
from app.scoring.requirement_scorer import score_requirement


def _chunk(
    text: str,
    similarity: float = 0.1,
    section: str = "Experience",
    chunk_id: str = "chunk-1",
) -> RetrievedChunk:
    return RetrievedChunk(
        chunk_id=chunk_id,
        text=text,
        section=section,
        similarity_score=similarity,
    )


def test_clear_text_match_is_not_scored_from_embedding_similarity() -> None:
    result = score_requirement(
        JDRequirement(
            text="Python and FastAPI",
            category="skill",
            importance="required",
        ),
        [_chunk("Built APIs with Python and FastAPI.", similarity=0.31)],
    )

    assert result.score == 100.0
    assert result.status == "matched"
    assert result.evidence_status == "supported"
    assert result.category == "skill"
    assert result.importance == "required"
    assert result.match_level == "Matched"
    assert result.supporting_evidence[0].text == "Built APIs with Python and FastAPI."


def test_partial_evidence_scores_only_the_terms_demonstrated() -> None:
    result = score_requirement(
        "Python, SQL, and Tableau",
        [_chunk("Used Python and SQL to build reports.", similarity=0.99)],
    )

    assert result.score == 66.7
    assert result.status == "partially_matched"
    assert result.evidence_status == "partial"
    assert len(result.supporting_evidence) == 1


def test_experience_years_are_a_separate_required_evidence_criterion() -> None:
    requirement = JDRequirement(
        text="5+ years of Python experience",
        category="experience",
        importance="required",
    )

    met = score_requirement(requirement, [_chunk("5 years of Python experience.")])
    below = score_requirement(requirement, [_chunk("3 years of Python experience.")])

    assert met.score == 100.0
    assert met.status == "matched"
    assert below.score == 80.0
    assert below.status == "partially_matched"
    assert below.evidence_status == "partial"


def test_experience_duration_only_requirement_uses_resume_duration() -> None:
    requirement = JDRequirement(
        text="5+ years of experience",
        category="experience",
    )

    result = score_requirement(requirement, [_chunk("2 years of experience.")])

    assert result.score == 40.0
    assert result.status == "partially_matched"
    assert result.evidence_status == "partial"
    assert result.supporting_evidence[0].text == "2 years of experience."


def test_irrelevant_evidence_is_not_presented_as_supporting() -> None:
    result = score_requirement(
        "Kubernetes",
        [_chunk("Built a reporting dashboard using Python.", similarity=0.99)],
    )

    assert result.score == 0
    assert result.status == "not_demonstrated"
    assert result.evidence_status == "not_found"
    assert result.supporting_evidence == []


def test_no_retrieved_evidence_means_not_demonstrated_not_lacking() -> None:
    result = score_requirement("Kubernetes", [])

    assert result.score == 0
    assert result.status == "not_demonstrated"
    assert result.evidence_status == "not_found"
    assert result.match_level == "Not demonstrated"
    assert result.supporting_evidence == []
    assert result.contradicting_evidence == []


def test_explicit_negative_evidence_is_distinguished_from_missing_evidence() -> None:
    result = score_requirement(
        "Kubernetes",
        [_chunk("No experience with Kubernetes.", similarity=0.2)],
    )

    assert result.score == 0
    assert result.status == "not_demonstrated"
    assert result.evidence_status == "contradicted"
    assert result.supporting_evidence == []
    assert result.contradicting_evidence[0].text == (
        "No experience with Kubernetes."
    )


def test_unrelated_negation_does_not_override_positive_evidence() -> None:
    result = score_requirement(
        "Python",
        [_chunk("No major issues; used Python daily.")],
    )

    assert result.score == 100.0
    assert result.status == "matched"
    assert result.evidence_status == "supported"
    assert result.contradicting_evidence == []


def test_required_requirements_contribute_twice_preferred_requirements() -> None:
    required = score_requirement(
        JDRequirement(text="Python", category="skill", importance="required"),
        [_chunk("Python", section="Skills")],
    )
    preferred = score_requirement(
        JDRequirement(text="Kubernetes", category="skill", importance="preferred"),
        [],
    )

    assert calculate_overall_score([required, preferred]) == 66.7


def test_unspecified_importance_is_preserved_and_has_normal_weight() -> None:
    required = score_requirement(
        JDRequirement(text="Python", category="skill", importance="required"),
        [_chunk("Python", section="Skills")],
    )
    unspecified = score_requirement(
        JDRequirement(text="SQL", category="skill", importance="unspecified"),
        [],
    )

    assert unspecified.importance == "unspecified"
    assert calculate_overall_score([required, unspecified]) == 66.7


def test_overlapping_skill_and_responsibility_are_counted_once() -> None:
    skill = score_requirement(
        JDRequirement(text="REST API development", category="skill"),
        [_chunk("Developed REST APIs.", section="Skills")],
    )
    responsibility = score_requirement(
        JDRequirement(
            text="Develop REST APIs.",
            category="responsibility",
            importance="required",
        ),
        [_chunk("Developed REST APIs.", section="Experience")],
    )

    assert calculate_overall_score([skill, responsibility]) == 100.0


def test_empty_requirement_list_has_zero_overall_score() -> None:
    assert calculate_overall_score([]) == 0.0
