from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Literal

class BiomarkerSourceFacts(BaseModel):
    """Facts extracted strictly from the document without alteration."""
    test_name: str = Field(description="Name of the test detected in the source text")
    extracted_value: str = Field(description="Verbatim numerical or qualitative observed value")
    unit: str = Field(default="", description="Measurement unit as stated in the source text")
    reference_range: Optional[str] = Field(
        default=None,
        description="Exact reference range printed in the source text. None if not present in report."
    )

class BiomarkerAIExplanation(BaseModel):
    """AI educational translation and clarity notes."""
    simple_language_explanation: str = Field(
        description="Clear, layperson explanation of what this test measures. Non-diagnostic, non-prescriptive."
    )
    status_indicator: Literal["normal", "high", "low", "borderline", "unclassified"] = Field(
        default="unclassified",
        description="Evaluation compared only against explicit in-document reference ranges"
    )
    clarity_note: Optional[str] = Field(
        default=None,
        description="Explicit note when information (units, decimals, ranges) is missing, truncated, or blurry."
    )

class StructuredBiomarkerItem(BaseModel):
    """
    Clearly separates source-extracted clinical facts from AI educational explanations.
    """
    source_facts: BiomarkerSourceFacts
    ai_explanation: BiomarkerAIExplanation

    # Top-level helper accessors for convenience
    @property
    def test_name(self) -> str:
        return self.source_facts.test_name

    @property
    def observed_value(self) -> str:
        return self.source_facts.extracted_value

    @property
    def unit(self) -> str:
        return self.source_facts.unit

    @property
    def reference_range(self) -> str:
        return self.source_facts.reference_range or "Not specified in report"

    @property
    def status(self) -> str:
        return self.ai_explanation.status_indicator

    @property
    def educational_note(self) -> str:
        return self.ai_explanation.simple_language_explanation

    @property
    def clarity_note(self) -> Optional[str]:
        return self.ai_explanation.clarity_note

class GeminiRawOutputSchema(BaseModel):
    """
    Direct validation model for structured JSON returned by Gemini API.
    """
    is_report_clear: bool = Field(
        default=True,
        description="False if the report is too blurry, fragmented, cut off, or illegible."
    )
    clarity_warning: Optional[str] = Field(
        default=None,
        description="Note asking the user to consult a qualified clinician if document is incomplete or ambiguous."
    )
    overall_summary: str = Field(
        description="Compassionate, 2-3 paragraph plain-language overview without definitive diagnoses."
    )
    biomarkers: List[StructuredBiomarkerItem] = Field(
        default=[],
        description="List of detected biomarkers with separated source facts and AI explanations."
    )
    doctor_questions: List[str] = Field(
        default=[],
        description="Empowering, constructive questions the patient can ask their physician."
    )

class ReportAnalysisResponse(BaseModel):
    status: Literal["success", "empty_text", "unclear_report", "error"] = Field(
        description="Overall processing outcome"
    )
    message: str = Field(description="Human-readable processing summary")
    filename: str = Field(description="Original name of uploaded document")
    file_type: str = Field(description="Detected MIME type (PDF, PNG, JPG)")
    file_size_bytes: int = Field(description="Size of the uploaded file in bytes")
    extraction_method: Literal["native_pdf_direct", "scanned_pdf_ocr", "image_ocr", "unprocessed"] = Field(
        description="Mechanism utilized for text recovery"
    )
    page_count: int = Field(default=1, description="Number of document pages parsed")
    character_count: int = Field(default=0, description="Total characters of extracted text")
    extracted_text: str = Field(description="Raw text extracted verbatim from the document")

    # Gemini Integration & Verification
    gemini_live_used: bool = Field(
        default=False,
        description="True if live Gemini API was invoked; False if offline grounded engine was used."
    )
    is_report_clear: bool = Field(
        default=True,
        description="Indicates whether the document text provided sufficient clarity."
    )
    clarity_warning: Optional[str] = Field(
        default=None,
        description="Clinical consultation prompt when text or values are missing or unclear."
    )

    overall_summary: str = Field(
        description="Plain-language educational summary of detected parameters."
    )
    detected_biomarkers: List[StructuredBiomarkerItem] = Field(
        default=[],
        description="Biomarkers parsed with separated source facts and AI explanations."
    )
    doctor_questions: List[str] = Field(
        default=[],
        description="Empowering questions for the user to ask their physician."
    )
    disclaimer: str = Field(
        default=(
            "IMPORTANT MEDICAL DISCLAIMER: ReportSaathi is an educational and health literacy aid only. "
            "It does NOT provide medical diagnoses, treatment decisions, or clinical consultations. "
            "Values and ranges are extracted directly from your document without fabrication. "
            "Always consult your licensed physician or healthcare provider regarding any health condition or lab results."
        )
    )
