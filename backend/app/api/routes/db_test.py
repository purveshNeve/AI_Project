from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import get_db

router = APIRouter()

@router.get("/db-test")
def test_database(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1")).scalar_one()
    return {
        "database": "connected",
        "result": result,
    }