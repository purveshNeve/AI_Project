import logging
from types import SimpleNamespace
from unittest.mock import patch

from app.retrieval.retriever import retrieve_relevant_chunks


def _result(
    chunk_id: str,
    text: str,
    section: str,
    distance: float = 0.1,
) -> SimpleNamespace:
    return SimpleNamespace(
        chunk_id=chunk_id.encode(),
        text=text.encode(),
        section=section.encode(),
        distance=str(distance).encode(),
    )


def _mock_search(results: list[SimpleNamespace]):
    redis_patch = patch("app.retrieval.retriever.redis_client.ft")
    redis_client = redis_patch.start()
    search = redis_client.return_value.search
    search.return_value.docs = results
    return redis_patch, search


def test_retrieval_filters_irrelevant_text_for_communication_requirement(caplog) -> None:
    docs = [
        _result(
            "relevant",
            "Presented weekly updates to stakeholders and documented feedback.",
            "Experience",
            0.12,
        ),
        _result(
            "irrelevant",
            "Practiced data structures and algorithms using Python.",
            "Projects",
            0.05,
        ),
        _result(
            "heading",
            "Positions of Responsibility",
            "Projects",
            0.01,
        ),
    ]
    redis_patch, search = _mock_search(docs)
    try:
        with (
            patch(
                "app.retrieval.retriever.embed_texts",
                return_value=[[0.0] * 384],
            ),
            caplog.at_level(logging.DEBUG, logger="app.retrieval.retriever"),
        ):
            evidence = retrieve_relevant_chunks(
                "Communication with stakeholders",
                "resume-1",
            )
    finally:
        redis_patch.stop()

    assert [(item.chunk_id, item.section) for item in evidence] == [
        ("relevant", "Experience")
    ]
    assert evidence[0].similarity_score == 0.88
    assert "requirement='Communication with stakeholders'" in caplog.text
    assert "accepted=False" in caplog.text
    assert search.call_count == 1


def test_retrieval_keeps_valid_short_technical_skill() -> None:
    redis_patch, search = _mock_search([_result("sql", "SQL", "Skills", 0.2)])
    try:
        with patch(
            "app.retrieval.retriever.embed_texts",
            return_value=[[0.0] * 384],
        ):
            evidence = retrieve_relevant_chunks("SQL", "resume-1")
    finally:
        redis_patch.stop()

    assert [(item.text, item.section, item.similarity_score) for item in evidence] == [
        ("SQL", "Skills", 0.8)
    ]
    assert search.call_count == 1


def test_retrieval_rejects_title_only_project_but_keeps_description_context() -> None:
    docs = [
        _result("title", "Human Resource Management System (HRMS)", "Projects"),
        _result(
            "project",
            "Risk Dashboard\nPresented weekly findings to stakeholders.",
            "Projects",
            0.15,
        ),
    ]
    redis_patch, _ = _mock_search(docs)
    try:
        with patch(
            "app.retrieval.retriever.embed_texts",
            return_value=[[0.0] * 384],
        ):
            evidence = retrieve_relevant_chunks(
                "Stakeholder communication",
                "resume-1",
            )
    finally:
        redis_patch.stop()

    assert [item.chunk_id for item in evidence] == ["project"]
    assert evidence[0].text.startswith("Risk Dashboard\n")


def test_empty_search_results_return_no_evidence_without_error() -> None:
    redis_patch, _ = _mock_search([])
    try:
        with patch(
            "app.retrieval.retriever.embed_texts",
            return_value=[[0.0] * 384],
        ):
            evidence = retrieve_relevant_chunks("Python", "resume-1")
    finally:
        redis_patch.stop()

    assert evidence == []


def test_blank_requirement_skips_embedding_and_search() -> None:
    with (
        patch("app.retrieval.retriever.embed_texts") as embed,
        patch("app.retrieval.retriever.redis_client.ft") as redis_search,
    ):
        assert retrieve_relevant_chunks(" \n", "resume-1") == []

    embed.assert_not_called()
    redis_search.assert_not_called()
