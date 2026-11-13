import os
import tempfile
import fitz  # PyMuPDF
from PIL import Image, UnidentifiedImageError
import io
from typing import Dict, Any, Tuple
from fastapi import HTTPException
from app.services.ocr_service import ocr_service
from app.utils.image_cleanup import preprocess_image_for_ocr

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf", 
    "image/png", 
    "image/jpeg", 
    "image/jpg",
    "application/octet-stream" # some clients omit explicit mime
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

class DocumentProcessor:
    @staticmethod
    def validate_upload(filename: str, file_size: int, content_type: str = "") -> str:
        """
        Validates file extension and size. Returns lowercased extension.
        Raises descriptive HTTPException on invalid files.
        """
        if not filename:
            raise HTTPException(
                status_code=400,
                detail="Missing filename. Please upload a valid document."
            )

        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            allowed_list = ", ".join(sorted(ALLOWED_EXTENSIONS))
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Only {allowed_list} files are permitted."
            )

        if file_size == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty (0 bytes). Please select a valid document."
            )

        if file_size > MAX_FILE_SIZE_BYTES:
            size_mb = round(file_size / (1024 * 1024), 2)
            raise HTTPException(
                status_code=413,
                detail=f"File size ({size_mb} MB) exceeds maximum allowed limit of 10 MB."
            )

        return ext

    @classmethod
    def process_file_safely(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Writes file to a secure temporary file, extracts text via PyMuPDF or Tesseract OCR,
        and ensures temporary file cleanup in a guaranteed finally block.
        """
        ext = cls.validate_upload(filename, len(file_bytes))
        
        # Safe temporary file creation
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_path = temp_file.name

        try:
            temp_file.write(file_bytes)
            temp_file.flush()
            temp_file.close()

            if ext == ".pdf":
                return cls._extract_pdf(temp_path)
            else:
                return cls._extract_image(temp_path)

        finally:
            # Guaranteed cleanup of disk temp files
            if os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass

    @classmethod
    def _extract_pdf(cls, file_path: str) -> Dict[str, Any]:
        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"The PDF file is corrupted, encrypted, or cannot be opened: {str(e)}"
            )

        total_pages = len(doc)
        if total_pages == 0:
            doc.close()
            raise HTTPException(
                status_code=422,
                detail="The PDF file contains 0 pages."
            )

        full_text = []
        is_scanned = False

        # Attempt direct digital extraction
        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            if page_text:
                full_text.append(f"--- Page {page_idx + 1} ---\n{page_text}")

        combined_text = "\n\n".join(full_text).strip()

        # If extracted text is under 40 chars per page, it is likely a scanned/photocopied PDF
        if len(combined_text) < 40 * total_pages:
            is_scanned = True
            ocr_pages = []

            for page_idx in range(total_pages):
                page = doc[page_idx]
                # Render to high-resolution pixmap (~180 DPI) for OCR fidelity
                pix = page.get_pixmap(dpi=180)
                img_bytes = pix.tobytes("png")
                page_ocr = ocr_service.extract_text_from_image(img_bytes)
                if page_ocr.strip():
                    ocr_pages.append(f"--- Page {page_idx + 1} (OCR) ---\n{page_ocr.strip()}")

            combined_text = "\n\n".join(ocr_pages).strip()

        doc.close()

        if not combined_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text could be extracted from this PDF. The document may be blank or contain unreadable imagery."
            )

        return {
            "text": combined_text,
            "page_count": total_pages,
            "character_count": len(combined_text),
            "extraction_method": "scanned_pdf_ocr" if is_scanned else "native_pdf_direct"
        }

    @classmethod
    def _extract_image(cls, file_path: str) -> Dict[str, Any]:
        try:
            with Image.open(file_path) as img:
                # Verify image can be parsed
                img.verify()
        except UnidentifiedImageError:
            raise HTTPException(
                status_code=422,
                detail="The file is not a valid or recognized image. Please upload a clear JPG or PNG file."
            )
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to read image file: {str(e)}"
            )

        # Reopen for actual processing (verify() empties file pointer in PIL)
        with open(file_path, "rb") as f:
            raw_bytes = f.read()

        text = ocr_service.extract_text_from_image(raw_bytes)
        clean_text = text.strip()

        if not clean_text or len(clean_text) < 5:
            raise HTTPException(
                status_code=422,
                detail="No readable text detected in the image. Please ensure good lighting, avoid motion blur, and verify text is legible."
            )

        return {
            "text": clean_text,
            "page_count": 1,
            "character_count": len(clean_text),
            "extraction_method": "image_ocr"
        }

document_processor = DocumentProcessor()
