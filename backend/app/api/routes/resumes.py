import os
from pathlib import Path
from fastapi import HTTPException, Depends
from fastapi.responses import FileResponse
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session , selectinload
from starlette.concurrency import run_in_threadpool
from sqlalchemy import select
from app.db.database import get_db
from app.processing.pdf_parser import PDFParsingError
from app.processing.resume_persistence import persist_uploaded_resume
from app.models.resume import Resume

router = APIRouter(prefix="/resumes", tags=["resumes"])

MAX_FILE_SIZE = 25 * 1024 * 1024


@router.get("/")
def list_resumes(db: Session = Depends(get_db)):
    statement = (
        select(Resume)
        .options(
            selectinload(Resume.skills),
            selectinload(Resume.experiences),
            selectinload(Resume.education),
        )
        .order_by(Resume.created_at.desc(), Resume.id.desc())
    )

    resumes = db.scalars(statement).unique().all()

    return [
        {
            "id": resume.id,
            "full_name": resume.full_name,
            "email": resume.email,
            "phone": resume.phone,
            "linkedin_url": resume.linkedin_url,
            "github_url": resume.github_url,
            "portfolio_url": resume.portfolio_url,
            "location": resume.location,
            "professional_title": resume.professional_title,
            "summary": resume.summary,
            "original_filename": resume.original_filename,
            "created_at": resume.created_at,
            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "category": skill.category,
                }
                for skill in resume.skills
            ],
            "experiences": [
                {
                    "id": item.id,
                    "company": item.company,
                    "job_title": item.job_title,
                    "start_date": item.start_date,
                    "end_date": item.end_date,
                    "description": item.description,
                }
                for item in resume.experiences
            ],
            "education": [
                {
                    "id": item.id,
                    "institution": item.institution,
                    "degree": item.degree,
                    "field_of_study": item.field_of_study,
                    "graduation_year": item.graduation_year,
                }
                for item in resume.education
            ],
        }
        for resume in resumes
    ]

@router.delete("/{resume_id}")
def delete_resume(resume_id: int, db: Session = Depends(get_db)):
    resume = db.get(Resume, resume_id)

    if resume is None:
        raise HTTPException(
            status_code=404,
            detail="Resume not found",
        )

    # Resolve the configured storage directory and target PDF path.
    storage_dir = Path(
        os.getenv(
            "RESUME_STORAGE_DIR",
            str(Path(__file__).resolve().parents[3] / "storage" / "resumes"),
        )
    ).resolve()

    pdf_path = Path(resume.pdf_path).resolve() if resume.pdf_path else None

    # Refuse to delete a file outside the resume storage directory.
    if pdf_path is not None:
        try:
            pdf_path.relative_to(storage_dir)
        except ValueError:
            raise HTTPException(
                status_code=500,
                detail="Resume file path is outside the storage directory",
            )

    try:
        db.delete(resume)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete resume from the database",
        )

    # Delete the PDF only after the database transaction succeeds.
    file_deleted = False
    if pdf_path is not None:
        try:
            if pdf_path.is_file():
                pdf_path.unlink()
                file_deleted = True
        except OSError:
            # The database deletion succeeded, but the PDF remains on disk.
            pass

    return {
        "message": "Resume deleted successfully",
        "resume_id": resume_id,
        "pdf_deleted": file_deleted,
    }


@router.get("/{resume_id}")
def get_resume(resume_id: int, db: Session = Depends(get_db)):
    statement = (
        select(Resume)
        .where(Resume.id == resume_id)
        .options(
            selectinload(Resume.skills),
            selectinload(Resume.experiences),
            selectinload(Resume.education),
        )
    )
    resume = db.scalar(statement)

    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {
        "id": resume.id,
        "full_name": resume.full_name,
        "email": resume.email,
        "phone": resume.phone,
        "linkedin_url": resume.linkedin_url,
        "github_url": resume.github_url,
        "portfolio_url": resume.portfolio_url,
        "location": resume.location,
        "professional_title": resume.professional_title,
        "summary": resume.summary,
        "original_filename": resume.original_filename,
        "created_at": resume.created_at,
        "skills": [
            {"id": skill.id, "name": skill.name, "category": skill.category}
            for skill in resume.skills
        ],
        "experiences": [
            {
                "id": item.id,
                "company": item.company,
                "job_title": item.job_title,
                "start_date": item.start_date,
                "end_date": item.end_date,
                "description": item.description,
            }
            for item in resume.experiences
        ],
        "education": [
            {
                "id": item.id,
                "institution": item.institution,
                "degree": item.degree,
                "field_of_study": item.field_of_study,
                "graduation_year": item.graduation_year,
            }
            for item in resume.education
        ],
    }



@router.get("/{resume_id}/pdf")
def get_resume_pdf(resume_id: int, db: Session = Depends(get_db)):
    resume = db.get(Resume, resume_id)

    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    storage_root = Path(
        os.getenv("RESUME_STORAGE_DIR", "storage/resumes")
    ).resolve()
    pdf_path = Path(resume.pdf_path).resolve()

    # Prevent a database path from exposing files outside resume storage.
    if not pdf_path.is_relative_to(storage_root):
        raise HTTPException(status_code=403, detail="Invalid PDF storage path")

    if not pdf_path.is_file():
        raise HTTPException(status_code=404, detail="Resume PDF file not found")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=Path(resume.original_filename).name,
        content_disposition_type="inline",
    )


@router.post("/upload", status_code=201)
async def upload_resume(
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    filename = Path(resume.filename or "").name

    if Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=415, detail="Upload a PDF file")

    content = await resume.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="PDF exceeds the 25 MB limit")

    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="Invalid PDF file")

    try:
        saved = await run_in_threadpool(
            persist_uploaded_resume,
            db,
            content,
            filename,
        )
    except PDFParsingError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=503,
            detail="Could not save the resume to the database",
        ) from exc
    except Exception as exc:
        # Log the exception server-side before production deployment.
        raise HTTPException(
            status_code=500,
            detail="Could not process the uploaded resume",
        ) from exc

    return {
        "message": "Resume saved successfully",
        "resume_id": saved.id,
        "full_name": saved.full_name,
        "email": saved.email,
        "phone": saved.phone,
        "skills": [skill.name for skill in saved.skills],
        "created_at": saved.created_at,
    }
