$ErrorActionPreference = "Stop"

$python = Join-Path $PSScriptRoot "venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    throw "Backend Python environment not found at '$python'."
}

Set-Location $PSScriptRoot
& $python -m uvicorn app.main:app --host 127.0.0.1 --port 8010 --reload
exit $LASTEXITCODE
