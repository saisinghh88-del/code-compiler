from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import CourseItem, QuizAnswerSubmit, QuizAnswerResult
from app.services.db_service import DatabaseService

router = APIRouter()

@router.get("/courses", response_model=List[CourseItem])
def list_courses():
    """Retrieve all published learning paths and curriculum modules."""
    return DatabaseService.get_courses()

@router.get("/courses/{slug}", response_model=CourseItem)
def get_course(slug: str):
    """Retrieve detailed course information with module lessons and quizzes."""
    course = DatabaseService.get_course_by_slug(slug)
    if not course:
        raise HTTPException(status_code=404, detail=f"Course '{slug}' not found.")
    return course

@router.post("/courses/{slug}/quiz", response_model=QuizAnswerResult)
def submit_quiz_answer(slug: str, submission: QuizAnswerSubmit):
    """Validates student quiz answer and provides immediate explanation."""
    return DatabaseService.verify_quiz(submission.quiz_id, submission.selected_option_index)
