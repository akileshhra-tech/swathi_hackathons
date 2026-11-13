from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.extractor_service import extractor_service
from app.services.gemini_service import gemini_service
from app.schemas.report import ReportAnalysisResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
MAX_FILE_SIZE_MB = 15

@router.post("/extract")
async def extract_report_text(file: UploadFile = File(...)):
    """
    Extracts raw text from an uploaded laboratory report (PDF or Image).
    Tests the hybrid extraction pipeline (PyMuPDF direct extraction + Tesseract OCR fallback).
    """
    filename = file.filename or "unknown_file"
    ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds maximum allowed size ({MAX_FILE_SIZE_MB}MB)")
        
    try:
        extraction_result = extractor_service.extract_document(content, filename)
        if not extraction_result["text"].strip():
            return {
                "success": False,
                "detail": "No readable text could be extracted. Please ensure the document is clear and properly oriented.",
                **extraction_result
            }
            
        return {
            "success": True,
            **extraction_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@router.post("/analyze", response_model=ReportAnalysisResponse)
async def analyze_report(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    language: str = Form("English")
):
    """
    Full pipeline:
    1. Extracts text from PDF or Image using PyMuPDF / Tesseract OCR (or uses provided raw_text).
    2. Runs Gemini AI medical explanation model.
    3. Returns structured, compassionate plain-language biomarker explanations.
    """
    extracted_text = ""
    source_method = "manual_text"
    page_count = 1

    if file and file.filename:
        filename = file.filename
        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'.")
        
        content = await file.read()
        if len(content) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large.")

        extraction = extractor_service.extract_document(content, filename)
        extracted_text = extraction.get("text", "")
        source_method = extraction.get("method", "extracted")
        page_count = extraction.get("page_count", 1)
    elif raw_text and raw_text.strip():
        extracted_text = raw_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Please upload a report file or provide report text.")

    if not extracted_text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in the document to analyze.")

    analysis = gemini_service.analyze_report(extracted_text, language=language)
    analysis.source_method = source_method
    analysis.page_count = page_count
    return analysis
