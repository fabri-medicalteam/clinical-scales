"""
MELD Score - Model for End-Stage Liver Disease

Severity of chronic liver disease and mortality prediction.

Reference: Kamath PS, et al. Hepatology. 2001
"""

import math
from typing import Dict, Union


class MELD:
    """
    MELD (Model for End-Stage Liver Disease) Score.

    Predicts 3-month mortality in patients with end-stage liver disease.
    Used for liver transplant allocation.

    Variables:
        dialysis: Dialysis at least twice in past week (0=No, 1=Yes)
        creatinine: Serum creatinine in mg/dL (0.1-15)
        bilirubin: Total bilirubin in mg/dL (0.1-50)
        inr: International normalized ratio (0.5-10)
        sodium: Serum sodium in mEq/L (100-160) - for MELD-Na calculation

    Score Range: 6-40 (both MELD and MELD-Na are capped at these values)
    """

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate MELD and MELD-Na scores.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, category, interpretation, and management
        """
        # Parse inputs
        cr = float(values.get('creatinine', 1.0))
        bili = float(values.get('bilirubin', 1.0))
        inr = float(values.get('inr', 1.0))
        na = float(values.get('sodium', 140))
        dialysis = values.get('dialysis', 0)

        # Handle dialysis: if on dialysis (≥2x/week), set creatinine to 4
        if dialysis == '1' or dialysis == 1 or dialysis is True:
            cr = 4.0

        # Cap creatinine values
        cr = max(1.0, min(cr, 4.0))
        cr_capped = max(1.0, cr)
        bili_capped = max(1.0, bili)
        inr_capped = max(1.0, inr)
        na_capped = max(125, min(na, 137))

        # Calculate MELD score
        # MELD = 10 × (0.957 × ln(creatinine) + 0.378 × ln(bilirubin) + 1.120 × ln(INR) + 0.643)
        meld = round(
            10 * (0.957 * math.log(cr_capped) +
                  0.378 * math.log(bili_capped) +
                  1.120 * math.log(inr_capped) +
                  0.643)
        )
        meld_capped = max(6, min(meld, 40))

        # Calculate MELD-Na score
        # MELD-Na = MELD + 1.32 × (137 - Na) - 0.033 × MELD × (137 - Na)
        meld_na = round(
            meld_capped + 1.32 * (137 - na_capped) - 0.033 * meld_capped * (137 - na_capped)
        )
        meld_na_capped = max(6, min(meld_na, 40))

        # Determine mortality risk
        if meld_capped <= 9:
            mortality = '1.9% (3-month)'
        elif meld_capped <= 19:
            mortality = '6% (3-month)'
        elif meld_capped <= 29:
            mortality = '19.6% (3-month)'
        elif meld_capped <= 39:
            mortality = '52.6% (3-month)'
        else:
            mortality = '71.3% (3-month)'

        # Management recommendation
        management = 'Consider transplant referral' if meld_capped >= 15 else 'Monitor closely'

        return {
            'score': meld_na_capped,
            'category': f'MELD: {meld_capped} | MELD-Na: {meld_na_capped}',
            'interpretation': f'Mortality: {mortality}',
            'management': management
        }


# Example usage
if __name__ == "__main__":
    print("MELD Score Calculator")
    print("=" * 60 + "\n")

    # Example 1: Low MELD score
    patient1 = {
        'dialysis': 0,
        'creatinine': 0.9,
        'bilirubin': 1.2,
        'inr': 1.1,
        'sodium': 140
    }

    result1 = MELD.calculate(patient1)
    print("Example 1: Mild liver disease")
    print(f"MELD Score: {result1['category']}")
    print(f"{result1['interpretation']}")
    print(f"Management: {result1['management']}\n")

    # Example 2: Moderate MELD score
    patient2 = {
        'dialysis': 0,
        'creatinine': 1.5,
        'bilirubin': 3.0,
        'inr': 1.8,
        'sodium': 135
    }

    result2 = MELD.calculate(patient2)
    print("Example 2: Moderate liver disease")
    print(f"MELD Score: {result2['category']}")
    print(f"{result2['interpretation']}")
    print(f"Management: {result2['management']}\n")

    # Example 3: High MELD score with hyponatremia
    patient3 = {
        'dialysis': 0,
        'creatinine': 2.5,
        'bilirubin': 8.0,
        'inr': 2.5,
        'sodium': 128
    }

    result3 = MELD.calculate(patient3)
    print("Example 3: Severe liver disease with hyponatremia")
    print(f"MELD Score: {result3['category']}")
    print(f"{result3['interpretation']}")
    print(f"Management: {result3['management']}\n")

    # Example 4: Patient on dialysis
    patient4 = {
        'dialysis': 1,
        'creatinine': 5.0,  # Will be set to 4.0 due to dialysis
        'bilirubin': 5.0,
        'inr': 2.0,
        'sodium': 132
    }

    result4 = MELD.calculate(patient4)
    print("Example 4: Patient on dialysis (≥2x/week)")
    print(f"MELD Score: {result4['category']}")
    print(f"{result4['interpretation']}")
    print(f"Management: {result4['management']}\n")

    print("Note: MELD-Na is often preferred for transplant allocation as it")
    print("accounts for hyponatremia, which is associated with worse outcomes.")
