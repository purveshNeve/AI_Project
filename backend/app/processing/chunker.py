import logging
import re
from typing import TypedDict

from app.ai.embeddings import embed_texts

_SECTION_ALIASES = {
    "Summary": {
        "summary",
        "professional summary",
        "profile",
        "objective",
    },
    "Skills": {
        "skills",
        "technical skills",
        "core competencies",
        "technologies",
    },
    "Experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment history",
    },
    "Education": {"education", "academic background"},
    "Certifications": {"certifications", "certificates", "licenses"},
    "Projects": {"projects", "personal projects"},
    "Work Environment": {
        "work environment",
        "general work environment",
        "work arrangement",
        "working conditions",
    },
    "General": {
        "job title",
        "position",
        "role",
        "about the role",
        "job overview",
        "responsibilities",
        "what you will do",
        "duties",
        "qualifications",
        "requirements",
        "what you bring",
        "required skills",
        "experience requirements",
        "education requirements",
        "awards",
        "publications",
        "volunteer experience",
        "languages",
        "interests",
    },
}
_HEADING_TO_SECTION = {
    alias: section
    for section, aliases in _SECTION_ALIASES.items()
    for alias in aliases
}
SECTION_HEADINGS = set(_HEADING_TO_SECTION)
BULLET_PATTERN = re.compile(r"^\s*(?:[-*•‣▪◦]|\d+[.)])\s+")
SENTENCE_PATTERN = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9])")
LIST_SEPARATOR_PATTERN = re.compile(r"\s*[,;|]\s*")
_PROJECT_ACTION_STARTS = {
    "built",
    "created",
    "developed",
    "designed",
    "implemented",
    "managed",
    "led",
    "launched",
    "delivered",
    "improved",
    "reduced",
    "increased",
    "used",
    "using",
    "engineered",
    "automated",
    "analyzed",
    "integrated",
    "deployed",
    "maintained",
    "supported",
    "contributed",
    "enabled",
    "provided",
    "configured",
    "migrated",
    "owned",
    "coordinated",
    "streamlined",
    "optimized",
    "collaborated",
    "performed",
    "conducted",
    "achieved",
    "established",
    "facilitated",
}
_LOGGER = logging.getLogger(__name__)


class SemanticChunk(TypedDict):
    chunk_id: str
    text: str
    section: str
    source: str
    original_text: str
    content_type: str
    embedding: list[float]


class _SemanticUnit(TypedDict):
    section: str
    text: str
    source: str
    original_text: str
    content_type: str


def _heading_and_content(line: str) -> tuple[str | None, str]:
    candidate = line.strip().lstrip("#").strip()
    heading, separator, content = candidate.partition(":")
    section = _HEADING_TO_SECTION.get(heading.strip().casefold())

    if section is not None:
        return section, content.strip() if separator else ""
    if not separator:
        section = _HEADING_TO_SECTION.get(candidate.casefold())
        if section is not None:
            return section, ""
    return None, line.strip()


def _expand_inline_headings(line: str) -> list[str]:
    aliases = sorted(_HEADING_TO_SECTION, key=len, reverse=True)
    pattern = re.compile(
        r"(?<!\w)(" + "|".join(re.escape(alias) for alias in aliases) + r")(?=\s*:|\s|$)",
        re.IGNORECASE,
    )
    matches: list[tuple[int, int, str]] = []
    for match in pattern.finditer(line):
        heading = match.group(0)
        remainder = line[match.end():]
        colon = re.match(r"\s*:", remainder)
        if heading.isupper() or colon:
            end = match.end() + colon.end() if colon else match.end()
            matches.append((match.start(), end, line[match.start():end].strip()))

    if not matches:
        return [line]

    parts: list[str] = []
    cursor = 0
    for index, (start, end, heading) in enumerate(matches):
        prefix = line[cursor:start].strip()
        if prefix:
            parts.append(prefix)
        next_start = matches[index + 1][0] if index + 1 < len(matches) else len(line)
        content = line[end:next_start].strip()
        parts.append(heading)
        if content:
            parts.append(content)
        cursor = next_start
    suffix = line[cursor:].strip()
    if suffix:
        parts.append(suffix)
    return parts


def _is_project_title(text: str) -> bool:
    candidate = text.strip().lstrip("#").strip()
    if candidate.startswith("**") and candidate.endswith("**"):
        return True
    title = candidate.rstrip(":").strip()
    if len(title.split()) > 7 or re.search(r"[.!?]$", title):
        return False
    return not re.match(
        r"^(?:built|created|developed|designed|implemented|managed|led|"
        r"launched|delivered|improved|reduced|increased|used|using)\b",
        title,
        re.IGNORECASE,
    )


def _project_parts(text: str) -> tuple[str | None, str | None]:
    candidate = BULLET_PATTERN.sub("", text.strip()).strip()
    title, separator, description = candidate.partition(":")
    if separator and len(title.split()) <= 8 and description.strip():
        return title.strip(), description.strip()
    if _is_project_title(candidate) and not BULLET_PATTERN.match(text):
        return candidate, None
    return None, None


