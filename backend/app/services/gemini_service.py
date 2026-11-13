import json
import os
import re
from typing import Tuple, Optional, List
from app.core.config import settings
from app.schemas.analysis import (
    GeminiRawOutputSchema,
    StructuredBiomarkerItem,
    BiomarkerSourceFacts,
    BiomarkerAIExplanation
)
from app.utils.prompts import GEMINI_SYSTEM_PROMPT, build_gemini_analysis_prompt

# Standard non-diagnostic layperson knowledge dictionary for fallback/offline grounding
TEST_METADATA_FALLBACK = {
    "hemoglobin": {
        "display": "Hemoglobin (Hb)",
        "unit": "g/dL",
        "aliases": ["hemoglobin", "hb", "hgb"],
        "note": "Hemoglobin is the oxygen-carrying protein inside red blood cells that transports oxygen from your lungs to bodily tissues."
    },
    "wbc": {
        "display": "White Blood Cell (WBC) Count",
        "unit": "/mcL",
        "aliases": ["wbc", "white blood cell", "total leukocyte count", "tlc"],
        "note": "White blood cells defend your body against infections and microorganisms as part of your immune system."
    },
    "platelets": {
        "display": "Platelet Count",
        "unit": "/mcL",
        "aliases": ["platelet", "platelets", "thrombocytes"],
        "note": "Platelets are disc-shaped cell fragments essential for healthy blood clotting and tissue repair."
    },
    "glucose": {
        "display": "Fasting Blood Glucose",
        "unit": "mg/dL",
        "aliases": ["fasting blood glucose", "fasting blood sugar", "fbs", "glucose fasting", "blood sugar"],
        "note": "Measures sugar circulating in your blood after an overnight fast to reflect baseline energy metabolism."
    },
    "hba1c": {
        "display": "HbA1c (Glycated Hemoglobin)",
        "unit": "%",
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin"],
        "note": "Reflects the 3-month average of glucose attached to circulating red blood cells."
    },
    "cholesterol": {
        "display": "Total Cholesterol",
        "unit": "mg/dL",
        "aliases": ["total cholesterol", "cholesterol total", "serum cholesterol"],
        "note": "Measures total lipids circulating in your bloodstream."
    },
    "triglycerides": {
        "display": "Triglycerides",
        "unit": "mg/dL",
        "aliases": ["triglycerides", "triglyceride"],
        "note": "The primary circulating fat derived from dietary calories and energy storage."
    },
    "creatinine": {
        "display": "Serum Creatinine",
        "unit": "mg/dL",
        "aliases": ["serum creatinine", "creatinine"],
        "note": "A natural muscle turnover metabolite filtered and eliminated from the blood by healthy kidneys."
    },
    "tsh": {
        "display": "Thyroid Stimulating Hormone (TSH)",
        "unit": "uIU/mL",
        "aliases": ["tsh", "thyroid stimulating hormone"],
        "note": "A regulatory hormone from the pituitary gland that directs thyroid metabolic activity."
    },
    "vitamin_d": {
        "display": "Vitamin D3 (25-OH)",
        "unit": "ng/mL",
        "aliases": ["vitamin d", "vitamin d3", "25-oh vitamin d"],
        "note": "Essential for intestinal calcium absorption, immune health, and bone mineral integrity."
    },
    "calcium": {
        "display": "Serum Calcium",
        "unit": "mg/dL",
        "aliases": ["serum calcium", "calcium total"],
        "note": "A mineral vital for bone density, nerve signaling, and muscle contractions."
    }
}

