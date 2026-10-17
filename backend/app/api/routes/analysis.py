from fastapi import APIRouter, File, HTTPException, UploadFile
from redis.exceptions import RedisError
from starlette.concurrency import run_in_threadpool

from app.api.routes.analysis_services import AnalysisUploadResult, analyze_uploaded_pdfs
from app.processing.jd_parser import (
    InvalidJobDescriptionError,
    JobDescriptionRequirementsError,
)
from app.processing.pdf_parser import PDFParsingError

router = APIRouter(prefix="/analysis", tags=["analysis"])

MAX_FILE_SIZE = 25 * 1024 * 1024
ALLOWED_RESUME_EXTENSIONS = {".pdf"}


async def read_upload(upload: UploadFile, allowed_extensions: set[str]) -> bytes:
    filename = upload.filename or ""
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type for {filename or 'uploaded file'}",
        )

    content = await upload.read(MAX_FILE_SIZE + 1)
    if not content:
        raise HTTPException(status_code=400, detail=f"{filename or 'Uploaded file'} is empty")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail=f"{filename} exceeds the 25 MB limit")
    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail=f"{filename} is not a valid PDF file")
    return content


@router.post("/upload")
async def upload_analysis_files(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
) -> AnalysisUploadResult:
    resume_content = await read_upload(resume, ALLOWED_RESUME_EXTENSIONS)
    job_description_content = await read_upload(job_description, {".pdf"})
    try:
        return await run_in_threadpool(
            analyze_uploaded_pdfs,
            resume_content,
            resume.filename or "",
            job_description_content,
            job_description.filename or "",
        )
    except PDFParsingError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except InvalidJobDescriptionError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error
    except JobDescriptionRequirementsError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error
    except RedisError as error:
        raise HTTPException(
            status_code=503,
            detail="Resume evidence could not be retrieved or stored. Check Redis availability and configuration.",
        ) from error