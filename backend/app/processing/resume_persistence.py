
import os
from pathlib import Path
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import Education, Experience, Resume, ResumeSkill
from app.processing.pdf_parser import (
    extract_links_from_pdf,
    extract_text_from_pdf,
)
from app.processing.resume_parser import parse_resume_text


def persist_uploaded_resume(
    db: Session,
    pdf_content: bytes,
    original_filename: str,
) -> Resume:
    """Parse a resume and persist its metadata and original PDF."""

    # Extract resume text and clickable links embedded in the PDF.
    raw_text = extract_text_from_pdf(pdf_content)
    pdf_links = extract_links_from_pdf(pdf_content)
    parsed = parse_resume_text(raw_text, pdf_links=pdf_links)

    # Resolve the storage directory and create it if necessary.
    storage_root = Path(
        os.getenv("RESUME_STORAGE_DIR", "storage/resumes")
    ).resolve()
    storage_root.mkdir(parents=True, exist_ok=True)

    # Generate a server-controlled filename instead of trusting user input.
    stored_path = (storage_root / f"{uuid4().hex}.pdf").resolve()

    if not stored_path.is_relative_to(storage_root):
        raise ValueError("Invalid resume storage path")

    # Store the original PDF on disk, not in PostgreSQL.
    stored_path.write_bytes(pdf_content)

    try:
        # Extract a likely name from the first non-empty line.
        # This is a heuristic and may need refinement for other layouts.
        lines = [
            line.strip()
            for line in raw_text.splitlines()
            if line.strip()
        ]
        full_name = lines[0][:200] if lines else None

        # Create the main candidate record.
        resume = Resume(
            full_name=full_name,
            email=parsed.contact.email,
            phone=parsed.contact.phone,
            linkedin_url=parsed.linkedin_url,
            github_url=parsed.github_url,
            portfolio_url=parsed.portfolio_url,
            location=parsed.location,
            professional_title=parsed.professional_title,
            summary=(
                " ".join(parsed.sections.get("summary", [])).strip()
                or None
            ),
            original_filename=Path(original_filename).name[:255],
            pdf_path=str(stored_path),
        )

        db.add(resume)
        db.flush()  # Generate the actual PostgreSQL resume ID.

        # Save skills, avoiding duplicates within this resume.
        seen_skills: set[str] = set()

        for skill in parsed.skills:
            cleaned_skill = skill.strip()
            normalized_skill = cleaned_skill.casefold()

            if cleaned_skill and normalized_skill not in seen_skills:
                seen_skills.add(normalized_skill)
                db.add(
                    ResumeSkill(
                        resume_id=resume.id,
                        name=cleaned_skill,
                    )
                )

        # Save structured work experience.
        for item in parsed.experience_entries:
            if not any(
                [
                    item.company,
                    item.job_title,
                    item.start_date,
                    item.end_date,
                    item.description,
                ]
            ):
                continue

            db.add(
                Experience(
                    resume_id=resume.id,
                    company=item.company,
                    job_title=item.job_title,
                    start_date=item.start_date,
                    end_date=item.end_date,
                    description=item.description,
                )
            )

        # Save structured education.
        for item in parsed.education_entries:
            if not any(
                [
                    item.institution,
                    item.degree,
                    item.field_of_study,
                    item.graduation_year,
                    item.details,
                ]
            ):
                continue

            db.add(
                Education(
                    resume_id=resume.id,
                    institution=item.institution,
                    degree=item.degree,
                    field_of_study=item.field_of_study,
                    graduation_year=item.graduation_year,
                )
            )

        db.commit()
        db.refresh(resume)

        return resume

    except Exception:
        db.rollback()

        # Remove the PDF if saving the database records fails.
        stored_path.unlink(missing_ok=True)
        raise
