import re

from pydantic import BaseModel

from app.processing.text_cleaner import parse_sections, split_items

RESUME_SECTION_HEADINGS = {
    "summary": {"summary", "professional summary", "profile", "objective"},
    "skills": {"skills", "technical skills", "core competencies", "technologies"},
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment history",
    },
    "education": {"education", "academic background"},
    "certifications": {"certifications", "certificates", "licenses"},
    "projects": {"projects", "personal projects"},
}


class ResumeContact(BaseModel):
    email: str | None
    phone: str | None


class ParsedResume(BaseModel):
    contact: ResumeContact
    skills: list[str]
    sections: dict[str, list[str]]


def parse_resume_text(raw_text: str) -> ParsedResume:
    sections = parse_sections(raw_text, RESUME_SECTION_HEADINGS)
    email_match = re.search(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", raw_text, re.I)
    phone_match = re.search(r"(?<!\w)\+?\d[\d().\-\s]{7,}\d(?!\w)", raw_text)

    return ParsedResume(
        contact=ResumeContact(
            email=email_match.group(0) if email_match else None,
            phone=phone_match.group(0).strip() if phone_match else None,
        ),
        skills=split_items(sections.get("skills", [])),
        sections=sections,
    )