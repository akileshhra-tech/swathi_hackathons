import pytesseract
from PIL import Image
import io
import os
import shutil
from app.core.config import settings
from app.utils.image_cleanup import preprocess_image_for_ocr

# Configure Tesseract binary path
if shutil.which("tesseract"):
    pytesseract.pytesseract.tesseract_cmd = "tesseract"
elif os.path.exists(settings.TESSERACT_CMD):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

class OCRService:
    @staticmethod
    def extract_text_from_image(image_bytes: bytes, lang: str = "eng") -> str:
        """
        Extracts raw text from an image (PNG, JPEG, WebP) using PIL and Tesseract OCR.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))
            processed_image = preprocess_image_for_ocr(image)
            
            # OCR configuration:
            # --psm 6: Assume a single uniform block of text
            # --oem 3: Default LSTM engine
            custom_config = r'--oem 3 --psm 6'
            text = pytesseract.image_to_string(processed_image, lang=lang, config=custom_config)
            
            # Fallback to automatic page segmentation if result is too brief
            if len(text.strip()) < 10:
                text = pytesseract.image_to_string(processed_image, lang=lang)
                
            return text.strip()
        except Exception as e:
            raise RuntimeError(f"OCR extraction failed: {str(e)}")

ocr_service = OCRService()
