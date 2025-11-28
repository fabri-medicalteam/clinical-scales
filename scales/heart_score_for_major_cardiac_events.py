"""
HEART Score for Major Cardiac Events
Predicts 6-week risk of major adverse cardiac events in patients with chest pain.
Reference: Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008

STRICT RULE: All data in this file is derived ONLY from the extracted source text.
No medical data, cutoffs, thresholds, or recommendations have been invented or inferred.
"""

SCALE_DATA = {
    "name": "HEART Score for Major Cardiac Events",
    "description": "Predicts 6-week risk of major adverse cardiac events in patients with chest pain.",
    "variables": {
        "history": "Clinical history suspicion level",
        "ekg": "EKG findings",
        "age": "Patient age in years",
        "risk_factors": "Cardiovascular risk factors",
        "initial_troponin": "Initial troponin level"
    },
    "formula": "SUM_OF_POINTS",
    "interpretation": """Score 0-3: Low Score - Risk of MACE of 0.9-1.7%\n\nVARIABLE INTERPRETATION:\n- history: Retrosternal pain, pressure, radiation to jaw/left shoulder/arms, duration 5–15 min, initiated by exercise/cold/emotion, perspiration, nausea/vomiting, reaction on nitrates within mins, patient recognizes symptoms. Low risk features of chest pain include: well localized, sharp, non-exertional, no diaphoresis, no nausea or vomiting, and reproducible with palpation.\n- ekg: 1 point: No ST deviation but LBBB, LVH, repolarization changes (e.g. digoxin); 2 points: ST deviation not due to LBBB, LVH, or digoxin\n- risk_factors: Risk factors: HTN, hypercholesterolemia, DM, obesity (BMI >30 kg/m²), smoking (current, or smoking cessation ≤3 mo), positive family history (parent or sibling with CVD before age 65); atherosclerotic disease: prior MI, PCI/CABG, CVA/TIA, or peripheral arterial disease\n- initial_troponin: Use local, regular sensitivity troponin assays and corresponding cutoffs\n""",
    "recommendation": """Risk of MACE of 0.9-1.7%""",
    "suggested_triggers": [
    "cardiac",
    "cardiovascular",
    "clinical",
    "events",
    "factors",
    "findings",
    "for",
    "heart",
    "history",
    "initial",
    "level",
    "major",
    "patient",
    "risk",
    "score",
    "suspicion",
    "troponin",
    "years"
    ]
}

def calculate(inputs):
    """
    Calculate score based on input variables.

    Args:
        inputs (dict): Dictionary with variable names as keys

    Returns:
        float or int: Calculated score
    """
    score = 0
    for key, value in inputs.items():
        score += int(value) if isinstance(value, (int, str)) and str(value).lstrip('-').isdigit() else 0
    return score

# Example usage:
# result = calculate({"var1": value1, "var2": value2})
# print(f"Score: {result}")
# print(f"Interpretation: {SCALE_DATA['interpretation']}")
