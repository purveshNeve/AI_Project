
from pathlib import Path

import redis
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.db.database import get_db
from app.models import AnalysisBatch, BatchResumeResult, Resume
from app.processing.jd_parser import (
    InvalidJobDescriptionError,
    JobDescriptionRequirementsError,
)
from app.processing.pdf_parser import PDFParsingError
from app.processing.batch_analysis_service import create_and_run_batch

router = APIRouter(prefix="/batches", tags=["batch analysis"])

MAX_FILE_SIZE = 25 * 1024 * 1024
MAX_BATCH_SIZE = 50


@router.post("/", status_code=201)
async def submit_batch(
    resume_ids: list[str] = Form(...),
    job_description: UploadFile = File(...),
    db: Session = Depends(get_db),
):
        # Accept IDs as separate values or comma-separated values.
    try:
        parsed_resume_ids = [
            int(item.strip())
            for value in resume_ids
            for item in value.split(",")
            if item.strip()
        ]
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail="resume_ids must contain valid integer IDs, "
                   "for example: 3,6,7,8.",
        )

    if not parsed_resume_ids:
        raise HTTPException(
            status_code=422,
            detail="Select at least one resume ID.",
        )

    resume_ids = parsed_resume_ids
    filename = Path(job_description.filename or "").name

    if Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(
            status_code=415,
            detail="Job description must be a PDF file.",
        )

    if not resume_ids:
        raise HTTPException(
            status_code=422,
            detail="Select at least one saved resume.",
        )

    if len(resume_ids) > MAX_BATCH_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"A batch can contain at most {MAX_BATCH_SIZE} resumes.",
        )

    if len(set(resume_ids)) != len(resume_ids):
        raise HTTPException(
            status_code=422,
            detail="Duplicate resume IDs are not allowed.",
        )

    content = await job_description.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(status_code=400, detail="The PDF is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Job description PDF exceeds the 25 MB limit.",
        )

    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Invalid PDF file.")

    existing_ids = set(
        db.scalars(
            select(Resume.id).where(Resume.id.in_(resume_ids))
        ).all()
    )
    missing_ids = sorted(set(resume_ids) - existing_ids)

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail={"message": "Some resumes were not found.", "resume_ids": missing_ids},
        )

    try:
        return await run_in_threadpool(
            create_and_run_batch,
            db,
            resume_ids,
            content,
            filename,
        )
    except (PDFParsingError, InvalidJobDescriptionError,
            JobDescriptionRequirementsError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except redis.exceptions.RedisError as exc:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="The batch analysis service is temporarily unavailable.",
        ) from exc


@router.get("/")
def list_batches(db: Session = Depends(get_db)):
    batches = db.scalars(
        select(AnalysisBatch).order_by(AnalysisBatch.created_at.desc())
    ).all()

    return [
        {
            "batch_id": batch.id,
            "job_description_filename": batch.job_description_filename,
            "status": batch.status,
            "total_resumes": batch.total_resumes,
            "processed_resumes": batch.processed_resumes,
            "failed_resumes": batch.failed_resumes,
            "created_at": batch.created_at,
            "completed_at": batch.completed_at,
        }
        for batch in batches
    ]


@router.get("/{batch_id}")
def get_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.get(AnalysisBatch, batch_id)

    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found.")

    return {
        "batch_id": batch.id,
        "job_description_filename": batch.job_description_filename,
        "status": batch.status,
        "total_resumes": batch.total_resumes,
        "processed_resumes": batch.processed_resumes,
        "failed_resumes": batch.failed_resumes,
        "created_at": batch.created_at,
        "completed_at": batch.completed_at,
    }


@router.get("/{batch_id}/results")
def get_batch_results(batch_id: int, db: Session = Depends(get_db)):
    batch = db.get(AnalysisBatch, batch_id)

    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found.")

    rows = db.execute(
        select(BatchResumeResult, Resume)
        .join(Resume, BatchResumeResult.resume_id == Resume.id)
        .where(BatchResumeResult.batch_id == batch_id)
    ).all()

    results = [
        {
            "result_id": result.id,
            "resume_id": resume.id,
            "candidate_name": resume.full_name,
            "filename": resume.original_filename,
            "status": result.status,
            "overall_score": result.overall_score,
            "requirements": result.requirements,
            "error_message": result.error_message,
            "completed_at": result.completed_at,
        }
        for result, resume in rows
    ]

    results.sort(
        key=lambda item: (
            item["status"] == "completed",
            item["overall_score"] if item["overall_score"] is not None else -1,
        ),
        reverse=True,
    )

    for rank, result in enumerate(
        (item for item in results if item["status"] == "completed"),
        start=1,
    ):
        result["rank"] = rank

    return {
        "batch_id": batch.id,
        "status": batch.status,
        "results": results,
    }