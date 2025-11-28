# Clinical Scales - Python Implementations

This directory contains validated Python implementations of clinical scoring systems and calculators.

## Available Scales

### 1. PREVENT - Cardiovascular Disease Risk Prediction
**File:** `prevent.py`
**Reference:** Khan SS, et al. Circulation. 2024;149:430-449

Predicts 10-year and 30-year cardiovascular disease risk including ASCVD, heart failure, CHD, and stroke.

```python
from prevent import PREVENT

patient = {
    'sex': 'male',
    'age': 55,
    'total_cholesterol': 5.5,      # mmol/L
    'hdl_cholesterol': 1.0,         # mmol/L
    'systolic_bp': 140,             # mm Hg
    'diabetes': False,
    'current_smoker': True,
    'egfr': 75,                     # mL/min/1.73m²
    'on_antihypertensive': True,
    'on_statin': False
}

result = PREVENT.calculate(patient)
print(f"10-Year CVD Risk: {result['details']['tenYear']['totalCVD']}%")
```

**Includes:** 5 validated test cases

---

### 2. CHA₂DS₂-VASc - Stroke Risk in Atrial Fibrillation
**File:** `cha2ds2_vasc.py`
**Reference:** Lip GY, et al. Chest. 2010

Estimates annual stroke risk and guides anticoagulation decisions in patients with atrial fibrillation.

```python
from cha2ds2_vasc import CHA2DS2VASc

patient = {
    'chf': 1,                # CHF history
    'hypertension': 1,       # Hypertension
    'age': 2,                # 0=<65, 1=65-74, 2=≥75
    'diabetes': 1,           # Diabetes
    'stroke': 0,             # Prior stroke/TIA (2 points if yes)
    'vascular': 1,           # Vascular disease
    'sex': 0                 # 0=Male, 1=Female
}

result = CHA2DS2VASc.calculate(patient)
print(f"Score: {result['score']}")
print(f"Annual stroke risk: {result['interpretation']}")
```

---

### 3. CURB-65 - Pneumonia Severity
**File:** `curb65.py`
**Reference:** Lim WS, et al. Thorax. 2003

Assesses pneumonia severity and predicts 30-day mortality to guide disposition decisions.

```python
from curb65 import CURB65

patient = {
    'confusion': 1,          # New onset confusion
    'bun': 1,                # BUN >19 mg/dL (>7 mmol/L)
    'rr': 1,                 # RR ≥30/min
    'bp': 1,                 # SBP <90 or DBP <60
    'age': 1                 # Age ≥65
}

result = CURB65.calculate(patient)
print(f"Score: {result['score']}")
print(f"30-day mortality: {result['interpretation']}")
print(f"Disposition: {result['management']}")
```

---

### 4. Wells Score for DVT
**File:** `wells_dvt.py`
**Reference:** Wells PS, et al. NEJM. 2003

Estimates pretest probability of deep vein thrombosis and guides diagnostic workup.

```python
from wells_dvt import WellsDVT

patient = {
    'cancer': 1,             # Active cancer
    'paralysis': 0,          # Paralysis/paresis
    'bedridden': 1,          # Bedridden >3d or major surgery
    'tenderness': 1,         # Localized tenderness
    'swelling': 1,           # Entire leg swollen
    'calf': 1,               # Calf >3cm vs other leg
    'edema': 1,              # Pitting edema
    'veins': 0,              # Collateral superficial veins
    'previous': 0,           # Previous DVT
    'alternative': 0         # Alternative diagnosis (-2 if yes)
}

result = WellsDVT.calculate(patient)
print(f"Score: {result['score']}")
print(f"DVT probability: {result['interpretation']}")
```

---

### 5. MELD Score - End-Stage Liver Disease
**File:** `meld.py`
**Reference:** Kamath PS, et al. Hepatology. 2001

Predicts 3-month mortality in end-stage liver disease; used for transplant allocation.

```python
from meld import MELD

patient = {
    'dialysis': 0,           # Dialysis ≥2x in past week
    'creatinine': 2.5,       # mg/dL
    'bilirubin': 8.0,        # mg/dL
    'inr': 2.5,              # INR
    'sodium': 128            # mEq/L
}

result = MELD.calculate(patient)
print(f"MELD Score: {result['category']}")
print(f"Mortality: {result['interpretation']}")
```

**Note:** Returns both MELD and MELD-Na scores.

---

### 6. Cockcroft-Gault - Creatinine Clearance
**File:** `cockcroft_gault.py`
**Reference:** Cockcroft DW, Gault MH. Nephron. 1976

Estimates creatinine clearance for medication dosing adjustments.

```python
from cockcroft_gault import CockcroftGault

patient = {
    'age': 65,               # years
    'sex': 'male',           # 'male' or 'female'
    'weight': 80,            # kg
    'creatinine': 2.0        # mg/dL
}

result = CockcroftGault.calculate(patient)
print(f"CrCl: {result['score']} mL/min")
print(f"Kidney function: {result['interpretation']}")
```

**Important:** Use ideal body weight for obese patients (BMI >30).

---

## General Usage Pattern

All calculators follow the same pattern:

```python
from <module> import <ClassName>

# Prepare patient data as dictionary
patient_data = {
    'variable1': value1,
    'variable2': value2,
    # ... etc
}

# Calculate result
result = ClassName.calculate(patient_data)

# Access results
print(result['score'])          # Numeric score
print(result['category'])       # Score category
print(result['interpretation']) # Clinical interpretation
print(result['management'])     # Management recommendation
```

## Running Tests

Some scales include validation test cases. To run them:

```bash
# Run PREVENT validation tests
python prevent.py

# Run examples for any scale
python cha2ds2_vasc.py
python curb65.py
python wells_dvt.py
python meld.py
python cockcroft_gault.py
```

## Clinical Disclaimer

⚠️ **Important:** These implementations are for educational and reference purposes. Always verify results with official calculators (e.g., MDCalc) before making clinical decisions.

## Requirements

- Python 3.6+
- No external dependencies (uses only Python standard library)

## License

These implementations are based on published medical literature and clinical guidelines. See individual file headers for specific references.

## Contributing

To add a new clinical scale:

1. Create a new `.py` file with the scale name
2. Implement a class with a static `calculate()` method
3. Include proper documentation and references
4. Add example usage in `if __name__ == "__main__":` block
5. Update this README with the new scale

## References

All scales include citations to the original published research. Please refer to the individual Python files for detailed references and implementation notes.
