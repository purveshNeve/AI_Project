from unittest.mock import AsyncMock

import pymupdf
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes import analysis, analysis_services
from app.processing.jd_parser import (
    InvalidJobDescriptionError,
    JobDescriptionRequirementsError,
)
from app.processing.pdf_parser import PDFParsingError


def _text_pdf(text: str) -> bytes:
    document = pymupdf.open()
    document.new_page().insert_text((72, 72), text)
    content = document.tobytes()
    document.close()
    return content


def _app() -> FastAPI:
    app = FastAPI()
    app.include_router(analysis.router, prefix="/api")
    return app


@pytest.mark.parametrize(
    ("error", "status_code", "safe_detail"),
    [
        (
            InvalidJobDescriptionError("Scanned PDF requires OCR."),
            422,
            "OCR",
        ),
        (
            JobDescriptionRequirementsError("No job requirements found."),
            422,
            "No job requirements",
        ),
        (
            PDFParsingError("The uploaded file is not a readable PDF."),
            422,
            "not a readable PDF",
        ),
    ],
)
def test_upload_returns_actionable_status_for_invalid_job_description(
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    status_code: int,
    safe_detail: str,
) -> None:
    threadpool = AsyncMock(side_effect=error)
    monkeypatch.setattr(analysis, "run_in_threadpool", threadpool)

    response = TestClient(_app()).post(
        "/api/analysis/upload",
        files={
            "resume": ("resume.pdf", b"%PDF-resume", "application/pdf"),
            "job_description": ("jd.pdf", b"%PDF-job", "application/pdf"),
        },
    )

    assert response.status_code == status_code
    assert safe_detail in response.json()["detail"]


def test_upload_preserves_existing_analysis_response_schema(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(analysis_services, "chunk_text", lambda text: ["resume chunk"])
    monkeypatch.setattr(analysis_services, "store_resume_chunks", lambda *_: 1)
    monkeypatch.setattr(analysis_services, "retrieve_relevant_chunks", lambda *_: [])

    response = TestClient(_app()).post(
        "/api/analysis/upload",
        files={
            "resume": (
                "resume.pdf",
                _text_pdf("Jane Candidate\nSkills\nPython"),
                "application/pdf",
            ),
            "job_description": (
                "jd.pdf",
                _text_pdf(
                    "Job Title: Python Developer\n"
                    "Required Skills:\n- Python\n"
                    "Responsibilities:\n- Build Python services."
                ),
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 200, response.text
    result = response.json()
    assert {
        "message",
        "resume",
        "resume_id",
        "stored_resume_chunks",
        "resume_raw_text",
        "resume_structured",
        "job_description",
        "job_description_raw_text",
        "job_description_structured",
        "overall_score",
        "requirements",
    } <= result.keys()
    assert result["job_description_structured"]["job_title"] == "Python Developer"
    assert result["requirements"][0]["requirement"] == "Python"
