import io
import os
import tempfile
import fitz
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_sample_pdf() -> bytes:
    """Creates a sample PDF with Hemoglobin, Glucose, and Cholesterol."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    text = (
        "APEX CLINICAL DIAGNOSTICS - PATIENT LAB REPORT\n"
        "Patient: Meera Kapoor | Age: 44 | Sex: Female | ID: AK-7819\n"
        "Date: 12-Nov-2026 | Ref: Dr. K. Mehta\n"
        "----------------------------------------------------------------------\n"
        "TEST NAME                    OBSERVED    FLAG   REF INTERVAL   UNITS\n"
        "Hemoglobin (Hb)              10.8        L      12.0 - 15.5    g/dL\n"
        "White Blood Cell (WBC)       6,900              4,500 - 11,000 /mcL\n"
        "Platelet Count               215,000            150,000-450,000/mcL\n"
        "Fasting Blood Glucose        118         H      70 - 99        mg/dL\n"
        "Total Cholesterol            225         H      < 200          mg/dL\n"
        "Serum Creatinine             0.88               0.60 - 1.10    mg/dL\n"
        "----------------------------------------------------------------------\n"
        "Impression: Mild hypochromic anemia picture. Impaired fasting glucose."
    )
    page.insert_text((40, 60), text, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def create_sample_png() -> bytes:
    """Creates a synthetic PNG image to test Tesseract OCR."""
    img = Image.new("RGB", (700, 300), color="white")
    draw = ImageDraw.Draw(img)
    text = (
        "METROPOLIS HEALTH LABS\n"
        "Thyroid Profile (TSH): 5.8 uIU/mL (Ref: 0.4 - 4.0 uIU/mL)\n"
        "Serum Calcium: 9.4 mg/dL (Ref: 8.5 - 10.2 mg/dL)\n"
        "Serum Creatinine: 0.9 mg/dL (Ref: 0.6 - 1.2 mg/dL)"
    )
    draw.text((25, 30), text, fill="black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def run_all_tests():
    print("=== 1. Testing GET /api/health ===")
    res_health = client.get("/api/health")
    print("Status:", res_health.status_code, res_health.json())
    assert res_health.status_code == 200
    assert res_health.json()["tesseract_available"] is True
    print("✓ Health check passed!\n")

    print("=== 2. Testing POST /api/reports/analyze with PDF ===")
    pdf_data = create_sample_pdf()
    res_pdf = client.post(
        "/api/reports/analyze",
        files={"file": ("patient_report.pdf", pdf_data, "application/pdf")}
    )
    print("Status:", res_pdf.status_code)
    data = res_pdf.json()
    print("Extraction Method:", data["extraction_method"])
    print("Biomarkers Detected:", len(data["detected_biomarkers"]))
    for b in data["detected_biomarkers"]:
        print(f"  • {b['test_name']}: {b['observed_value']} {b['unit']} | Range: {b['reference_range']} | Status: {b['status']}")
    assert res_pdf.status_code == 200
    assert data["status"] == "success"
    assert data["extraction_method"] == "native_pdf_direct"
    assert len(data["detected_biomarkers"]) >= 4
    # Verify values and ranges are strictly from document
    hb = next((b for b in data["detected_biomarkers"] if "Hemoglobin" in b["test_name"]), None)
    assert hb is not None
    assert hb["observed_value"] == "10.8"
    assert "12.0 - 15.5" in hb["reference_range"]
    assert hb["status"] == "low"
    print("✓ PDF Analysis Passed!\n")

    print("=== 3. Testing POST /api/reports/analyze with Image (Tesseract OCR) ===")
    png_data = create_sample_png()
    res_img = client.post(
        "/api/reports/analyze",
        files={"file": ("thyroid_scan.png", png_data, "image/png")}
    )
    print("Status:", res_img.status_code)
    img_json = res_img.json()
    print("Extraction Method:", img_json["extraction_method"])
    print("Extracted Preview:", img_json["extracted_text"][:100].replace('\n', ' '))
    assert res_img.status_code == 200
    assert img_json["extraction_method"] == "image_ocr"
    assert "TSH" in img_json["extracted_text"] or "Thyroid" in img_json["extracted_text"]
    print("✓ Image OCR Analysis Passed!\n")

    print("=== 4. Testing Unsupported File Format ===")
    res_unsupported = client.post(
        "/api/reports/analyze",
        files={"file": ("report.docx", b"dummy word content", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    print("Status:", res_unsupported.status_code, res_unsupported.json())
    assert res_unsupported.status_code == 400
    assert "Unsupported file format" in res_unsupported.json()["detail"]
    print("✓ Unsupported format handled properly!\n")

    print("=== 5. Testing Empty File (0 Bytes) ===")
    res_empty = client.post(
        "/api/reports/analyze",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    print("Status:", res_empty.status_code, res_empty.json())
    assert res_empty.status_code == 400
    assert "empty" in res_empty.json()["detail"]
    print("✓ Empty file rejected properly!\n")

    print("=== 6. Testing Corrupted / Damaged Image ===")
    res_corrupt = client.post(
        "/api/reports/analyze",
        files={"file": ("corrupt.jpg", b"NOT AN IMAGE FILE", "image/jpeg")}
    )
    print("Status:", res_corrupt.status_code, res_corrupt.json())
    assert res_corrupt.status_code == 422
    assert "not a valid" in res_corrupt.json()["detail"] or "Failed to read" in res_corrupt.json()["detail"]
    print("✓ Corrupted file handled cleanly!\n")

    print("ALL 6 TESTS PASSED FLAWLESSLY! 🎉")

if __name__ == "__main__":
    run_all_tests()
