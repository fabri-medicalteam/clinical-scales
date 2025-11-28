# Python Output Example - New Structure

This document shows an example of the Python files generated with the new SCALE_DATA structure.

## Example 1: CHA₂DS₂-VASc Score

```python
"""
CHA₂DS₂-VASc Score
Stroke risk stratification in patients with atrial fibrillation
Reference: Lip GY, et al. Chest. 2010

STRICT RULE: All data in this file is derived ONLY from the extracted source text.
No medical data, cutoffs, thresholds, or recommendations have been invented or inferred.
"""

SCALE_DATA = {
    "name": "CHA₂DS₂-VASc Score",
    "description": "Stroke risk stratification in patients with atrial fibrillation",
    "variables": {
        "chf": "Congestive heart failure history",
        "hypertension": "Hypertension",
        "age": "Age category",
        "diabetes": "Diabetes mellitus",
        "stroke": "Prior stroke, TIA, or thromboembolism",
        "vascular": "Vascular disease (MI, PAD, aortic plaque)",
        "sex": "Sex category"
    },
    "formula": "SUM_OF_POINTS",
    "interpretation": """Score 0: 0% annual stroke risk
Score 1: 1.3% annual stroke risk
Score 2: 2.2% annual stroke risk
Score 3: 3.2% annual stroke risk
Score 4: 4.0% annual stroke risk
Score 5: 6.7% annual stroke risk
Score 6: 9.8% annual stroke risk
Score 7: 9.6% annual stroke risk
Score 8: 12.5% annual stroke risk
Score 9: 15.2% annual stroke risk""",
    "recommendation": """Score 0 (male) or 1 (female): No anticoagulation recommended
Score 1 (male): Consider oral anticoagulation
Score ≥2: Oral anticoagulation recommended""",
    "suggested_triggers": [
        "anticoagulation",
        "atrial",
        "chf",
        "diabetes",
        "fibrillation",
        "hypertension",
        "stroke",
        "thromboembolism",
        "vascular"
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
# result = calculate({"chf": 1, "hypertension": 1, "age": 2, "diabetes": 0, "stroke": 0, "vascular": 0, "sex": 1})
# print(f"Score: {result}")
# print(f"Interpretation: {SCALE_DATA['interpretation']}")
```

---

## Example 2: Hypothetical Cardiotoxicity Score (with monitoring & treatment)

```python
"""
Cardiotoxicity Monitoring Score
Risk stratification for anthracycline-induced cardiotoxicity
Reference: Example Study, Cardiology Journal, 2024

STRICT RULE: All data in this file is derived ONLY from the extracted source text.
No medical data, cutoffs, thresholds, or recommendations have been invented or inferred.
"""

SCALE_DATA = {
    "name": "Cardiotoxicity Monitoring Score",
    "description": "Risk stratification for anthracycline-induced cardiotoxicity in cancer patients",
    "variables": {
        "cumulative_dose": "Cumulative anthracycline dose (mg/m²)",
        "baseline_lvef": "Baseline left ventricular ejection fraction (%)",
        "age": "Patient age (years)",
        "hypertension": "History of hypertension",
        "diabetes": "History of diabetes"
    },
    "formula": "SUM_OF_POINTS",
    "interpretation": """Score 0-2: Low risk - 5% risk of cardiotoxicity
Score 3-5: Moderate risk - 15% risk of cardiotoxicity
Score 6-8: High risk - 35% risk of cardiotoxicity
Score 9+: Very high risk - 60% risk of cardiotoxicity

VARIABLE INTERPRETATION:
- cumulative_dose: >400 mg/m² significantly increases risk
- baseline_lvef: <50% indicates pre-existing dysfunction
- age: >65 years associated with higher cardiotoxicity

MONITORING STRATEGY:
- Low risk: Echocardiography every 6 months during treatment
- Moderate risk: Echocardiography every 3 months, troponin monitoring
- High risk: Echocardiography every 2 months, troponin + BNP monitoring
- Very high risk: Monthly cardiac imaging, biomarker monitoring, cardio-oncology referral

TREATMENT MODIFICATIONS:
- Score ≥6: Consider dexrazoxane cardioprotection
- Score ≥9: Evaluate alternative chemotherapy regimens
- LVEF drop >10% from baseline: Hold anthracycline, consider ACE inhibitor
- LVEF <50%: Discontinue anthracycline, initiate heart failure therapy""",
    "recommendation": """Low risk: Continue standard treatment with routine monitoring
Moderate risk: Enhanced cardiac monitoring, consider cardioprotective strategies
High risk: Intensive monitoring, cardioprotective agents recommended
Very high risk: Multidisciplinary cardio-oncology management, consider treatment alternatives""",
    "suggested_triggers": [
        "anthracycline",
        "baseline",
        "biomarker",
        "bnp",
        "cardiotoxicity",
        "dexrazoxane",
        "echocardiography",
        "lvef",
        "monitoring",
        "risk",
        "stratification",
        "troponin"
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
# result = calculate({"cumulative_dose": 3, "baseline_lvef": 2, "age": 1, "hypertension": 1, "diabetes": 0})
# print(f"Score: {result}")
# print(f"Interpretation: {SCALE_DATA['interpretation']}")
```

