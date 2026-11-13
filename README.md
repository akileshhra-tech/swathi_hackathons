# ReportSaathi (रिपोर्ट साथी)
### AI-Powered Medical Laboratory Report Explanation Platform

ReportSaathi is an empathetic, educational web application designed to translate confusing medical laboratory test reports into plain, accessible language for patients and their families.

---

## 🌟 Key Backend & Frontend Capabilities

- **Primary API Endpoint**: `POST /api/reports/analyze`
  - Accepts `.pdf`, `.jpg`, `.jpeg`, and `.png` file uploads (up to 10 MB).
  - Uses **safe temporary-file handling** (`tempfile.NamedTemporaryFile` with guaranteed `finally` cleanup).
  - Hybrid Extraction: Fast native extraction with **PyMuPDF**, falling back to **Tesseract OCR** with **Pillow** image preprocessing (grayscale, contrast enhancement, sharpening) for scans and camera photos.
  - Strict Medical Grounding: **Never invents missing report values or reference intervals**. Unspecified ranges are explicitly marked as `"Not specified in report"`.
  - Rich Structured Output: Returns `status`, `extraction_method`, `page_count`, `character_count`, verbatim `extracted_text`, `detected_biomarkers`, `educational_summary`, and `doctor_questions`.
- **Health Check Endpoint**: `GET /api/health` (and `GET /health`)
  - Verifies service readiness, Tesseract binary availability, and supported formats.
- **Responsive React Frontend**:
  - Live API connection status indicator.
  - Drag-and-drop uploader with client-side & server-side validation.
  - Interactive multi-stage progress animation.
  - Comprehensive results dashboard with filterable biomarker metrics, plain-language notes, and printable summary.

---

## 🛠️ Architecture & Tech Stack

```text
ReportSaathi/
├── backend/                  # FastAPI 0.115 + Python 3.12 (venv)
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint, CORS, /api/health, /api/reports/analyze
│   │   ├── core/config.py    # Pydantic v2 settings management
│   │   ├── services/
│   │   │   ├── document_processor.py # File validation, temp file lifecycle, PDF & OCR extraction
│   │   │   ├── ocr_service.py        # Tesseract engine wrapper
│   │   │   ├── biomarker_parser.py   # Grounded biomarker parsing (no hallucinated ranges)
│   │   │   └── gemini_service.py     # Optional Gemini AI interpretation service
│   │   ├── schemas/analysis.py       # Pydantic models for structured output
│   │   └── utils/image_cleanup.py    # Pillow image enhancement for OCR
│   └── tests/
│       ├── test_backend_full.py      # Complete automated test suite (PDF, OCR, errors)
│       └── test_extraction.py        # PyMuPDF and Tesseract unit tests
│
└── frontend/                 # React 18 + Vite 5 + Tailwind CSS
    └── src/
        ├── components/
        │   ├── Navbar.jsx            # Live API & OCR status indicator
        │   ├── UploadModal.jsx       # Real multipart upload connected to backend
        │   ├── Dashboard.jsx         # Summary metrics & reports list
        │   ├── ResultsPage.jsx       # Biomarker analysis & doctor questions
        │   └── DisclaimerBanner.jsx  # Mandatory educational disclaimer
        └── services/
            └── api.js                # Axios client targeting /api/reports/analyze
```

---

## 🚀 Setup & Execution Instructions

### 1. System Dependencies
Make sure **Python 3.12**, **Node.js 18+**, and **Tesseract OCR** are installed:
```bash
# macOS (using Homebrew)
brew install python@3.12 node tesseract
```

### 2. Backend Setup & Startup
```bash
cd backend

# Create virtual environment (if not already created)
python3.12 -m venv venv
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base URL: **`http://127.0.0.1:8000`**
- Interactive OpenAPI / Swagger Docs: **`http://127.0.0.1:8000/docs`**
- Health Check: **`http://127.0.0.1:8000/api/health`**

### 3. Frontend Setup & Startup
```bash
cd frontend

# Install npm dependencies (if not already installed)
npm install

# Start the Vite development server with proxy to backend
npm run dev
```
- Web Application: **`http://127.0.0.1:5173/`**

---

## 🧪 Running the Backend Test Suite

To verify health checks, PDF direct extraction, Tesseract OCR, and error boundary handling:
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=.
python tests/test_backend_full.py
```

---

## ⚖️ Medical Disclaimer
ReportSaathi is strictly an informational and educational aid. It does not provide medical diagnoses, treatment decisions, or clinical consultations. Always consult a licensed healthcare professional regarding personal medical conditions or lab values.
# swathi_hackathons
# swathi_hackathons
