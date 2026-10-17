import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class InvalidJobDescriptionError(ValueError):
    """The JD PDF has no extractable text."""


class JobDescriptionRequirementsError(ValueError):
    """The JD text contains no identifiable requirements."""


RequirementCategory = Literal[
    "responsibility",
    "qualification",
    "skill",
    "soft_skill",
    "experience",
    "education",
    "work_environment",
    "general",
]
RequirementImportance = Literal["required", "preferred", "unspecified"]


class JDRequirement(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    text: str
    category: RequirementCategory
    importance: RequirementImportance = "unspecified"
    role_group: str | None = None


class ParsedJobDescription(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    job_title: str | None = None
    requirements: list[JDRequirement] = Field(default_factory=list)
    required_skills: list[str] = Field(default_factory=list)
    minimum_experience_years: int | None = None
    sections: dict[str, list[str]] = Field(default_factory=dict)


SECTION_ALIASES = {
    "job_title": {
        "job title",
        "position",
        "role",
    },
    "responsibilities": {
        "responsibilities",
        "duties",
        "what you will do",
        "what you ll do",
        "what you ll be doing",
        "key responsibilities",
        "your responsibilities",
    },
    "required_skills": {
        "required skills",
        "must have",
        "must haves",
        "essential skills",
    },
    "requirements": {
        "requirements",
        "required",
        "what you bring",
        "what we re looking for",
    },
    "skills": {
        "skills",
        "technical skills",
        "technical requirements",
        "core competencies",
        "technologies",
    },
    "preferred_skills": {
        "preferred skills",
        "preferred qualifications",
        "nice to have",
        "nice to haves",
        "desired skills",
        "bonus points",
    },
    "qualifications": {
        "qualifications",
        "minimum qualifications",
        "required qualifications",
        "education and qualifications",
    },
    "education": {
        "education",
        "educational background",
        "academic qualifications",
        "degree requirements",
    },
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "experience requirements",
        "years of experience",
    },
    "soft_skills": {
        "soft skills",
        "interpersonal skills",
        "personal qualities",
    },
    "work_environment": {
        "work environment",
        "working environment",
        "work arrangement",
        "working conditions",
    },
    "benefits": {
        "benefits",
        "perks",
        "what we offer",
        "compensation and benefits",
    },
}
_HEADING_TO_SECTION = {
    re.sub(r"[^a-z0-9]+", " ", alias.casefold()).strip(): section
    for section, aliases in SECTION_ALIASES.items()
    for alias in aliases
}

SKILL_KEYWORDS = (
    "JavaScript",
    "TypeScript",
    "Problem-solving",
    "REST APIs",
    "Communication",
    "Teamwork",
    "FastAPI",
    "Flask",
    "Python",
    "React",
    "Redis",
    "Docker",
    "Java",
    "SQL",
    "Git",
)
_SKILL_PATTERNS = tuple(
    (
        skill,
        re.compile(
            r"(?<!\w)"
            + re.escape(skill).replace(r"\-", r"[\s-]")
            + r"(?!\w)",
            re.I,
        ),
    )
    for skill in SKILL_KEYWORDS
)

_BULLET_PREFIX = re.compile(r"^\s*(?:[-*•‣▪◦●○]|\d+[.)])\s*")
_PAGE_NUMBER = re.compile(
    r"^(?:page\s+)?\d+(?:\s+of\s+\d+)?$|^page\s+\d+\s*(?:of\s+\d+)?$",
    re.I,
)
_FOOTER_ARTIFACT = re.compile(
    r"(?:\ball rights reserved\b|\bcopyright\b|\bconfidential\b|"
    r"\bequal opportunity employer\b|^(?:www\.|https?://))",
    re.I,
)
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")
_EXPERIENCE_RANGE = re.compile(
    r"(?<!\d)(\d+)\s*(?:-|–|—|to)\s*\d+\s*(?:years?|yrs?)\b",
    re.I,
)
_EXPERIENCE_MINIMUM = re.compile(
    r"\b(?:at\s+least|minimum(?:\s+of)?|no\s+less\s+than)\s+(\d+)"
    r"\s*(?:\+|or\s+more)?\s*(?:years?|yrs?)\b",
    re.I,
)
_EXPERIENCE_PLUS = re.compile(r"\b(\d+)\s*\+\s*(?:years?|yrs?)\b", re.I)
_EXPERIENCE_STATED = re.compile(
    r"\b(\d+)\s*(?:years?|yrs?)\s+(?:of\s+)?experience\b",
    re.I,
)
_REQUIRED_WORDING = re.compile(
    r"\b(?:required|must(?:\s+have|\s+be)?|minimum|at\s+least|"
    r"need(?:s)?\s+to|mandatory)\b",
    re.I,
)
_PREFERRED_WORDING = re.compile(
    r"\b(?:preferred|ideally|nice\s+to\s+have|desired|a\s+plus|"
    r"bonus|desirable)\b",
    re.I,
)
_ACTION_OR_REQUIREMENT = re.compile(
    r"\b(?:experience|proficien(?:t|cy)|knowledge|ability|skilled|"
    r"familiar|degree|bachelor|master|certification|responsible|"
    r"develop|build|design|implement|manage|lead|support|deliver|"
    r"communicat|collaborat|work with|must|required|minimum|"
    r"at least|years?\s+of\s+experience)\b",
    re.I,
)
_TITLE_WORDING = re.compile(
    r"\b(?:engineer|developer|programmer|architect|analyst|manager|"
    r"designer|scientist|specialist|consultant|administrator|director|"
    r"officer|technician|coordinator|lead|recruiter|accountant|"
    r"researcher|nurse|intern|product owner)\b",
    re.I,
)


def _normalize_jd_text(raw_text: str) -> list[str]:
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", text)
    lines: list[str] = []
    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        line = line.strip("\ufeff\u200b")
        if not line or _PAGE_NUMBER.fullmatch(line) or _FOOTER_ARTIFACT.search(line):
            continue
        line = re.sub(r"^[#]+\s*", "", line)
        bullet = bool(_BULLET_PREFIX.match(line))
        line = _BULLET_PREFIX.sub("", line).strip()
        if line:
            lines.append(f"- {line}" if bullet else line)
    return lines


def _heading(line: str) -> tuple[str | None, str]:
    candidate = line.strip(" :#\t")
    heading_text = candidate
    remainder = ""

    if ":" in candidate:
        heading_text, remainder = candidate.split(":", 1)
    else:
        dash_match = re.match(r"^(.{1,50}?)\s+[–—-]\s+(.+)$", candidate)
        if dash_match:
            possible_heading = re.sub(
                r"[^a-z0-9]+", " ", dash_match.group(1).casefold()
            ).strip()
            if possible_heading in _HEADING_TO_SECTION:
                heading_text, remainder = dash_match.groups()

    normalized = re.sub(r"[^a-z0-9]+", " ", heading_text.casefold()).strip()
    section = _HEADING_TO_SECTION.get(normalized)
    if section is None and not remainder:
        section = _HEADING_TO_SECTION.get(
            re.sub(r"[^a-z0-9]+", " ", candidate.casefold()).strip()
        )
    return section, remainder.strip()


def _collect_sections(lines: list[str]) -> tuple[dict[str, list[str]], str | None]:
    sections: dict[str, list[str]] = {"header": []}
    active_section = "header"
    pending_title = False
    job_title: str | None = None

    for line in lines:
        heading_line = line[2:] if line.startswith("- ") else line
        section, remainder = _heading(heading_line)
        if section is not None:
            if section == "job_title":
                active_section = "header"
                title_candidate = remainder.strip(" -–—:")
                if title_candidate:
                    job_title = title_candidate
                    sections.setdefault("job_title", []).append(title_candidate)
                    pending_title = False
                else:
                    pending_title = True
                continue

            active_section = section
            sections.setdefault(section, [])
            pending_title = False
            if remainder:
                sections[section].append(remainder)
            continue

        clean_line = line.strip()
        if pending_title and active_section == "header":
            job_title = clean_line
            sections.setdefault("job_title", []).append(clean_line)
            pending_title = False
            continue

        sections.setdefault(active_section, []).append(clean_line)

    return (
        {section: values for section, values in sections.items() if values},
        job_title,
    )


def _infer_job_title(header_lines: list[str]) -> str | None:
    for line in header_lines:
        candidate = line.strip(" -–—:")
        if (
            len(candidate) <= 100
            and len(candidate.split()) <= 12
            and not re.search(r"[.!?]", candidate)
            and _TITLE_WORDING.search(candidate)
        ):
            return candidate
    return None


def _requirement_category(text: str, section: str) -> RequirementCategory:
    section_category: dict[str, RequirementCategory] = {
        "responsibilities": "responsibility",
        "required_skills": "skill",
        "skills": "skill",
        "preferred_skills": "skill",
        "education": "education",
        "experience": "experience",
        "soft_skills": "soft_skill",
        "work_environment": "work_environment",
    }
    if section in section_category:
        return section_category[section]
    is_generic_requirement_section = section in {"requirements", "qualifications"}
    if re.search(r"\b(?:years?|yrs?)\s+(?:of\s+)?experience\b|\bexperience\b", text, re.I):
        return "experience"
    if re.search(r"\b(?:degree|bachelor|master|phd|education|certification)\b", text, re.I):
        return "education"
    if re.search(r"\b(?:communicat|teamwork|collaborat|problem.solving)\w*\b", text, re.I):
        return "soft_skill"
    if re.match(
        r"^(?:develop|build|design|implement|manage|lead|support|deliver|"
        r"maintain|create|coordinate|analyze|analyse)\b",
        text,
        re.I,
    ):
        return "responsibility"
    if any(pattern.search(text) for _, pattern in _SKILL_PATTERNS):
        return "skill"
    if is_generic_requirement_section:
        return "qualification"
    return "general"


def _requirement_importance(text: str, section: str) -> RequirementImportance:
    if section == "preferred_skills" or _PREFERRED_WORDING.search(text):
        return "preferred"
    if section in {
        "requirements",
        "required_skills",
        "responsibilities",
    } or _REQUIRED_WORDING.search(text):
        return "required"
    return "unspecified"


def _is_requirement(text: str, section: str, is_bullet: bool) -> bool:
    if len(text) < 3 or not re.search(r"[A-Za-z]", text):
        return False
    if section == "benefits" or section == "job_title":
        return False
    if section in {
        "requirements",
        "required_skills",
        "responsibilities",
        "skills",
        "preferred_skills",
        "qualifications",
        "education",
        "experience",
        "soft_skills",
        "work_environment",
    }:
        return True
    return is_bullet or bool(_ACTION_OR_REQUIREMENT.search(text))


def _split_skill_list(text: str, section: str) -> list[str]:
    if section not in {
        "requirements",
        "required_skills",
        "skills",
        "preferred_skills",
    }:
        return [text]
    parts = [
        part.strip(" ,;|")
        for part in re.split(r"\s*[,;|]\s*|\s+and\s+", text, flags=re.I)
        if part.strip(" ,;|")
    ]
    if len(parts) > 1 and all(
        any(pattern.search(part) for _, pattern in _SKILL_PATTERNS)
        for part in parts
    ):
        return parts
    return [text]


def _minimum_experience_years(lines: list[str], sections: dict[str, list[str]]) -> int | None:
    candidates: list[int] = []
    for section, section_lines in sections.items():
        if section == "preferred_skills":
            continue
        for line in section_lines:
            if _PREFERRED_WORDING.search(line):
                continue
            for pattern in (
                _EXPERIENCE_RANGE,
                _EXPERIENCE_MINIMUM,
                _EXPERIENCE_PLUS,
                _EXPERIENCE_STATED,
            ):
                candidates.extend(int(match.group(1)) for match in pattern.finditer(line))
    if not candidates:
        for line in lines:
            if _PREFERRED_WORDING.search(line):
                continue
            match = _EXPERIENCE_RANGE.search(line) or _EXPERIENCE_MINIMUM.search(line)
            if match:
                candidates.append(int(match.group(1)))
    return min(candidates) if candidates else None


def _extract_skills(requirements: list[JDRequirement]) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for requirement in requirements:
        if requirement.importance != "required":
            continue
        for skill, pattern in _SKILL_PATTERNS:
            if pattern.search(requirement.text) and skill.casefold() not in seen:
                seen.add(skill.casefold())
                found.append(skill)
    return found


def parse_job_description_text(raw_text: str) -> ParsedJobDescription:
    """Parse extracted job-description text without network or model calls."""
    if not isinstance(raw_text, str) or not raw_text.strip():
        raise InvalidJobDescriptionError(
            "The job-description PDF contains no extractable text. "
            "Scanned or image-only PDFs require OCR before analysis."
        )

    lines = _normalize_jd_text(raw_text)
    if not lines:
        raise InvalidJobDescriptionError(
            "The job-description PDF contains no extractable text. "
            "Scanned or image-only PDFs require OCR before analysis."
        )

    sections, job_title = _collect_sections(lines)
    if job_title is None:
        job_title = _infer_job_title(sections.get("header", []))

    candidates: list[tuple[str, str, bool]] = []
    for section, section_lines in sections.items():
        for source_line in section_lines:
            is_bullet = bool(_BULLET_PREFIX.match(source_line))
            for sentence in _SENTENCE_SPLIT.split(source_line):
                candidate = sentence.strip(" \t-*•‣▪◦")
                if _is_requirement(candidate, section, is_bullet):
                    candidates.extend(
                        (part, section, is_bullet)
                        for part in _split_skill_list(candidate, section)
                    )

    requirements: list[JDRequirement] = []
    seen: set[str] = set()
    for text, section, _ in candidates:
        normalized = re.sub(r"\s+", " ", text).strip()
        key = normalized.casefold()
        if key in seen:
            continue
        seen.add(key)
        requirements.append(
            JDRequirement(
                text=normalized,
                category=_requirement_category(normalized, section),
                importance=_requirement_importance(normalized, section),
            )
        )

    if not requirements:
        raise JobDescriptionRequirementsError(
            "No job requirements could be identified in the extracted text. "
            "Check that the PDF contains a job description with requirements."
        )

    return ParsedJobDescription(
        job_title=job_title,
        requirements=requirements,
        required_skills=_extract_skills(requirements),
        minimum_experience_years=_minimum_experience_years(lines, sections),
        sections=sections,
    )
