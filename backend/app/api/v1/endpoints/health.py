from fastapi import APIRouter
from datetime import datetime, timezone
import shutil

from app.core.config import settings

router = APIRouter()

@router.get("/health")
def check_health():
    """Health check endpoint providing status of runtime dependencies and services."""
    has_judge0 = bool(settings.JUDGE0_API_URL and settings.JUDGE0_API_KEY and settings.JUDGE0_API_KEY != "your-judge0-api-key-placeholder")
    has_gemini = bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key-placeholder")
    has_node = bool(shutil.which("node"))
    has_cpp = bool(shutil.which("g++") or shutil.which("clang++"))
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "capabilities": {
            "static_analysis": {
                "python": True,
                "javascript": has_node,
                "cpp": True
            },
            "sandbox_execution": {
                "judge0_remote_api": has_judge0,
                "fallback_local_sandbox": settings.ALLOW_SANDBOX_FALLBACK
            },
            "ai_tutor": {
                "cloud_llm": has_gemini,
                "offline_pedagogical_engine": True
            }
        }
    }
