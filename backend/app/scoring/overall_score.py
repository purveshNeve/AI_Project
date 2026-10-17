from app.scoring.requirement_scorer import RequirementScore, requirement_terms

_REQUIRED_WEIGHT = 2.0
_PREFERRED_WEIGHT = 1.0
_DUPLICATE_OVERLAP_THRESHOLD = 0.8


def _same_requirement(left: RequirementScore, right: RequirementScore) -> bool:
    left_terms = requirement_terms(left.requirement)
    right_terms = requirement_terms(right.requirement)
    if left.requirement.casefold().strip() == right.requirement.casefold().strip():
        return True
    if not left_terms or not right_terms:
        return False

    categories = {left.category.casefold(), right.category.casefold()}
    if categories <= {"responsibility", "skill", "soft_skill"}:
        overlap = len(left_terms & right_terms) / min(len(left_terms), len(right_terms))
        return (
            min(len(left_terms), len(right_terms)) >= 2
            and overlap >= _DUPLICATE_OVERLAP_THRESHOLD
        )
    return False


def _requirement_groups(
    requirements: list[RequirementScore],
) -> list[list[RequirementScore]]:
    groups: list[list[RequirementScore]] = []
    for requirement in requirements:
        matching_group = next(
            (
                group
                for group in groups
                if any(_same_requirement(requirement, member) for member in group)
            ),
            None,
        )
        if matching_group is None:
            groups.append([requirement])
        else:
            matching_group.append(requirement)
    return groups


def calculate_overall_score(requirements: list[RequirementScore]) -> float:
    """Weighted average of unique requirement scores; required items weigh 2x."""
    if not requirements:
        return 0.0

    weighted_total = 0.0
    total_weight = 0.0
    for group in _requirement_groups(requirements):
        weight = (
            _REQUIRED_WEIGHT
            if any(item.importance == "required" for item in group)
            else _PREFERRED_WEIGHT
        )
        group_score = max(item.score for item in group)
        weighted_total += group_score * weight
        total_weight += weight

    return round(weighted_total / total_weight, 1)
