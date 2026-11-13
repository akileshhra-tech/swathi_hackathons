import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False
    )

    PROJECT_NAME: str = "ReportSaathi Backend"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # AI - Gemini
    GEMINI_API_KEY: str = ""
    
    # Supabase (Optional for guest mode)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    
    # OCR
    TESSERACT_CMD: str = "/opt/homebrew/bin/tesseract"

settings = Settings()
