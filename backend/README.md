# Resume Risk Analyzer backend

## Starting the backend

From PowerShell, run `.\start_backend.ps1` in the `backend` directory. This
starts the API on `http://127.0.0.1:8010` with reload enabled.

The backend script uses the `backend\venv` Python environment. Create that
environment and install `requirements.txt` first if it is missing.

## Job description parsing

Job descriptions are extracted with the shared PyMuPDF PDF reader and parsed
locally using deterministic section, requirement, skill, and experience
recognition. JD parsing does not call an LLM or external AI API. Scanned or
image-only job-description PDFs need OCR before upload; OCR is not included.

## Resume requirement scoring

Each extracted JD requirement is scored independently against retrieved resume
text. The requirement response retains `requirement`, `score`, `match_level`,
and `supporting_evidence`; it also includes its extracted `category` and
`importance`, a machine-readable `status`, and an `evidence_status`.
`similarity_score` remains retrieval metadata and is never used as the
requirement score.

## Deterministic formula

For each requirement, the scorer normalizes meaningful words in its text and
each retrieved resume excerpt. It computes each excerpt's coverage as:

`100 * (distinct requirement terms present in the excerpt / distinct requirement terms)`

For experience requirements with an explicit minimum number of years, meeting
that duration is one additional criterion in the denominator. Its coverage is
the stated resume duration divided by the requirement, capped at 100%; an
unstated duration contributes zero. The resume must state a duration at least
as large as the stated minimum for that criterion to count as met. Matching
category-relevant resume sections break coverage ties; embedding similarity is
only a final ordering tie-breaker.

The best non-contradictory excerpt determines the requirement score, rounded to
one decimal place. Coverage of at least 80% is `matched` unless an explicit
experience-duration criterion remains unmet; positive coverage that does not
meet all criteria is `partially_matched`; zero coverage is
`not_demonstrated`. Retrieved excerpts with no meaningful term overlap are not
returned as supporting evidence, except when they explicitly state an
experience duration. Explicitly negated evidence is reported separately as
`contradicting_evidence` and `evidence_status: "contradicted"`; no retrieved
evidence is reported as `"not_found"` and does not imply the candidate lacks
the qualification.

The overall score is the weighted mean of requirement scores. A required
requirement has weight 2; preferred and unspecified requirements have weight
1. Exact duplicate requirements are counted once. Semantically close skill,
soft-skill, and responsibility requirements with at least two terms and at
least 80% term overlap are grouped; each group contributes its highest score
once, at required weight if any member is required, otherwise preferred
weight. An empty requirement set scores 0.

This transparent lexical method is deliberately conservative but does not
understand every synonym, paraphrase, credential equivalence, date range, or
negation. Retrieval and scoring remain constrained by extracted PDF text and
the existing vector search; the result is a document-evidence score, not a
conclusion that a candidate lacks a capability.