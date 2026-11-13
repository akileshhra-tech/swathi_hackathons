from fastapi import APIRouter
from app.core.config import settings
import shutil

router = APIRouter()

@router.get("/health")
def health_check():
    tesseract_available = bool(shutil.which("tesseract") or shutil.which(settings.TESSERACT_CMD))
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tesseract_installed": tesseract_available,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY)
    }
