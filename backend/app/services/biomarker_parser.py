import re
from typing import List, Dict, Any, Tuple
from app.schemas.analysis import ExtractedBiomarker

# Reference dictionary of common laboratory parameters with neutral educational explanations
KNOWN_TEST_METADATA = {
    "hemoglobin": {
        "display": "Hemoglobin (Hb)",
        "unit": "g/dL",
        "aliases": ["hemoglobin", "hb", "hgb"],
        "note": "Hemoglobin is the iron-containing protein inside red blood cells that transports oxygen from the lungs to bodily tissues."
    },
    "wbc": {
        "display": "White Blood Cell (WBC) Count",
        "unit": "/mcL",
        "aliases": ["wbc", "white blood cell", "total leukocyte count", "tlc"],
        "note": "White blood cells represent the active cellular defense mechanism of the immune system that combats microbial infections."
    },
    "rbc": {
        "display": "Red Blood Cell (RBC) Count",
        "unit": "million/mcL",
        "aliases": ["rbc", "red blood cell", "erythrocyte count"],
        "note": "Total count of circulating oxygen-carrying red blood cells."
    },
    "platelets": {
        "display": "Platelet Count",
        "unit": "/mcL",
        "aliases": ["platelet", "platelets", "thrombocytes"],
        "note": "Platelets are microscopic disc-shaped cell fragments responsible for healthy blood coagulation to seal wounds."
    },
    "glucose": {
        "display": "Fasting Blood Glucose",
        "unit": "mg/dL",
        "aliases": ["fasting blood glucose", "fasting blood sugar", "fbs", "glucose fasting", "blood sugar fasting"],
        "note": "Measures circulating serum glucose after an overnight fasting interval to evaluate baseline metabolic regulation."
    },
    "hba1c": {
        "display": "HbA1c (Glycated Hemoglobin)",
        "unit": "%",
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin"],
        "note": "Reflects the weighted average percentage of glucose bound to red blood cells over the preceding 2 to 3 months."
    },
    "cholesterol": {
        "display": "Total Cholesterol",
        "unit": "mg/dL",
        "aliases": ["total cholesterol", "cholesterol total", "serum cholesterol"],
        "note": "Combined measurement of sterol lipids circulating within bloodstream lipoprotein particles."
    },
    "triglycerides": {
        "display": "Serum Triglycerides",
        "unit": "mg/dL",
        "aliases": ["triglycerides", "triglyceride"],
        "note": "The primary storage form of fats circulating in the bloodstream derived from excess dietary energy."
    },
    "hdl": {
        "display": "HDL Cholesterol ('Good')",
        "unit": "mg/dL",
        "aliases": ["hdl", "hdl cholesterol", "high density lipoprotein"],
        "note": "High-density lipoprotein particles that scavenge excess peripheral vascular cholesterol and transport it back to the liver."
    },
    "ldl": {
        "display": "LDL Cholesterol ('Bad')",
        "unit": "mg/dL",
        "aliases": ["ldl", "ldl cholesterol", "low density lipoprotein"],
        "note": "Low-density lipoprotein particles that transport cholesterol throughout the arterial system."
    },
    "creatinine": {
        "display": "Serum Creatinine",
        "unit": "mg/dL",
        "aliases": ["serum creatinine", "creatinine"],
        "note": "A natural metabolic byproduct of normal muscle turnover that is filtered from the blood and excreted by healthy kidneys."
    },
    "bun": {
        "display": "Blood Urea Nitrogen (BUN)",
        "unit": "mg/dL",
        "aliases": ["blood urea nitrogen", "bun", "urea"],
        "note": "A waste product from protein breakdown by the liver that serves as an indicator of kidney clearance and hydration status."
    },
    "tsh": {
        "display": "Thyroid Stimulating Hormone (TSH)",
        "unit": "uIU/mL",
        "aliases": ["tsh", "thyroid stimulating hormone", "thyrotropin"],
        "note": "Produced by the pituitary gland to direct the thyroid gland in regulating systemic metabolism and basal energy rates."
    },
    "vitamin_d": {
        "display": "Vitamin D3 (25-OH)",
        "unit": "ng/mL",
        "aliases": ["vitamin d", "vitamin d3", "25-oh vitamin d", "25-hydroxy vitamin d"],
        "note": "A vital fat-soluble prohormone necessary for intestinal calcium absorption, immune system balance, and bone density."
    },
    "calcium": {
        "display": "Serum Calcium",
        "unit": "mg/dL",
        "aliases": ["serum calcium", "calcium total"],
        "note": "One of the body's most critical minerals, necessary for neuromuscular signaling, cardiac pacing, and bone mineralization."
    }
}

