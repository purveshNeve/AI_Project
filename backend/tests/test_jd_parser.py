import pymupdf
import pytest

from app.processing import jd_parser
from app.processing.jd_parser import (
    InvalidJobDescriptionError,
    JobDescriptionRequirementsError,
    parse_job_description_text,
)
from app.processing.pdf_parser import PDFParsingError, extract_text_from_pdf


def _text_pdf(text: str) -> bytes:
    document = pymupdf.open()
    page = document.new_page()
    page.insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


def test_extracts_and_parses_text_based_job_description_pdf() -> None:
    pdf = _text_pdf(
        "Job Title: Senior Data Engineer\n"
        "Responsibilities\n"
        "- Build and maintain REST APIs.\n"
        "Requirements\n"
        "- 3+ years of experience with Python and SQL.\n"
        "Preferred Skills\n"
        "- React and Docker experience preferred.\n"
    )

    extracted = extract_text_from_pdf(pdf)
    parsed = parse_job_description_text(extracted)

    assert parsed.job_title == "Senior Data Engineer"
    assert parsed.minimum_experience_years == 3
    assert [
        (requirement.category, requirement.importance)
        for requirement in parsed.requirements
    ] == [
        ("responsibility", "required"),
        ("experience", "required"),
        ("skill", "required"),
        ("skill", "preferred"),
        ("skill", "preferred"),
    ]
    assert parsed.required_skills == ["REST APIs", "Python", "SQL"]
    assert parsed.sections["preferred_skills"] == [
        "- React and Docker experience preferred."
    ]


def test_parses_short_job_description_with_labeled_sections() -> None:
    parsed = parse_job_description_text(
        "Position: Product Analyst\n"
        "Must Have: SQL\n"
        "Nice to Have: Python\n"
        "Education: Bachelor's degree in business.\n"
    )

    assert parsed.job_title == "Product Analyst"
    assert [(item.text, item.importance) for item in parsed.requirements] == [
        ("SQL", "required"),
        ("Python", "preferred"),
        ("Bachelor's degree in business.", "unspecified"),
    ]
    assert parsed.sections["education"] == ["Bachelor's degree in business."]


def test_parses_requirements_without_explicit_section_headings() -> None:
    parsed = parse_job_description_text(
        "Senior Software Engineer\n"
        "Build and maintain Python services.\n"
        "Must have experience with Redis.\n"
    )

    assert parsed.job_title == "Senior Software Engineer"
    assert [item.text for item in parsed.requirements] == [
        "Build and maintain Python services.",
        "Must have experience with Redis.",
    ]
    assert parsed.requirements[0].category == "responsibility"
    assert parsed.requirements[1].importance == "required"


def test_classifies_required_and_preferred_sections() -> None:
    parsed = parse_job_description_text(
        "Required Skills:\n"
        "- Python\n"
        "Preferred Skills:\n"
        "- React\n"
    )

    assert [item.importance for item in parsed.requirements] == [
        "required",
        "preferred",
    ]


def test_extracts_skill_keywords_without_substring_false_matches() -> None:
    parsed = parse_job_description_text(
        "Requirements:\n"
        "- Experience with JavaScript and Java.\n"
        "- Use a digital workflow and maintain version control.\n"
    )

    assert parsed.required_skills == ["JavaScript", "Java"]


@pytest.mark.parametrize(
    ("experience_text", "expected_minimum"),
    [
        ("0–2 years of experience", 0),
        ("Minimum 3 years of experience", 3),
        ("At least 4 years of experience", 4),
        ("2+ years of experience", 2),
    ],
)
def test_extracts_explicit_minimum_experience(
    experience_text: str,
    expected_minimum: int,
) -> None:
    parsed = parse_job_description_text(
        f"Experience Requirements:\n- {experience_text} with Python."
    )

    assert parsed.minimum_experience_years == expected_minimum


def test_does_not_infer_minimum_from_preferred_experience() -> None:
    parsed = parse_job_description_text(
        "Preferred Skills:\n- 5+ years of experience with Python preferred."
    )

    assert parsed.minimum_experience_years is None


def test_leaves_job_title_empty_when_it_cannot_be_identified() -> None:
    parsed = parse_job_description_text(
        "Responsibilities:\n- Maintain the company database."
    )

    assert parsed.job_title is None


@pytest.mark.parametrize("raw_text", ["", " \n \t"])
def test_reports_empty_text_as_scanned_or_unextractable(
    raw_text: str,
) -> None:
    with pytest.raises(InvalidJobDescriptionError, match="OCR"):
        parse_job_description_text(raw_text)


def test_reports_text_without_identifiable_requirements() -> None:
    with pytest.raises(JobDescriptionRequirementsError, match="No job requirements"):
        parse_job_description_text(
            "Welcome to Example Company.\n"
            "We provide excellent benefits and a friendly workplace."
        )


def test_reports_invalid_pdf() -> None:
    with pytest.raises(PDFParsingError, match="not a readable PDF"):
        extract_text_from_pdf(b"%PDF-this is not a valid document")


def test_reports_encrypted_pdf() -> None:
    document = pymupdf.open()
    document.new_page().insert_text((72, 72), "Job requirements")
    encrypted = document.tobytes(
        encryption=pymupdf.PDF_ENCRYPT_AES_256,
        owner_pw="owner",
        user_pw="reader",
    )
    document.close()

    with pytest.raises(PDFParsingError, match="Password-protected"):
        extract_text_from_pdf(encrypted)


def test_scanned_pdf_without_text_reports_ocr_requirement() -> None:
    document = pymupdf.open()
    document.new_page()
    scanned_pdf = document.tobytes()
    document.close()

    extracted = extract_text_from_pdf(scanned_pdf)
    with pytest.raises(InvalidJobDescriptionError, match="OCR"):
        parse_job_description_text(extracted)


def test_parser_makes_no_network_calls(monkeypatch: pytest.MonkeyPatch) -> None:
    import requests

    monkeypatch.setattr(
        requests,
        "post",
        lambda *args, **kwargs: pytest.fail("network call"),
    )
    parsed = parse_job_description_text("Required Skills:\n- Python and FastAPI")

    assert parsed.required_skills == ["Python", "FastAPI"]
    assert "requests" not in jd_parser.__dict__
