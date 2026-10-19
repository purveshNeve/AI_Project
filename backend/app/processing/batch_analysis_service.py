
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AnalysisBatch, BatchResumeResult, Resume
from app.processing.chunker import chunk_text
from app.processing.jd_parser import (
    JobDescriptionRequirementsError,
    InvalidJobDescriptionError,
    parse_job_description_text,
)
from app.processing.pdf_parser import extract_text_from_pdf
from app.retrieval.retriever import retrieve_relevant_chunks
from app.retrieval.vector_store import store_resume_chunks
from app.scoring.overall_score import calculate_overall_score
from app.scoring.requirement_scorer import score_requirement
from app.api.routes.analysis_services import _get_jd_requirements


def create_and_run_batch(
    db: Session,
    resume_ids: list[int],
    jd_content: bytes,
    jd_filename: str,
) -> dict:
    """Analyze saved resumes against one job description."""

    if not resume_ids:
        raise ValueError("Select at least one saved resume.")

    if len(set(resume_ids)) != len(resume_ids):
        raise ValueError("Duplicate resume IDs are not allowed.")

    jd_text = extract_text_from_pdf(jd_content)
    parsed_jd = parse_job_description_text(jd_text)
    requirements = _get_jd_requirements(parsed_jd)

    if not requirements:
        raise JobDescriptionRequirementsError(
            "No job requirements could be extracted from this PDF."
        )

    resumes = db.scalars(
        select(Resume).where(Resume.id.in_(resume_ids))
    ).all()
    resume_by_id = {resume.id: resume for resume in resumes}
    missing_ids = sorted(set(resume_ids) - set(resume_by_id))

    if missing_ids:
        raise ValueError(f"Resume IDs not found: {missing_ids}")

    batch = AnalysisBatch(
        job_description_filename=Path(jd_filename).name[:255],
        job_description_text=jd_text,
        status="processing",
        total_resumes=len(resume_ids),
        processed_resumes=0,
        failed_resumes=0,
    )
    db.add(batch)
    db.flush()

    # Commit the batch record before processing so failures can be recorded.
    db.commit()
    db.refresh(batch)

    for resume_id in resume_ids:
        resume = resume_by_id[resume_id]
        result = BatchResumeResult(
            batch_id=batch.id,
            resume_id=resume.id,
            status="processing",
        )
        db.add(result)
        db.commit()
        db.refresh(result)

        try:
            pdf_path = Path(resume.pdf_path).resolve()
            if not pdf_path.is_file():
                raise FileNotFoundError("Stored resume PDF was not found.")

            resume_text = extract_text_from_pdf(pdf_path.read_bytes())
            chunks = chunk_text(resume_text)

            # Unique per batch and resume, preventing cross-candidate key reuse.
            redis_resume_id = f"batch-{batch.id}-resume-{resume.id}-{uuid4().hex}"
            stored_count = store_resume_chunks(redis_resume_id, chunks)
            if stored_count == 0:
                 raise ValueError(
                    "No indexable text was found in this resume."
                )
            scores = []
            for requirement in requirements:
                evidence = retrieve_relevant_chunks(
                    requirement.text,
                    redis_resume_id,
                )
                scores.append(score_requirement(requirement, evidence))

            result.overall_score = calculate_overall_score(scores)
            result.requirements = [
                score.model_dump(mode="json") for score in scores
            ]
            result.status = "completed"
            result.error_message = None
            result.completed_at = datetime.now(timezone.utc)
            batch.processed_resumes += 1

        except Exception as exc:
            result.status = "failed"
            result.error_message = str(exc)[:2000]
            result.completed_at = datetime.now(timezone.utc)
            batch.failed_resumes += 1

        db.commit()

    batch.status = (
        "completed"
        if batch.failed_resumes == 0
        else "completed_with_errors"
    )
    batch.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(batch)

    return {
        "batch_id": batch.id,
        "status": batch.status,
        "total_resumes": batch.total_resumes,
        "processed_resumes": batch.processed_resumes,
        "failed_resumes": batch.failed_resumes,
    }
