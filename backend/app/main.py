from fastapi import FastAPI
from app.api.routes.analysis import router as analysis_router
from app.api.routes import db_test
from app.api.routes.resumes import router as resumes_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="Resume Risk Analyzer API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(db_test.router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Resume Risk Analyzer API is running"
    }