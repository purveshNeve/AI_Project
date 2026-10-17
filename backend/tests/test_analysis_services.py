from app.api.routes.analysis_services import _get_jd_requirements
from app.processing.jd_parser import parse_job_description_text


def test_analysis_service_consumes_local_parser_output() -> None:
    parsed = parse_job_description_text(
        "Required Skills:\n"
        "- Python\n"
        "Responsibilities:\n"
        "- Develop REST APIs.\n"
    )

    requirements = _get_jd_requirements(parsed)

    assert [
        (item.text, item.category, item.importance)
        for item in requirements
    ] == [
        ("Python", "skill", "required"),
        ("Develop REST APIs.", "responsibility", "required"),
    ]
    assert parsed.required_skills == ["Python", "REST APIs"]
