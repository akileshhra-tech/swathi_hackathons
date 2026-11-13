import io
import fitz
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_pdf(text_content: str) -> bytes:
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((40, 60), text_content, fontsize=11)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

def test_1_standard_cbc_report():
    print("\n--- Test 1: Standard CBC with Complete Reference Ranges ---")
    report_text = (
        "METRO DIAGNOSTICS LABORATORY - PATIENT REPORT\n"
        "Patient: Sunita Patel | Age: 36 | Gender: Female\n"
        "Date: 12-Nov-2026\n"
        "----------------------------------------------------\n"
        "Hemoglobin: 11.2 g/dL (Reference: 12.0 - 15.5 g/dL)\n"
        "White Blood Cell (WBC): 7,200 /mcL (Reference: 4,500 - 11,000 /mcL)\n"
        "Platelet Count: 230,000 /mcL (Reference: 150,000 - 450,000 /mcL)\n"
        "Serum Creatinine: 0.9 mg/dL (Reference: 0.6 - 1.1 mg/dL)"
    )
    pdf_bytes = create_synthetic_pdf(report_text)
    res = client.post(
        "/api/reports/analyze",
        files={"file": ("standard_cbc.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 200
    data = res.json()
    print("Status:", data["status"])
    print("Is Report Clear:", data["is_report_clear"])
    print("Biomarkers Detected:", len(data["detected_biomarkers"]))

    for item in data["detected_biomarkers"]:
        facts = item["source_facts"]
        ai = item["ai_explanation"]
        print(f"  • [Fact] {facts['test_name']}: {facts['extracted_value']} {facts['unit']} | Range: {facts['reference_range']}")
        print(f"    [AI Note] {ai['simple_language_explanation'][:60]}... (Status: {ai['status_indicator']})")
        assert facts["test_name"]
        assert facts["extracted_value"]

    # Hemoglobin should be low
    hb = next(i for i in data["detected_biomarkers"] if "Hemoglobin" in i["source_facts"]["test_name"])
    assert hb["ai_explanation"]["status_indicator"] == "low"
    assert "12.0 - 15.5" in hb["source_facts"]["reference_range"]
    print("✓ Test 1 Passed: Distinct source facts and AI explanations verified!")

def test_2_missing_reference_range():
    print("\n--- Test 2: Report with Missing Reference Range (No Hallucination) ---")
    report_text = (
        "ALPHA LAB SERVICES\n"
        "Patient: John Doe | Date: 11-Nov-2026\n"
        "----------------------------------------------------\n"
        "Fasting Blood Glucose: 114 mg/dL\n"
        "Total Cholesterol: 220 mg/dL"
    )
    pdf_bytes = create_synthetic_pdf(report_text)
    res = client.post(
        "/api/reports/analyze",
        files={"file": ("missing_ranges.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 200
    data = res.json()
    print("Status:", data["status"])
    
    glucose = next(i for i in data["detected_biomarkers"] if "Glucose" in i["source_facts"]["test_name"])
    print("Glucose Observed:", glucose["source_facts"]["extracted_value"])
    print("Glucose Range in Output:", glucose["source_facts"]["reference_range"])
    print("Clarity Note:", glucose["ai_explanation"]["clarity_note"])

    # MUST NOT invent reference range!
    assert glucose["source_facts"]["reference_range"] is None or glucose["source_facts"]["reference_range"] == "Not specified in report"
    assert glucose["ai_explanation"]["status_indicator"] == "unclassified"
    assert glucose["ai_explanation"]["clarity_note"] is not None
    print("✓ Test 2 Passed: Did NOT invent missing reference ranges!")

def test_3_unclear_or_fragmented_report():
    print("\n--- Test 3: Fragmented / Unclear Report Excerpt ---")
    unclear_text = (
        "?? ?? [Blurry Text] ... 12 ... ??"
    )
    pdf_bytes = create_synthetic_pdf(unclear_text)
    res = client.post(
        "/api/reports/analyze",
        files={"file": ("unclear_scan.pdf", pdf_bytes, "application/pdf")}
    )
    assert res.status_code == 200
    data = res.json()
    print("Status:", data["status"])
    print("Is Clear:", data["is_report_clear"])
    print("Clarity Warning:", data["clarity_warning"])

    assert data["status"] == "unclear_report"
    assert data["is_report_clear"] is False
    assert "consult a qualified clinician" in data["clarity_warning"].lower()
    print("✓ Test 3 Passed: Appropriately flagged unclear report and directed user to clinician!")

if __name__ == "__main__":
    test_1_standard_cbc_report()
    test_2_missing_reference_range()
    test_3_unclear_or_fragmented_report()
    print("\nALL 3 SYNTHETIC TEST SCENARIOS PASSED COMPLETELY! 🎉")
