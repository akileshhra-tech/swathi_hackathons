from fastapi import APIRouter, UploadFile, File, HTTPException
import time
from app.services.document_processor import document_processor
from app.services.gemini_service import gemini_service
from app.schemas.analysis import ReportAnalysisResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/analyze", response_model=ReportAnalysisResponse)
async def analyze_report_upload(file: UploadFile = File(...)):
    """
    Accepts PDF, JPG, or PNG upload.
    1. Validates file type and size.
    2. Uses safe temporary-file handling with guaranteed cleanup.
    3. Extracts text via PyMuPDF or Tesseract OCR.
    4. Analyzes text using Gemini API (or grounded engine) with strict separation of facts and AI explanations.
    5. Flags missing reference ranges and unclear reports without fabricating medical data.
    """
    start_time = time.time()
    
    if not file or not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was attached to the request. Please upload a PDF, PNG, or JPG document."
        )

    filename = file.filename
    content = await file.read()
    file_size = len(content)

    # 1. Validate file extension and size safely
    content_type = file.content_type or "application/octet-stream"
    document_processor.validate_upload(filename, file_size, content_type)

    # 2. Extract text with safe temporary file creation and guaranteed cleanup
    extraction = document_processor.process_file_safely(content, filename)
    extracted_text = extraction.get("text", "")

    # 3. Process via Gemini API (or grounded validator)
    analysis_result, was_gemini_live = gemini_service.analyze_report(extracted_text)

    elapsed_ms = round((time.time() - start_time) * 1000)

    # Determine status
    if not analysis_result.is_report_clear:
        outcome_status = "unclear_report"
        message_desc = "Document extracted, but text was too brief, blurry, or fragmented to establish full clinical context."
    else:
        outcome_status = "success"
        engine_name = "Gemini 2.5 Flash" if was_gemini_live else "Grounded Fallback Engine"
        message_desc = f"Processed {filename} via {extraction.get('extraction_method')} and {engine_name} in {elapsed_ms}ms."

    return ReportAnalysisResponse(
        status=outcome_status,
        message=message_desc,
        filename=filename,
        file_type=content_type,
        file_size_bytes=file_size,
        extraction_method=extraction.get("extraction_method", "unprocessed"),
        page_count=extraction.get("page_count", 1),
        character_count=len(extracted_text),
        extracted_text=extracted_text,
        gemini_live_used=was_gemini_live,
        is_report_clear=analysis_result.is_report_clear,
        clarity_warning=analysis_result.clarity_warning,
        overall_summary=analysis_result.overall_summary,
        detected_biomarkers=analysis_result.biomarkers,
        doctor_questions=analysis_result.doctor_questions
    )
