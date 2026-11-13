from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
from app.core.config import settings
from app.api.v1.reports_analyze import analyze_report_upload
from app.api.router import api_router
from app.schemas.analysis import ReportAnalysisResponse

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ReportSaathi API - Medical laboratory report extraction and plain-language explanation engine."
)

# CORS Middleware (React frontend on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standard Health-check endpoints
@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    tesseract_available = bool(shutil.which("tesseract") or shutil.which(settings.TESSERACT_CMD))
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tesseract_available": tesseract_available,
        "supported_formats": [".pdf", ".jpg", ".jpeg", ".png"],
        "max_upload_size_mb": 10
    }

# Primary requested endpoint: POST /api/reports/analyze
@app.post("/api/reports/analyze", response_model=ReportAnalysisResponse, tags=["Analysis"])
async def api_analyze_report(file: UploadFile = File(...)):
    return await analyze_report_upload(file=file)

# Include v1 versioned routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to ReportSaathi API. Visit /docs for Swagger documentation.",
        "analyze_endpoint": "/api/reports/analyze",
        "health_endpoint": "/api/health"
    }
