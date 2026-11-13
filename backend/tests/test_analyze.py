from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_with_text():
    sample_text = """
    LIFELAB DIAGNOSTICS
    Fasting Blood Glucose: 115 mg/dL (Normal: 70 - 99 mg/dL)
    Total Cholesterol: 230 mg/dL (Normal: < 200 mg/dL)
    Hemoglobin: 14.1 g/dL (Normal: 12.0 - 16.0 g/dL)
    """
    res = client.post("/api/v1/reports/analyze", data={"raw_text": sample_text, "language": "English"})
    print("STATUS:", res.status_code)
    data = res.json()
    print("TITLE:", data.get("title"))
    print("BIOMARKERS DETECTED:", len(data.get("biomarkers", [])))
    for b in data.get("biomarkers", []):
        print(f" - {b['test_name']}: {b['result_value']} ({b['status']}) -> {b['explanation'][:60]}...")
    assert res.status_code == 200
    assert len(data.get("biomarkers", [])) >= 2
    assert "disclaimer" in data
    print("✓ Full Analysis Pipeline Test Passed!")

if __name__ == "__main__":
    test_analyze_with_text()
