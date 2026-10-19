
import re

from pydantic import BaseModel, Field

from app.processing.text_cleaner import parse_sections, split_items


RESUME_SECTION_HEADINGS = {
    "summary": {"summary", "professional summary", "profile", "objective"},
    "skills": {
        "skills",
        "technical skills",
        "core competencies",
        "technologies",
    },
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
    email: str | None = None
    phone: str | None = None


class EducationEntry(BaseModel):
    degree: str | None = None
    field_of_study: str | None = None
    institution: str | None = None
    graduation_year: str | None = None
    start_year: str | None = None
    end_year: str | None = None
    details: str | None = None


class ExperienceEntry(BaseModel):
    company: str | None = None
    job_title: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None


class ParsedResume(BaseModel):
    contact: ResumeContact
    skills: list[str] = Field(default_factory=list)
    sections: dict[str, list[str]] = Field(default_factory=dict)
    education_entries: list[EducationEntry] = Field(default_factory=list)
    experience_entries: list[ExperienceEntry] = Field(default_factory=list)

    linkedin_url: str | None = None
    github_url: str | None = None
    portfolio_url: str | None = None
    location: str | None = None
    professional_title: str | None = None


# Common degree labels. Extend as you encounter additional formats.
DEGREE_PATTERN = re.compile(
    r"\b("
    r"B\.?\s*Tech\.?|B\.?\s*E\.?|B\.?\s*Sc\.?|B\.?\s*C\.?\s*A\.?|"
    r"B\.?\s*Com\.?|BBA|BCA|M\.?\s*Tech\.?|M\.?\s*E\.?|"
    r"M\.?\s*Sc\.?|M\.?\s*C\.?\s*A\.?|MBA|Ph\.?\s*D\.?|"
    r"Master(?:'s)?|Bachelor(?:'s)?|Diploma"
    r")\b",
    re.IGNORECASE,
)

YEAR_RANGE_PATTERN = re.compile(
    r"\b((?:19|20)\d{2})\s*[-–—]\s*"
    r"((?:19|20)\d{2}|Present|Current)\b",
    re.IGNORECASE,
)

DATE_RANGE_PATTERN = re.compile(
    r"\b("
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
    r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
    r"Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}|(?:19|20)\d{2}"
    r")\s*[-–—]\s*("
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
    r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
    r"Nov(?:ember)?|Dec(?:ember)?)\.?\s+\d{4}|"
    r"(?:19|20)\d{2}|Present|Current"
    r")\b",
    re.IGNORECASE,
)

URL_PATTERN = re.compile(
    r"(?:https?://|www\.)[^\s<>\"']+",
    re.IGNORECASE,
)


def _clean_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip(" \t•*-|")


def _year_range(line: str) -> tuple[str | None, str | None]:
    match = YEAR_RANGE_PATTERN.search(line)
    if not match:
        return None, None

    return match.group(1), match.group(2)


def _date_range(line: str) -> tuple[str | None, str | None]:
    match = DATE_RANGE_PATTERN.search(line)
    if not match:
        return None, None

    return match.group(1).strip(), match.group(2).strip()


def _parse_education(lines: list[str]) -> list[EducationEntry]:
    entries: list[EducationEntry] = []
    pending: EducationEntry | None = None

    for raw_line in lines:
        line = _clean_line(raw_line)
        if not line:
            continue

        start_year, end_year = _year_range(line)
        degree_match = DEGREE_PATTERN.search(line)

        if degree_match:
            if pending:
                entries.append(pending)

            degree = degree_match.group(0).strip()
            before = line[:degree_match.start()].strip(" :-,")
            after = line[degree_match.end():].strip(" :-,|")

            after = YEAR_RANGE_PATTERN.sub("", after).strip(" :-,|")
            after = re.sub(r"^in\s+", "", after, flags=re.IGNORECASE)
            after = re.sub(
                r"\b(?:CGPA|GPA|Grade)\b.*$",
                "",
                after,
                flags=re.IGNORECASE,
            ).strip(" :-,|")

            pending = EducationEntry(
                degree=degree,
                field_of_study=after or None,
                start_year=start_year,
                end_year=end_year,
                graduation_year=(
                    end_year
                    if end_year and end_year.isdigit()
                    else None
                ),
                details=before or None,
            )
            continue

        # A following line commonly contains the institution and grades.
        if pending and not pending.institution:
            institution_line = re.sub(
                r"\b(?:CGPA|GPA|Grade)\b.*$",
                "",
                line,
                flags=re.IGNORECASE,
            ).strip(" :-,|")
            institution_line = YEAR_RANGE_PATTERN.sub(
                "",
                institution_line,
            ).strip()

            if institution_line:
                pending.institution = institution_line
                continue

        if pending:
            pending.details = (
                f"{pending.details}; {line}"
                if pending.details
                else line
            )

    if pending:
        entries.append(pending)

    # Preserve any text preceding the degree as a tentative institution.
    for entry in entries:
        if entry.details and not entry.institution:
            entry.institution = entry.details
            entry.details = None

    return entries


def _parse_experience(lines: list[str]) -> list[ExperienceEntry]:
    entries: list[ExperienceEntry] = []
    pending: ExperienceEntry | None = None

    for raw_line in lines:
        line = _clean_line(raw_line)
        if not line:
            continue

        start_date, end_date = _date_range(line)

        if start_date and end_date:
            if pending:
                entries.append(pending)

            company = DATE_RANGE_PATTERN.sub("", line).strip(" :-,|")
            pending = ExperienceEntry(
                company=company or None,
                start_date=start_date,
                end_date=end_date,
            )
            continue

        if pending is None:
            pending = ExperienceEntry()

        if not pending.job_title and not line.startswith(("•", "-", "*")):
            pending.job_title = line
        else:
            pending.description = (
                f"{pending.description}\n{line}"
                if pending.description
                else line
            )

    if pending:
        entries.append(pending)

    return entries


def _normalize_url(url: str) -> str:
    url = url.strip().rstrip(".,;)")
    if url.lower().startswith("www."):
        url = "https://" + url
    return url


def _classify_links(
    raw_text: str,
    pdf_links: list[str] | None = None,
) -> dict[str, str | None]:
    candidates = list(pdf_links or [])
    candidates.extend(URL_PATTERN.findall(raw_text))

    result: dict[str, str | None] = {
        "linkedin_url": None,
        "github_url": None,
        "portfolio_url": None,
    }

    for candidate in candidates:
        url = _normalize_url(candidate)
        lower = url.lower()

        if "linkedin.com/" in lower:
            key = "linkedin_url"
        elif "github.com/" in lower:
            key = "github_url"
        else:
            key = "portfolio_url"

        if result[key] is None:
            result[key] = url

    return result


def _extract_location(header_text: str) -> str | None:
    # Supports common formats such as "Mumbai, India".
    match = re.search(
        r"\b([A-Z][A-Za-z .'-]+,\s*[A-Z][A-Za-z .'-]+)\b",
        header_text,
    )
    return match.group(1).strip() if match else None


def _extract_professional_title(
    sections: dict[str, list[str]],
) -> str | None:
    # Avoid treating the candidate's name as their professional title.
    summary_lines = sections.get("summary", [])
    if not summary_lines:
        return None

    first_line = _clean_line(summary_lines[0])
    if not first_line:
        return None

    # This is only a heuristic. A summary sentence isn't always a job title.
    if len(first_line) <= 100 and not first_line.endswith((".", ";")):
        return first_line

    return None


def parse_resume_text(
    raw_text: str,
    pdf_links: list[str] | None = None,
) -> ParsedResume:
    sections = parse_sections(raw_text, RESUME_SECTION_HEADINGS)

    email_match = re.search(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        raw_text,
        re.IGNORECASE,
    )
    phone_match = re.search(
        r"(?<!\w)\+?\d[\d().\-\s]{7,}\d(?!\w)",
        raw_text,
    )

    links = _classify_links(raw_text, pdf_links)
    header_text = " ".join(sections.get("header", []))

    return ParsedResume(
        contact=ResumeContact(
            email=email_match.group(0) if email_match else None,
            phone=phone_match.group(0).strip() if phone_match else None,
        ),
        skills=split_items(sections.get("skills", [])),
        sections=sections,
        education_entries=_parse_education(
            sections.get("education", [])
        ),
        experience_entries=_parse_experience(
            sections.get("experience", [])
        ),
        linkedin_url=links["linkedin_url"],
        github_url=links["github_url"],
        portfolio_url=links["portfolio_url"],
        location=_extract_location(header_text),
        professional_title=_extract_professional_title(sections),
    )
