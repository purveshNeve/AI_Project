from uuid import uuid4

from pydantic import BaseModel

from app.processing.chunker import chunk_text
from app.processing.jd_parser import (
    JDRequirement,
    ParsedJobDescription,
    parse_job_description_text,
)
from app.processing.pdf_parser import extract_text_from_pdf
from app.processing.resume_parser import ParsedResume, parse_resume_text
from app.retrieval.retriever import RetrievedChunk, retrieve_relevant_chunks
from app.retrieval.vector_store import store_resume_chunks
from app.scoring.overall_score import calculate_overall_score
from app.scoring.requirement_scorer import RequirementScore, score_requirement


class UploadedFileInfo(BaseModel):
    filename: str
    size: int


class AnalysisUploadResult(BaseModel):
    message: str
    resume: UploadedFileInfo
    resume_id: str
    stored_resume_chunks: int
    resume_raw_text: str
    resume_structured: ParsedResume
    job_description: UploadedFileInfo
    job_description_raw_text: str
    job_description_structured: ParsedJobDescription
    overall_score: float
    requirements: list[RequirementScore]


def _get_jd_requirements(parsed_jd: ParsedJobDescription) -> list[JDRequirement]:
    if parsed_jd.requirements:
        requirements: list[JDRequirement] = []
        seen: set[tuple[str, str, str, str | None]] = set()
        for requirement in parsed_jd.requirements:
            key = (
                requirement.text.strip().casefold(),
                requirement.category,
                requirement.importance,
                requirement.role_group,
            )
            if key not in seen:
                seen.add(key)
                requirements.append(requirement)
        return requirements

    section_categories = {
        "skills": "skill",
        "responsibilities": "responsibility",
        "qualifications": "qualification",
        "experience": "experience",
        "education": "education",
        "work_environment": "work_environment",
    }
    legacy_requirements: list[JDRequirement] = []
    seen_text: set[str] = set()
    candidates = [
        ("skill", skill)
        for skill in parsed_jd.required_skills
    ]
    candidates.extend(
        (section_categories[section], line)
        for section in section_categories
        for line in parsed_jd.sections.get(section, [])
    )
    for category, candidate in candidates:
        text = candidate.strip().lstrip("-*•‣▪◦0123456789.) ").strip()
        if text and text.casefold() not in seen_text:
            seen_text.add(text.casefold())
            legacy_requirements.append(
                JDRequirement(text=text, category=category)
            )
    return legacy_requirements


def analyze_uploaded_pdfs(
    resume_content: bytes,
    resume_filename: str,
    job_description_content: bytes,
    job_description_filename: str,
) -> AnalysisUploadResult:
    resume_raw_text = extract_text_from_pdf(resume_content)
    job_description_raw_text = extract_text_from_pdf(job_description_content)
    parsed_jd = parse_job_description_text(job_description_raw_text)
    resume_id = uuid4().hex
    resume_chunks = chunk_text(resume_raw_text)
    stored_resume_chunks = store_resume_chunks(resume_id, resume_chunks)
    requirements: list[RequirementScore] = []

    for requirement in _get_jd_requirements(parsed_jd):
        evidence: list[RetrievedChunk] = retrieve_relevant_chunks(
            requirement.text,
            resume_id,
        )
        requirements.append(score_requirement(requirement, evidence))

    overall_score = calculate_overall_score(requirements)

    return AnalysisUploadResult(
        message="Resume and job description analyzed; resume embeddings stored in Redis",
        resume=UploadedFileInfo(filename=resume_filename, size=len(resume_content)),
        resume_id=resume_id,
        stored_resume_chunks=stored_resume_chunks,
        resume_raw_text=resume_raw_text,
        resume_structured=parse_resume_text(resume_raw_text),
        job_description=UploadedFileInfo(
            filename=job_description_filename,
            size=len(job_description_content),
        ),
        job_description_raw_text=job_description_raw_text,
        job_description_structured=parsed_jd,
        overall_score=overall_score,
        requirements=requirements,
    )