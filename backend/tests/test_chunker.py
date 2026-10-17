import logging
from unittest.mock import patch

from app.processing.chunker import chunk_text

def test_chunk_text_preserves_sections_and_embeds_contextual_chunks() -> None:
    resume_text = (
        "Jane Doe\n"
        "Skills:\n"
        "- Python and FastAPI\n"
        "- React and TypeScript\n"
        "\n"
        "Experience:\n"
        "Built backend services for a healthcare platform."
    )

    def fake_embed_texts(texts: list[str]) -> list[list[float]]:
        return [[float(index), 1.0] for index, _ in enumerate(texts, start=1)]

    with patch("app.processing.chunker.embed_texts", side_effect=fake_embed_texts) as embed:
        chunks = chunk_text(resume_text)

    assert [chunk["section"] for chunk in chunks] == [
        "General",
        "Skills",
        "Skills",
        "Experience",
    ]
    assert chunks[1]["text"] == "- Python and FastAPI"
    assert chunks[2]["text"] == "- React and TypeScript"
    assert all(chunk["embedding"] for chunk in chunks)
    assert [chunk["chunk_id"] for chunk in chunks] == [
        "chunk-0001",
        "chunk-0002",
        "chunk-0003",
        "chunk-0004",
    ]
    assert embed.call_args.args[0][1].startswith("Skills:")


def test_chunk_text_returns_empty_for_blank_input() -> None:
    with patch("app.processing.chunker.embed_texts") as embed:
        assert chunk_text(" \n\n") == []

    embed.assert_not_called()


def test_chunk_text_does_not_generate_project_title_only_chunks() -> None:
    with patch("app.processing.chunker.embed_texts") as embed:
        assert chunk_text(
            "Projects:\nHuman Resource Management System (HRMS)"
        ) == []

    embed.assert_not_called()


def test_chunk_text_preserves_project_titles_skills_and_source_text() -> None:
    resume_text = (
        "Projects:\n"
        "Risk Dashboard\n"
        "Built reporting tools for financial services using SQL.\n"
        "\n"
        "Skills:\n"
        "- SQL, Python, Tableau\n"
        "\n"
        "Experience:\n"
        "Developed REST APIs and presented findings to stakeholders."
    )

    with patch(
        "app.processing.chunker.embed_texts",
        side_effect=lambda texts: [[1.0] for _ in texts],
    ):
        chunks = chunk_text(resume_text)

    assert [(chunk["text"], chunk["content_type"]) for chunk in chunks] == [
        (
            "Risk Dashboard\nBuilt reporting tools for financial services using SQL.",
            "project",
        ),
        ("- SQL", "skill"),
        ("Python", "skill"),
        ("Tableau", "skill"),
        (
            "Developed REST APIs and presented findings to stakeholders.",
            "evidence",
        ),
    ]
    assert chunks[0]["section"] == "Projects"
    assert chunks[0]["source"] == "lines 2-3"
    assert chunks[0]["original_text"] == (
        "Risk Dashboard\nBuilt reporting tools for financial services using SQL."
    )
    assert chunks[1]["original_text"] == "- SQL, Python, Tableau"
    assert chunks[4]["original_text"] == (
        "Developed REST APIs and presented findings to stakeholders."
    )


def test_chunk_text_skips_empty_sections_and_heading_only_chunks() -> None:
    resume_text = (
        "Summary:\n"
        "\n"
        "Skills:\n"
        "- Python\n"
        "Experience:\n"
        "Education:\n"
        "- Bachelor of Science in Mathematics"
    )

    with patch(
        "app.processing.chunker.embed_texts",
        side_effect=lambda texts: [[1.0] for _ in texts],
    ) as embed:
        chunks = chunk_text(resume_text)

    assert [(chunk["section"], chunk["text"]) for chunk in chunks] == [
        ("Skills", "- Python"),
        ("Education", "- Bachelor of Science in Mathematics"),
    ]
    assert all(chunk["text"].strip() for chunk in chunks)
    assert all(":" not in chunk["text"] for chunk in chunks)
    assert len(embed.call_args.args[0]) == 2


def test_chunk_text_separates_inline_pdf_headings_and_normalizes_sections() -> None:
    resume_text = (
        "EDUCATION Bachelor of Science in Mathematics "
        "EXPERIENCE Acme Corp 2021 - 2024 "
        "Built data tools for operations. SKILLS Python, SQL, Excel"
    )

    with patch(
        "app.processing.chunker.embed_texts",
        side_effect=lambda texts: [[1.0] for _ in texts],
    ):
        chunks = chunk_text(resume_text)

    assert [(chunk["section"], chunk["text"]) for chunk in chunks] == [
        ("Education", "Bachelor of Science in Mathematics"),
        ("Experience", "Acme Corp 2021 - 2024 Built data tools for operations."),
        ("Skills", "Python"),
        ("Skills", "SQL"),
        ("Skills", "Excel"),
    ]


def test_chunk_text_does_not_append_general_work_environment_to_summary() -> None:
    resume_text = (
        "Summary:\n"
        "Built reporting services for distributed teams.\n"
        "General Work Environment\n"
        "Hybrid, occasional travel."
    )

    with patch(
        "app.processing.chunker.embed_texts",
        side_effect=lambda texts: [[1.0] for _ in texts],
    ):
        chunks = chunk_text(resume_text)

    assert [(chunk["section"], chunk["text"]) for chunk in chunks] == [
        ("Summary", "Built reporting services for distributed teams."),
        ("Work Environment", "Hybrid, occasional travel."),
    ]


def test_chunk_text_keeps_wrapped_project_bullets_with_their_title() -> None:
    resume_text = (
        "Projects:\n"
        "Risk Dashboard\n"
        "Built a reporting dashboard for analysts\n"
        "across three teams.\n"
        "- Reduced monthly report time by 20%.\n"
        "\n"
        "Portfolio Tracker\n"
        "Created a tool for portfolio monitoring."
    )

    with patch(
        "app.processing.chunker.embed_texts",
        side_effect=lambda texts: [[1.0] for _ in texts],
    ):
        chunks = chunk_text(resume_text)

    assert [chunk["text"] for chunk in chunks] == [
        (
            "Risk Dashboard\nBuilt a reporting dashboard for analysts\n"
            "across three teams.\n- Reduced monthly report time by 20%."
        ),
        "Portfolio Tracker\nCreated a tool for portfolio monitoring.",
    ]
    assert [chunk["section"] for chunk in chunks] == ["Projects", "Projects"]
    assert [chunk["content_type"] for chunk in chunks] == ["project", "project"]


def test_chunk_debug_output_is_emitted_before_embedding(caplog) -> None:
    with patch("app.processing.chunker.embed_texts", return_value=[[1.0]]) as embed:
        with caplog.at_level(logging.DEBUG, logger="app.processing.chunker"):
            chunk_text("Summary:\nBuilt reliable API services.")

    assert "section=Summary" in caplog.text
    assert "Built reliable API services." in caplog.text
    embed.assert_called_once()