---

## Example 3: Simple Scale (minimal data from source)

```python
"""
Simplified Pain Scale
Basic pain assessment
Reference: N/A

STRICT RULE: All data in this file is derived ONLY from the extracted source text.
No medical data, cutoffs, thresholds, or recommendations have been invented or inferred.
"""

SCALE_DATA = {
    "name": "Simplified Pain Scale",
    "description": "Numeric rating scale for pain assessment",
    "variables": {
        "pain_intensity": "Pain intensity rating (0-10)"
    },
    "formula": "SUM_OF_POINTS",
    "interpretation": """Refer to source documentation for interpretation guidelines.""",
    "recommendation": """Consult clinical guidelines and source documentation.""",
    "suggested_triggers": [
        "pain",
        "simplified"
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
# result = calculate({"pain_intensity": 7})
# print(f"Score: {result}")
# print(f"Interpretation: {SCALE_DATA['interpretation']}")
```

---

## Key Features of New Structure

### 1. **Structured Data Dictionary**
- Easy programmatic access to all scale metadata
- No parsing needed - just import and use

### 2. **Strict Source-Only Policy**
- Only data explicitly from source text
- Fallback to generic messages when data missing
- Clear disclaimer in docstring

### 3. **Telepatia Intelligence Integration**
- `suggested_triggers` array ready for use
- Automatically extracted from source content
- Filtered and sorted by relevance

### 4. **Risk Stratification**
- Multi-level interpretation when available
- Optional subsections (variable interpretation, monitoring, treatment)
- Only included when present in source

### 5. **Clinical Utility**
- Practical recommendations when available
- Monitoring strategies when specified
- Treatment modification rules when provided

### 6. **All Text in English**
- Consistent language throughout
- Easy integration with international systems
- Clear, concise clinical descriptions

---

## Usage in Code

```python
# Import the scale
from curb_65 import SCALE_DATA, calculate

# Access metadata
print(f"Scale name: {SCALE_DATA['name']}")
print(f"Description: {SCALE_DATA['description']}")
print(f"Variables: {list(SCALE_DATA['variables'].keys())}")

# Calculate score
inputs = {"confusion": 1, "bun": 1, "rr": 0, "bp": 0, "age": 1}
score = calculate(inputs)

print(f"Score: {score}")
print(f"Interpretation: {SCALE_DATA['interpretation']}")
print(f"Recommendation: {SCALE_DATA['recommendation']}")

# Check triggers for Telepatia Intelligence
if "pneumonia" in SCALE_DATA['suggested_triggers']:
    print("This scale is relevant for pneumonia cases")
```

---

## Telepatia Intelligence Integration

The `suggested_triggers` field can be used to automatically associate scales with relevant clinical contexts:

```python
# Example: Find relevant scales for a patient with specific conditions
patient_conditions = ["atrial fibrillation", "stroke risk"]

for scale in all_scales:
    relevance_score = 0
    for condition in patient_conditions:
        condition_words = condition.split()
        for word in condition_words:
            if word.lower() in scale.SCALE_DATA['suggested_triggers']:
                relevance_score += 1

    if relevance_score > 0:
        print(f"{scale.SCALE_DATA['name']}: Relevance {relevance_score}")
```

This enables:
- Automatic scale suggestion based on patient context
- Intelligent search and filtering
- Context-aware clinical decision support
- Integration with EHR systems
