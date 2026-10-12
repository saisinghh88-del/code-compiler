from fastapi import APIRouter
from typing import List
from app.models.schemas import LanguageItem
from app.services.db_service import DatabaseService

router = APIRouter()

@router.get("/languages", response_model=List[LanguageItem])
def list_languages():
    """Retrieve supported programming languages and starter templates."""
    return DatabaseService.get_languages()