class BiomarkerParser:
    @classmethod
    def parse_text(cls, text: str) -> Tuple[List[ExtractedBiomarker], str, List[str]]:
        """
        Parses text for laboratory parameters strictly extracted from the document.
        NEVER invents reference ranges or missing numbers.
        """
        detected: List[ExtractedBiomarker] = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        for key, meta in KNOWN_TEST_METADATA.items():
            pattern = r"(?i)\b(" + "|".join(re.escape(a) for a in meta["aliases"]) + r")\b"
            
            for line in lines:
                match = re.search(pattern, line)
                if match:
                    # Found candidate line. Extract observed value and reference range from THIS line.
                    extracted = cls._parse_line_values(line, match.end(), meta)
                    if extracted and not any(d.test_name == extracted.test_name for d in detected):
                        detected.append(extracted)
                        break

        # Generate non-prescriptive doctor questions based on actual findings
        doctor_questions = cls._generate_doctor_questions(detected)
        
        # Formulate educational summary
        summary = cls._generate_summary(detected)

        return detected, summary, doctor_questions

    @classmethod
    def _parse_line_values(cls, line: str, alias_end_idx: int, meta: Dict[str, Any]) -> ExtractedBiomarker:
        """
        Extracts numbers, units, and reference range from the line.
        If reference range is NOT found in the line, marks it 'Not specified in report'.
        """
        remainder = line[alias_end_idx:].strip(" :-\t")
        
        # Look for observed number
        # Matches patterns like '11.2', '7,400', '240,000', '<0.5'
        num_match = re.search(r"([<>]?\s*[0-9]+(?:\.[0-9]+)?(?:,[0-9]{3})*)", remainder)
        if not num_match:
            return None

        raw_val = num_match.group(1).replace(" ", "")
        val_end = num_match.end()
        after_val = remainder[val_end:].strip()

        # Check for explicit reference range in the remainder of the line:
        # e.g., '12.0 - 15.5', '70-99', '< 200', '> 40', 'Ref: 0.4 - 4.0'
        range_match = re.search(
            r"(?:ref(?:erence)?(?:\s*interval|\s*range)?\s*[:\(\[]?\s*)?"
            r"([<>]?\s*[0-9]+(?:\.[0-9]+)?(?:\s*-\s*[0-9]+(?:\.[0-9]+)?)?)",
            after_val,
            re.IGNORECASE
        )

        ref_range = "Not specified in report"
        status = "unclassified"

        # Determine unit from line or fallback to standard unit
        unit = meta["unit"]

        # Parse reference range if explicitly stated
        range_bounds = None
        if range_match:
            candidate_range = range_match.group(1).strip()
            # Must look like an interval 'A - B' or bound '< B' or '> A'
            if "-" in candidate_range or "<" in candidate_range or ">" in candidate_range:
                ref_range = candidate_range
                range_bounds = cls._parse_bounds(candidate_range)

        # Status classification based strictly on in-document range
        if range_bounds:
            try:
                clean_num = float(raw_val.replace("<", "").replace(">", "").replace(",", ""))
                min_b, max_b = range_bounds
                if min_b is not None and clean_num < min_b:
                    status = "low"
                elif max_b is not None and clean_num > max_b:
                    status = "high"
                else:
                    status = "normal"
            except ValueError:
                status = "unclassified"

        return ExtractedBiomarker(
            test_name=meta["display"],
            observed_value=raw_val,
            unit=unit,
            reference_range=ref_range,
            status=status,
            educational_note=meta["note"]
        )

    @staticmethod
    def _parse_bounds(range_str: str) -> Tuple[float, float]:
        """Parses 'A - B', '< B', or '> A' into (min, max)."""
        clean = range_str.replace(" ", "")
        if "-" in clean:
            parts = clean.split("-")
            try:
                return float(parts[0].replace(",", "")), float(parts[1].replace(",", ""))
            except ValueError:
                return None
        elif "<" in clean:
            try:
                return 0.0, float(clean.replace("<", "").replace(",", ""))
            except ValueError:
                return None
        elif ">" in clean:
            try:
                return float(clean.replace(">", "").replace(",", "")), None
            except ValueError:
                return None
        return None

    @classmethod
    def _generate_summary(cls, biomarkers: List[ExtractedBiomarker]) -> str:
        if not biomarkers:
            return (
                "Document text was extracted successfully. No standard biochemical or hematological "
                "parameters with explicit reference ranges could be automatically matched. "
                "Please review the extracted verbatim text below."
            )

        high_list = [b.test_name for b in biomarkers if b.status == "high"]
        low_list = [b.test_name for b in biomarkers if b.status == "low"]
        normal_list = [b.test_name for b in biomarkers if b.status == "normal"]

        summary_parts = [
            f"A total of {len(biomarkers)} diagnostic parameters were identified from your document."
        ]

        if high_list or low_list:
            abnormal_parts = []
            if high_list:
                abnormal_parts.append(f"higher than document reference range ({', '.join(high_list)})")
            if low_list:
                abnormal_parts.append(f"lower than document reference range ({', '.join(low_list)})")
            summary_parts.append(
                f"Parameters observed to be {' and '.join(abnormal_parts)} provide helpful discussion points for your doctor."
            )
        else:
            summary_parts.append(
                "All parameters with explicit in-document reference ranges fall within expected normal intervals."
            )

        if normal_list:
            summary_parts.append(
                f"Parameters within expected ranges include: {', '.join(normal_list)}."
            )

        summary_parts.append(
            "Laboratory measurements vary naturally based on timing, hydration, and lab techniques. "
            "Discuss these exact findings with your physician during your next consultation."
        )

        return " ".join(summary_parts)

    @classmethod
    def _generate_doctor_questions(cls, biomarkers: List[ExtractedBiomarker]) -> List[str]:
        questions = [
            "How do these current results compare with my previous baseline lab tests?",
            "Are there any specific dietary, hydration, or activity adjustments you suggest based on these values?"
        ]

        out_of_range = [b for b in biomarkers if b.status in ("high", "low")]
        if out_of_range:
            names = ", ".join(b.test_name for b in out_of_range[:2])
            questions.insert(0, f"What might be contributing to the out-of-range findings for {names}?")
            questions.append("Would you recommend repeating this test in a few weeks to monitor the trend?")
        else:
            questions.append("When would you recommend my next routine check-up or follow-up laboratory screening?")

        return questions

biomarker_parser = BiomarkerParser()
