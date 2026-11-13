from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class Biomarker(BaseModel):
    test_name: str = Field(description="Name of the laboratory test, e.g. Hemoglobin, Fasting Glucose")
    result_value: str = Field(description="Observed numeric or qualitative result")
    reference_range: str = Field(description="Standard normal interval from the report")
    unit: str = Field(default="", description="Measurement unit, e.g. mg/dL, g/dL, uIU/mL")
    status: Literal["normal", "high", "low", "borderline", "inconclusive"] = Field(
        description="Health flag comparing result to reference range"
    )
    explanation: str = Field(
        description="A gentle, 1-2 sentence plain-language explanation of what this test measures and what this value signifies."
    )

class ReportAnalysisResponse(BaseModel):
    title: str = Field(default="Laboratory Test Summary", description="Short title of the report type (e.g. Complete Blood Count, Lipid Panel)")
    overall_summary: str = Field(description="2-3 paragraphs in simple, compassionate plain English explaining the overall picture without panic.")
    urgency_level: Literal["routine", "follow_up_recommended", "prompt_attention"] = Field(
        default="routine",
        description="Level of urgency for reviewing with a doctor"
    )
    key_findings: List[str] = Field(description="Bullet points of the most notable normal or out-of-range observations")
    biomarkers: List[Biomarker] = Field(description="List of parsed lab tests and their simple explanations")
    questions_for_doctor: List[str] = Field(description="3-5 practical, empowering questions the patient can ask their physician")
    dietary_lifestyle_notes: List[str] = Field(default=[], description="General, safe wellness context (e.g. hydration, balanced nutrition)")
    disclaimer: str = Field(
        default=(
            "MEDICAL DISCLAIMER: ReportSaathi is an educational tool powered by AI. "
            "It is NOT a medical diagnosis, clinical opinion, or substitute for professional medical consultation. "
            "Always consult your licensed physician or healthcare provider regarding any health condition or lab results."
        )
    )
    source_method: Optional[str] = None
    page_count: Optional[int] = 1
