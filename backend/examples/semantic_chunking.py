from app.processing.chunker import chunk_text

sample_resume_text = """\
Professional Summary:
Backend engineer experienced in reliable API design and cloud deployment.

Skills:
- Python and FastAPI
- PostgreSQL and Docker

Experience:
Designed and maintained distributed services for a healthcare platform.
"""

for chunk in chunk_text(sample_resume_text):
    print(
        f"{chunk['chunk_id']} | {chunk['section']} | "
        f"{chunk['text']} | embedding dimensions: {len(chunk['embedding'])}"
    )
