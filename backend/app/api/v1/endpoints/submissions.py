from fastapi import APIRouter, HTTPException
from app.models.schemas import ProblemSubmissionResponse
from app.services.db_service import DatabaseService

router = APIRouter()

@router.get("/submissions/{submission_id}", response_model=ProblemSubmissionResponse)
def get_submission_results(submission_id: str):
    """Retrieve detailed execution results for a challenge submission."""
    submission = DatabaseService.get_submission(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission record not found.")
    return submission