class GeminiService:
    def __init__(self):
        # Read API key strictly from server-side environment
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.client = None
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiService] Could not initialize google-genai client: {e}")

    def analyze_report(self, extracted_text: str) -> Tuple[GeminiRawOutputSchema, bool]:
        """
        Sends extracted text to Gemini API with strict structured schema validation.
        Returns (validated_analysis, was_gemini_live).
        Falls back safely if API key is absent or request fails.
        """
        # Step 1: Check document clarity threshold
        clean_text = extracted_text.strip()
        if len(clean_text) < 40:
            return self._build_unclear_report_response(
                "Document text contains insufficient characters to establish clinical context. "
                "Please consult a qualified clinician with your original laboratory paperwork."
            ), False

        # Step 2: If Gemini API is configured, attempt live call
        if self.client:
            try:
                from google.genai import types
                prompt = build_gemini_analysis_prompt(clean_text)

                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=GEMINI_SYSTEM_PROMPT,
                        response_mime_type="application/json",
                        temperature=0.1, # Low temperature for objective medical grounding
                    )
                )

                if response and response.text:
                    # Validate output against Pydantic schema
                    validated = GeminiRawOutputSchema.model_validate_json(response.text)
                    return validated, True
            except Exception as e:
                print(f"[GeminiService] Live Gemini API invocation encountered error: {str(e)[:150]}. Engaging safe fallback grounder.")

        # Step 3: Safe deterministic fallback engine (strictly grounded, never invents ranges)
        return self._generate_deterministic_grounding(clean_text), False

    def _generate_deterministic_grounding(self, text: str) -> GeminiRawOutputSchema:
        """
        Grounded offline engine that parses exact lines without inventing ranges or values.
        """
        items: List[StructuredBiomarkerItem] = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        for key, meta in TEST_METADATA_FALLBACK.items():
            pattern = r"(?i)\b(" + "|".join(re.escape(a) for a in meta["aliases"]) + r")\b"
            for line in lines:
                match = re.search(pattern, line)
                if match:
                    parsed_item = self._extract_line_item(line, match.end(), meta)
                    if parsed_item and not any(i.source_facts.test_name == parsed_item.source_facts.test_name for i in items):
                        items.append(parsed_item)
                        break

        # Check if text was ambiguous
        is_clear = len(items) > 0
        clarity_warning = None
        if not is_clear:
            clarity_warning = (
                "The extracted document did not contain standard laboratory markers with clear numerical results. "
                "Please consult a qualified clinician to interpret your original physical report."
            )

        # Build educational summary
        summary = self._build_educational_summary(items)

        # Generate empowering doctor questions
        questions = self._build_doctor_questions(items)

        return GeminiRawOutputSchema(
            is_report_clear=is_clear,
            clarity_warning=clarity_warning,
            overall_summary=summary,
            biomarkers=items,
            doctor_questions=questions
        )

    def _extract_line_item(self, line: str, alias_end: int, meta: dict) -> Optional[StructuredBiomarkerItem]:
        remainder = line[alias_end:].strip(" :-\t")
        num_match = re.search(r"([<>]?\s*[0-9]+(?:\.[0-9]+)?(?:,[0-9]{3})*)", remainder)
        if not num_match:
            return None

        val = num_match.group(1).replace(" ", "")
        val_end = num_match.end()
        after = remainder[val_end:].strip()

        # Check for explicit in-document range: e.g., '12.0 - 15.5' or '< 200'
        range_match = re.search(
            r"(?:ref(?:erence)?(?:\s*interval|\s*range)?\s*[:\(\[]?\s*)?"
            r"([<>]?\s*[0-9]+(?:\.[0-9]+)?(?:\s*-\s*[0-9]+(?:\.[0-9]+)?)?)",
            after,
            re.IGNORECASE
        )

        ref_range = None
        clarity_note = None
        status = "unclassified"

        if range_match:
            cand = range_match.group(1).strip()
            if "-" in cand or "<" in cand or ">" in cand:
                ref_range = cand
                status = self._evaluate_status(val, ref_range)

        if not ref_range:
            clarity_note = "Reference range was not explicitly specified in the source document. Never assumed or guessed."

        return StructuredBiomarkerItem(
            source_facts=BiomarkerSourceFacts(
                test_name=meta["display"],
                extracted_value=val,
                unit=meta["unit"],
                reference_range=ref_range # None if not present!
            ),
            ai_explanation=BiomarkerAIExplanation(
                simple_language_explanation=meta["note"],
                status_indicator=status,
                clarity_note=clarity_note
            )
        )

    def _evaluate_status(self, val_str: str, range_str: str) -> str:
        try:
            num = float(val_str.replace("<", "").replace(">", "").replace(",", ""))
            if "-" in range_str:
                parts = range_str.split("-")
                min_b = float(parts[0].replace(",", ""))
                max_b = float(parts[1].replace(",", ""))
                if num < min_b:
                    return "low"
                elif num > max_b:
                    return "high"
                return "normal"
            elif "<" in range_str:
                max_b = float(range_str.replace("<", "").replace(",", ""))
                return "high" if num > max_b else "normal"
            elif ">" in range_str:
                min_b = float(range_str.replace(">", "").replace(",", ""))
                return "low" if num < min_b else "normal"
        except (ValueError, IndexError):
            pass
        return "unclassified"

    def _build_educational_summary(self, items: List[StructuredBiomarkerItem]) -> str:
        if not items:
            return (
                "Document text was processed. No standardized biochemical or hematological markers "
                "could be clearly isolated. Review the verbatim document text below and share the original report with your doctor."
            )

        highs = [i.source_facts.test_name for i in items if i.ai_explanation.status_indicator == "high"]
        lows = [i.source_facts.test_name for i in items if i.ai_explanation.status_indicator == "low"]
        normals = [i.source_facts.test_name for i in items if i.ai_explanation.status_indicator == "normal"]

        parts = [
            f"We identified {len(items)} laboratory parameters from your document."
        ]

        if highs or lows:
            abnormal = []
            if highs:
                abnormal.append(f"higher than document range ({', '.join(highs)})")
            if lows:
                abnormal.append(f"lower than document range ({', '.join(lows)})")
            parts.append(
                f"Findings observed to be {' and '.join(abnormal)} represent valuable topics to discuss with your healthcare provider."
            )
        else:
            parts.append(
                "Parameters with in-document reference intervals fall within expected healthy target ranges."
            )

        if normals:
            parts.append(f"Values within expected limits include: {', '.join(normals)}.")

        parts.append(
            "Laboratory readings naturally fluctuate based on time of day, hydration, and testing methodology. "
            "Please review these exact findings in person with your prescribing physician."
        )

        return " ".join(parts)

    def _build_doctor_questions(self, items: List[StructuredBiomarkerItem]) -> List[str]:
        questions = [
            "How do these current results compare with my previous baseline lab tests?",
            "Are there any specific dietary, hydration, or activity adjustments you suggest based on these values?"
        ]
        out_of_range = [i for i in items if i.ai_explanation.status_indicator in ("high", "low")]
        if out_of_range:
            name = out_of_range[0].source_facts.test_name
            questions.insert(0, f"What might be contributing to the out-of-range finding for {name}?")
            questions.append("Would you recommend repeating this test in a few weeks to monitor the trend?")
        else:
            questions.append("When would you recommend my next routine check-up or follow-up laboratory screening?")

        return questions

    def _build_unclear_report_response(self, warning_message: str) -> GeminiRawOutputSchema:
        return GeminiRawOutputSchema(
            is_report_clear=False,
            clarity_warning=warning_message,
            overall_summary=(
                "The uploaded document does not provide enough legible text to accurately extract medical parameters. "
                "To ensure your clinical safety, ReportSaathi does not guess or interpolate unclear data. "
                "Please consult a qualified clinician with your original laboratory documents."
            ),
            biomarkers=[],
            doctor_questions=[
                "Could you help me review and interpret my physical laboratory paperwork?",
                "Do any of these tests need to be repeated due to legibility issues?"
            ]
        )

gemini_service = GeminiService()
