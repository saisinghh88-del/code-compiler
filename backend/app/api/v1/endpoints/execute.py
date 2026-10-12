from fastapi import APIRouter, HTTPException
from app.models.schemas import ExecutionRequest, ExecutionResponse
from app.services.executor import CodeExecutionService

router = APIRouter()

@router.post("/execute", response_model=ExecutionResponse)
async def execute_code(req: ExecutionRequest):
    """
    Submits code to isolated sandbox execution environment (Judge0 or container sandbox).
    Blocks execution if blocking preflight syntax errors exist.
    """
    if not req.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code cannot be empty.")
        
    return await CodeExecutionService.execute(req)
