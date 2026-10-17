from unittest.mock import patch

from app.processing.chunker import SemanticChunk
from app.retrieval.vector_store import store_resume_chunks


def _chunk(
    chunk_id: str,
    text: str,
    section: str,
    content_type: str = "evidence",
) -> SemanticChunk:
    return {
        "chunk_id": chunk_id,
        "text": text,
        "section": section,
        "source": "lines 1-1",
        "original_text": text,
        "content_type": content_type,
        "embedding": [0.0] * 384,
    }


def test_store_skips_empty_and_heading_only_chunks_but_keeps_short_skills() -> None:
    chunks = [
        _chunk("empty", "  ", "Skills"),
        _chunk("heading", "Skills", "Skills"),
        _chunk("project-title", "HRMS project", "Projects", "project_title"),
        _chunk("python", "Python", "Skills", "skill"),
        _chunk("sql", "SQL", "Skills", "skill"),
    ]

    with (
        patch("app.retrieval.vector_store.create_index") as create_index,
        patch("app.retrieval.vector_store.redis_client.pipeline") as create_pipeline,
    ):
        pipeline = create_pipeline.return_value
        count = store_resume_chunks("resume-1", chunks)

    assert count == 2
    create_index.assert_called_once()
    assert pipeline.hset.call_count == 2
    stored_texts = [
        call.kwargs["mapping"]["text"]
        for call in pipeline.hset.call_args_list
    ]
    assert stored_texts == ["Python", "SQL"]
    pipeline.execute.assert_called_once()


def test_store_returns_without_creating_index_for_only_invalid_chunks() -> None:
    with (
        patch("app.retrieval.vector_store.create_index") as create_index,
        patch("app.retrieval.vector_store.redis_client.pipeline") as create_pipeline,
    ):
        count = store_resume_chunks(
            "resume-1",
            [_chunk("empty", "", "Experience")],
        )

    assert count == 0
    create_index.assert_not_called()
    create_pipeline.assert_not_called()
