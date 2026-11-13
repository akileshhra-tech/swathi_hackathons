from PIL import Image, ImageEnhance, ImageFilter
import io

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """
    Enhances an image to maximize Tesseract OCR character recognition accuracy.
    1. Converts to grayscale.
    2. Upscales low-resolution images.
    3. Increases contrast.
    4. Applies a subtle sharpening filter.
    """
    # 1. Convert to grayscale
    gray = image.convert("L")
    
    # 2. Resize/upscale if image is small (Tesseract performs best around 300 DPI)
    width, height = gray.size
    if width < 1200 or height < 1200:
        scale_factor = 2
        gray = gray.resize((width * scale_factor, height * scale_factor), Image.Resampling.LANCZOS)
        
    # 3. Enhance contrast
    enhancer = ImageEnhance.Contrast(gray)
    enhanced = enhancer.enhance(1.8)
    
    # 4. Sharpen
    sharpened = enhanced.filter(ImageFilter.SHARPEN)
    
    return sharpened
