from pydantic import BaseModel, Field
from typing import Optional, List, Literal


class BiomarkerContext(BaseModel):
    """Minimal biomarker snapshot passed to the chat endpoint."""
    test_name: str
    extracted_value: str
    unit: Optional[str] = ""
    reference_range: Optional[str] = None
    status_indicator: Optional[str] = "unclassified"
    simple_language_explanation: Optional[str] = ""


class ReportContext(BaseModel):
    """
    Stripped-down snapshot of an already-analyzed report.
    The frontend passes this so the backend never needs to re-upload the file.
    """
    report_title: str = Field(default="Unnamed Report")
    overall_summary: Optional[str] = Field(default="")
    biomarkers: List[BiomarkerContext] = Field(default=[])
    # Raw extracted text is sent so edge-case questions can still be answered
    raw_text_excerpt: Optional[str] = Field(
        default="",
        max_length=4000,
        description="First 4000 characters of OCR-extracted text for context."
    )


class ChatRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=500,
        description="User's plain-language question about the selected report."
    )
    report_context: ReportContext = Field(
        description="Structured snapshot of the report being discussed."
    )


class ChatResponse(BaseModel):
    answer: str = Field(description="Educational, grounded answer or 'not in report' message.")
    is_grounded_in_report: bool = Field(
        description="True if the answer is supported by report data; False if the question is out of scope."
    )
    source_references: List[str] = Field(
        default=[],
        description="Biomarker names from the report that informed this answer."
    )
    out_of_scope_message: Optional[str] = Field(
        default=None,
        description="Guidance message when question cannot be answered from the report."
    )
    disclaimer: str = Field(
        default=(
            "⚕️ Educational use only. ReportSaathi does not diagnose, treat, or prescribe. "
            "Always consult your licensed healthcare provider for medical advice."
        )
    )
