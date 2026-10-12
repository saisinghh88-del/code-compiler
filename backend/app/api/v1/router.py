from fastapi import APIRouter

from app.api.v1.endpoints import (
    health,
    languages,
    courses,
    analyze,
    execute,
    ai_tutor,
    projects,
    problems,
    submissions,
    progress
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(languages.router, tags=["Languages"])
api_router.include_router(courses.router, tags=["Courses & Lessons"])
api_router.include_router(analyze.router, tags=["Static Analysis"])
api_router.include_router(execute.router, tags=["Code Execution"])
api_router.include_router(ai_tutor.router, tags=["AI Tutor"])
api_router.include_router(projects.router, tags=["User Projects"])
api_router.include_router(problems.router, tags=["Challenges & Submissions"])
api_router.include_router(submissions.router, tags=["Submissions"])
api_router.include_router(progress.router, tags=["Learning Progress"])
