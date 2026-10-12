import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeMaster AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    
    # Judge0 Code Execution
    JUDGE0_API_URL: str = "https://judge0-ce.p.rapidapi.com"
    JUDGE0_API_KEY: str = ""
    JUDGE0_API_HOST: str = "judge0-ce.p.rapidapi.com"
    ALLOW_SANDBOX_FALLBACK: bool = True
    MAX_EXECUTION_TIME_SECONDS: float = 5.0
    MAX_MEMORY_KB: int = 128000
    
    # AI Tutor
    AI_PROVIDER: str = "gemini" # gemini or openai
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    AI_MODEL_NAME: str = "gemini-1.5-flash"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
