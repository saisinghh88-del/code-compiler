from fastapi import APIRouter, Depends
from app.models.schemas import ProgressUpdate
from app.services.db_service import DatabaseService
from app.core.security import get_current_user_id

router = APIRouter()

@router.put("/progress/{lesson_id}")
def update_lesson_progress(
    lesson_id: str,
    update: ProgressUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Updates user completion state and saves code snapshot for a lesson."""
    return DatabaseService.update_progress(user_id, lesson_id, update.status, update.last_code)

@router.get("/progress")
def get_user_progress(user_id: str = Depends(get_current_user_id)):
    """Retrieves all completed lessons and learning stats for the authenticated user."""
    return DatabaseService.get_user_progress(user_id)
