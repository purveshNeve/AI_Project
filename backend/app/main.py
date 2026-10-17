from fastapi import FastAPI
from app.api.routes.analysis import router as analysis_router

app = FastAPI(
    title="Resume Risk Analyzer API",
    version="1.0.0"
)

app.include_router(analysis_router, prefix="/api")


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Resume Risk Analyzer API is running"
    }