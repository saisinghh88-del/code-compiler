from typing import Optional
from fastapi import Header, HTTPException, status
import jwt

from app.core.config import settings

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extracts authenticated user ID from Supabase Bearer token or assigns demo user."""
    if not authorization:
        return "demo-learner-001"
        
    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return "demo-learner-001"
            
        token = parts[1]
        
        # If Supabase JWT secret is configured, verify signature
        if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "your-supabase-jwt-secret-placeholder":
            payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
            return payload.get("sub", "demo-learner-001")
            
        # Otherwise decode unverified claims safely for local dev mode
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub", "demo-learner-001")
    except Exception:
        return "demo-learner-001"
