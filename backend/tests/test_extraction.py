import io
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_sample_pdf() -> bytes:
    """Creates a sample PDF with standard lab test values (Complete Blood Count)."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    text = (
        "METRO DIAGNOSTIC LABS - PATIENT REPORT\n"
        "Patient: Jane Doe | Age: 34 | Gender: Female\n"
        "Date: 2026-11-10 | Referring Dr: Dr. Sharma\n"
        "--------------------------------------------------\n"
        "TEST NAME                    RESULT    REF INTERVAL   UNITS\n"
        "Hemoglobin                   11.2      12.0 - 15.5    g/dL\n"
        "White Blood Cell (WBC)       7,400     4,500 - 11,000 /mcL\n"
        "Platelet Count               210,000   150,000 - 450,000 /mcL\n"
        "Fasting Blood Glucose        108       70 - 99        mg/dL\n"
        "Total Cholesterol            215       < 200          mg/dL\n"
        "Serum Creatinine             0.9       0.5 - 1.1      mg/dL\n"
        "--------------------------------------------------\n"
        "Notes: Mild microcytic anemia picture. Fasting glucose impaired."
    )
    page.insert_text((50, 80), text, fontsize=12)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def create_sample_image() -> bytes:
    """Creates a synthetic image with lab text to test OCR."""
    img = Image.new("RGB", (800, 400), color="white")
    draw = ImageDraw.Draw(img)
    text = (
        "APEX CLINICAL PATHOLOGY\n"
        "Thyroid Profile (TSH): 5.8 uIU/mL (Ref: 0.4 - 4.0 uIU/mL)\n"
        "Serum Calcium: 9.4 mg/dL (Ref: 8.5 - 10.2 mg/dL)\n"
        "Vitamin D3: 18 ng/mL (Ref: 30 - 100 ng/mL)"
    )
    draw.text((30, 50), text, fill="black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def run_tests():
    print("--- 1. Testing PDF Direct Extraction ---")
    pdf_bytes = create_sample_pdf()
    res = client.post(
        "/api/v1/reports/extract",
        files={"file": ("sample_report.pdf", pdf_bytes, "application/pdf")}
    )
    print("Status:", res.status_code)
    data = res.json()
    print("Method:", data.get("method"))
    print("Page Count:", data.get("page_count"))
    assert res.status_code == 200
    assert "Hemoglobin" in data.get("text", "")
    assert data.get("method") == "pdf_direct"
    print("✓ PDF Extraction Passed!")

    print("\n--- 2. Testing Image OCR Extraction ---")
    img_bytes = create_sample_image()
    res_img = client.post(
        "/api/v1/reports/extract",
        files={"file": ("thyroid_scan.png", img_bytes, "image/png")}
    )
    print("Status:", res_img.status_code)
    data_img = res_img.json()
    print("Method:", data_img.get("method"))
    assert res_img.status_code == 200
    assert data_img.get("method") == "image_ocr"
    print("Extracted Text Preview:\n", data_img.get("text", "")[:150])
    print("✓ Image OCR Extraction Passed!")

if __name__ == "__main__":
    run_tests()
