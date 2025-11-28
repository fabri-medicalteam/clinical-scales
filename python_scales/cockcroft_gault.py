"""
Cockcroft-Gault Creatinine Clearance

Estimates creatinine clearance (CrCl) for medication dosing.

Reference: Cockcroft DW, Gault MH. Nephron. 1976
"""

from typing import Dict


class CockcroftGault:
    """
    Cockcroft-Gault equation for creatinine clearance estimation.

    Estimates CrCl for medication dosing and kidney function assessment.

    Formula:
    CrCl = ((140 - age) × weight × sex_factor) / (72 × serum_creatinine)

    Variables:
        age: Age in years (18-120)
        sex: 'male' or 'female'
        weight: Body weight in kg (20-300)
        creatinine: Serum creatinine in mg/dL (0.1-20)

    Sex factors:
        Male: 1.0
        Female: 0.85

    Output: CrCl in mL/min
    """

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate Cockcroft-Gault creatinine clearance.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, category, interpretation, and management
        """
        # Parse inputs
        age = float(values.get('age', 40))
        weight = float(values.get('weight', 70))
        cr = float(values.get('creatinine', 1.0))
        sex = values.get('sex', 'male')

        # Determine sex factor
        sex_factor = 0.85 if sex == 'female' else 1.0

        # Calculate CrCl
        # CrCl = ((140 - age) * weight * sex_factor) / (72 * creatinine)
        crcl = ((140 - age) * weight * sex_factor) / (72 * cr)

        # Determine kidney function stage and dosing recommendations
        if crcl >= 90:
            stage = 'Normal or High'
            recommendation = 'No dose adjustment typically needed'
        elif crcl >= 60:
            stage = 'Mildly decreased'
            recommendation = 'Check drug-specific recommendations'
        elif crcl >= 30:
            stage = 'Moderately decreased'
            recommendation = 'Dose adjustment often required'
        elif crcl >= 15:
            stage = 'Severely decreased'
            recommendation = 'Significant dose adjustment required'
        else:
            stage = 'Kidney failure'
            recommendation = 'Dialysis consideration; major dose adjustments'

        return {
            'score': round(crcl, 1),
            'category': f'CrCl: {crcl:.1f} mL/min',
            'interpretation': f'Kidney function: {stage}',
            'management': recommendation
        }


# Example usage
if __name__ == "__main__":
    print("Cockcroft-Gault Creatinine Clearance Calculator")
    print("=" * 60 + "\n")

    # Example 1: Normal kidney function
    patient1 = {
        'age': 30,
        'sex': 'male',
        'weight': 70,
        'creatinine': 1.0
    }

    result1 = CockcroftGault.calculate(patient1)
    print("Example 1: Young male with normal creatinine")
    print(f"CrCl: {result1['category']}")
    print(f"{result1['interpretation']}")
    print(f"Recommendation: {result1['management']}\n")

    # Example 2: Mildly decreased in elderly female
    patient2 = {
        'age': 75,
        'sex': 'female',
        'weight': 60,
        'creatinine': 1.2
    }

    result2 = CockcroftGault.calculate(patient2)
    print("Example 2: Elderly female with mild renal impairment")
    print(f"CrCl: {result2['category']}")
    print(f"{result2['interpretation']}")
    print(f"Recommendation: {result2['management']}\n")

    # Example 3: Moderate renal impairment
    patient3 = {
        'age': 65,
        'sex': 'male',
        'weight': 80,
        'creatinine': 2.0
    }

    result3 = CockcroftGault.calculate(patient3)
    print("Example 3: Moderate renal impairment")
    print(f"CrCl: {result3['category']}")
    print(f"{result3['interpretation']}")
    print(f"Recommendation: {result3['management']}\n")

    # Example 4: Severe renal impairment
    patient4 = {
        'age': 70,
        'sex': 'female',
        'weight': 55,
        'creatinine': 4.5
    }

    result4 = CockcroftGault.calculate(patient4)
    print("Example 4: Severe renal impairment")
    print(f"CrCl: {result4['category']}")
    print(f"{result4['interpretation']}")
    print(f"Recommendation: {result4['management']}\n")

    print("Note: The Cockcroft-Gault equation estimates CrCl, not GFR.")
    print("For GFR estimation, consider using CKD-EPI or MDRD equations.")
    print("\nImportant: Use ideal body weight for obese patients (BMI >30).")
