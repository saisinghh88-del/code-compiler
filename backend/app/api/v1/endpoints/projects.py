from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models.schemas import ProjectResponse, ProjectCreate
from app.services.db_service import DatabaseService
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/projects", response_model=List[ProjectResponse])
def list_user_projects(user_id: str = Depends(get_current_user_id)):
    """Retrieve user's private and public saved code projects."""
    return DatabaseService.get_projects(user_id)

@router.post("/projects", response_model=ProjectResponse)
def save_project(data: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    """Save an editor project to the database."""
    return DatabaseService.create_project(user_id, data)

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, user_id: str = Depends(get_current_user_id)):
    """Retrieve a specific saved code project by ID."""
    proj = DatabaseService.get_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    if not proj.is_public and proj.user_id != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized to view this private project.")
    return proj
