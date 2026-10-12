from fastapi import APIRouter, HTTPException
from app.models.schemas import AITutorRequest, AITutorResponse
from app.services.ai_tutor import AITutorService

router = APIRouter()

@router.post("/ai/tutor", response_model=AITutorResponse)
async def tutor_assistant(req: AITutorRequest):
    """
    AI Coding Tutor service:
    - Explains static-analysis diagnostics and root causes
    - Generates progressive hints (Levels 1, 2, 3)
    - Suggests minimal surgical fixes
    - Provides line-by-line breakdown of code
    """
    if not req.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty.")
        
    return await AITutorService.process_request(req)
