from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.analyzer import StaticAnalysisEngine

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_code(req: AnalysisRequest):
    """
    Executes pre-execution static analysis and syntax validation.
    Returns normalized diagnostics for Python, JavaScript, and C++.
    """
    if not req.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty.")
        
    return StaticAnalysisEngine.analyze(req.language, req.source_code)
