import re


def parse_sections(text: str, heading_aliases: dict[str, set[str]]) -> dict[str, list[str]]:
    heading_lookup = {
        alias.casefold(): section
        for section, aliases in heading_aliases.items()
        for alias in aliases
    }
    sections: dict[str, list[str]] = {"header": []}
    current_section = "header"

    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if not line:
            continue

        heading, separator, remainder = line.partition(":")
        section = heading_lookup.get(heading.strip().casefold())
        if section is None:
            section = heading_lookup.get(line.casefold())
            remainder = ""
            separator = ""

        if section is not None:
            current_section = section
            sections.setdefault(current_section, [])
            content = remainder.strip() if separator else ""
            if content:
                sections[current_section].append(content)
            continue

        sections.setdefault(current_section, []).append(line)

    return {
        section: lines
        for section, lines in sections.items()
        if lines
    }


def split_items(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        items.extend(
            item.strip(" \t•-*·")
            for item in re.split(r"[,;|]", line)
            if item.strip(" \t•-*·")
        )
    return items