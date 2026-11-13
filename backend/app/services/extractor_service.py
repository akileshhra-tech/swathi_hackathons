import fitz  # PyMuPDF
from PIL import Image
import io
from typing import Dict, Any, Tuple
from app.services.ocr_service import ocr_service

class DocumentExtractorService:
    @staticmethod
    def extract_from_pdf(pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Hybrid PDF extraction:
        1. Fast text extraction using PyMuPDF.
        2. If extracted text is minimal (<50 characters per page average), falls back to page rendering + OCR.
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        total_pages = len(doc)
        full_text = []
        is_scanned_fallback = False

        # Attempt direct text extraction
        for page_idx in range(total_pages):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            if page_text:
                full_text.append(f"--- Page {page_idx + 1} ---\n{page_text}")

        extracted_content = "\n\n".join(full_text).strip()

        # Check if the document appears to be a scanned document (image-only PDF)
        if len(extracted_content) < 50 * total_pages:
            is_scanned_fallback = True
            ocr_text_pages = []
            
            for page_idx in range(total_pages):
                page = doc[page_idx]
                # Render page at 2x resolution (~144-200 DPI) for OCR clarity
                pix = page.get_pixmap(dpi=180)
                img_bytes = pix.tobytes("png")
                page_ocr_text = ocr_service.extract_text_from_image(img_bytes)
                if page_ocr_text:
                    ocr_text_pages.append(f"--- Page {page_idx + 1} (OCR) ---\n{page_ocr_text}")
                    
            extracted_content = "\n\n".join(ocr_text_pages).strip()

        doc.close()

        return {
            "text": extracted_content,
            "page_count": total_pages,
            "method": "pdf_ocr_fallback" if is_scanned_fallback else "pdf_direct",
            "is_scanned": is_scanned_fallback
        }

    @classmethod
    def extract_document(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Routes the file to appropriate extraction pipeline based on file extension.
        """
        lower_name = filename.lower()
        if lower_name.endswith(".pdf"):
            res = cls.extract_from_pdf(file_bytes)
            res["filename"] = filename
            res["file_type"] = "application/pdf"
            return res
        elif any(lower_name.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp"]):
            text = ocr_service.extract_text_from_image(file_bytes)
            return {
                "text": text,
                "page_count": 1,
                "method": "image_ocr",
                "is_scanned": True,
                "filename": filename,
                "file_type": "image"
            }
        else:
            raise ValueError(f"Unsupported file format for {filename}. Supported formats: PDF, PNG, JPG, JPEG, WEBP.")

extractor_service = DocumentExtractorService()