def is_indexable_text(
    text: str,
    section: str,
    content_type: str | None = None,
) -> bool:
    text = text.strip()
    if not text or not re.search(r"[A-Za-z]", text):
        return False
    if content_type == "project_title":
        return False

    normalized = re.sub(r"[^a-z0-9+#]+", " ", text.casefold()).strip()
    heading = normalized in _HEADING_TO_SECTION
    if heading:
        return False

    if section.casefold() == "projects":
        words = normalized.split()
        if (
            len(words) <= 7
            and not re.search(r"[.!?]", text)
            and (not words or words[0] not in _PROJECT_ACTION_STARTS)
            and "\n" not in text
        ):
            return False
    return True


def is_indexable_chunk(chunk: SemanticChunk) -> bool:
    return is_indexable_text(
        chunk["text"],
        chunk["section"],
        chunk.get("content_type"),
    )


def _semantic_units(text: str) -> list[_SemanticUnit]:
    units: list[_SemanticUnit] = []
    section = "General"
    current_lines: list[str] = []
    current_line_numbers: list[int] = []
    project_title: str | None = None
    project_title_line: int | None = None
    project_lines: list[str] = []
    project_line_numbers: list[int] = []

    def append_unit(
        unit_text: str,
        original_text: str,
        start_line: int,
        end_line: int,
        content_type: str,
    ) -> None:
        meaningful_text = re.sub(r"[\W_]+", "", unit_text, flags=re.UNICODE)
        if not meaningful_text or not re.search(r"[A-Za-z]", unit_text):
            return
        units.append(
            {
                "section": section,
                "text": unit_text,
                "source": f"lines {start_line}-{end_line}",
                "original_text": original_text,
                "content_type": content_type,
            }
        )

    def flush_project() -> None:
        nonlocal project_title, project_title_line
        if project_title is None:
            return
        details = "\n".join(project_lines).strip()
        if details:
            original = "\n".join([project_title, *project_lines])
            append_unit(
                "\n".join([project_title, *project_lines]).strip(),
                original,
                project_title_line or project_line_numbers[0],
                project_line_numbers[-1],
                "project",
            )
        project_title = None
        project_title_line = None
        project_lines.clear()
        project_line_numbers.clear()

    def flush() -> None:
        if not current_lines:
            return
        original_text = "\n".join(current_lines).strip()
        body = re.sub(r"\s+", " ", original_text)
        if body:
            content_type = {
                "Skills": "skill",
                "Summary": "summary",
            }.get(section, "evidence")
            statements = [
                statement.strip()
                for statement in SENTENCE_PATTERN.split(body)
                if statement.strip()
            ]
            for statement in statements:
                items = (
                    [
                        item.strip()
                        for item in LIST_SEPARATOR_PATTERN.split(statement)
                        if item.strip()
                    ]
                    if section == "Skills"
                    else [statement]
                )
                for item in items:
                    append_unit(
                        item,
                        original_text,
                        current_line_numbers[0],
                        current_line_numbers[-1],
                        content_type,
                    )
        current_lines.clear()
        current_line_numbers.clear()

    for line_number, raw_line in enumerate(text.splitlines(), start=1):
        for line in _expand_inline_headings(raw_line):
            stripped_line = line.strip()
            if not stripped_line:
                if section == "Projects":
                    if project_lines:
                        flush_project()
                else:
                    flush()
                continue

            heading, content = _heading_and_content(stripped_line)
            if heading is not None:
                flush()
                flush_project()
                section = heading
                if content:
                    if section == "Projects":
                        title, description = _project_parts(content)
                        if title is not None:
                            project_title = title
                            project_title_line = line_number
                            if description:
                                project_lines.append(description)
                                project_line_numbers.append(line_number)
                            continue
                    current_lines.append(content)
                    current_line_numbers.append(line_number)
                continue

            if section == "Projects":
                title, description = _project_parts(stripped_line)
                if title is not None:
                    flush_project()
                    project_title = title
                    project_title_line = line_number
                    if description:
                        project_lines.append(description)
                        project_line_numbers.append(line_number)
                    continue
                if project_title is not None:
                    project_lines.append(stripped_line)
                    project_line_numbers.append(line_number)
                    continue

            if BULLET_PATTERN.match(stripped_line):
                flush()
                current_lines.append(stripped_line)
                current_line_numbers.append(line_number)
                continue

            current_lines.append(stripped_line)
            current_line_numbers.append(line_number)

    flush()
    flush_project()
    return units


def chunk_text(text: str) -> list[SemanticChunk]:
    units = _semantic_units(text)
    if not units:
        return []

    for unit in units:
        _LOGGER.debug(
            "Resume chunk before embedding: section=%s source=%s text=%r",
            unit["section"],
            unit["source"],
            unit["text"],
        )

    embedding_inputs = [f"{unit['section']}: {unit['text']}" for unit in units]
    embeddings = embed_texts(embedding_inputs)
    if len(embeddings) != len(units):
        raise ValueError("Embedding model returned an unexpected number of vectors.")

    return [
        {
            "chunk_id": f"chunk-{index:04d}",
            "text": unit["text"],
            "section": unit["section"],
            "source": unit["source"],
            "original_text": unit["original_text"],
            "content_type": unit["content_type"],
            "embedding": embedding,
        }
        for index, (unit, embedding) in enumerate(
            zip(units, embeddings, strict=True),
            start=1,
        )
    ]
