"""
Wells Score for DVT

Deep vein thrombosis probability assessment.

Reference: Wells PS, et al. NEJM. 2003
"""

from typing import Dict


class WellsDVT:
    """
    Wells Score for Deep Vein Thrombosis (DVT) probability.

    Estimates pretest probability of DVT and guides diagnostic workup.

    Variables:
        cancer: Active cancer (treatment within 6mo or palliative) (0=No, 1=Yes)
        paralysis: Paralysis, paresis, or recent leg immobilization (0=No, 1=Yes)
        bedridden: Bedridden >3 days or major surgery within 12 weeks (0=No, 1=Yes)
        tenderness: Localized tenderness along deep venous system (0=No, 1=Yes)
        swelling: Entire leg swollen (0=No, 1=Yes)
        calf: Calf swelling >3cm compared to other leg (0=No, 1=Yes)
        edema: Pitting edema (greater in symptomatic leg) (0=No, 1=Yes)
        veins: Collateral superficial veins (non-varicose) (0=No, 1=Yes)
        previous: Previously documented DVT (0=No, 1=Yes)
        alternative: Alternative diagnosis at least as likely (0=No, -2=Yes)

    Score Range: -2 to 8 points
    """

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate Wells Score for DVT.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, category, interpretation, and management
        """
        # Sum all point values
        score = 0
        for value in values.values():
            score += int(value) if value else 0

        # Determine risk category and management
        if score <= 0:
            risk = 'Low (5%)'
            management = 'D-dimer; if negative, DVT excluded'
        elif score <= 2:
            risk = 'Moderate (17%)'
            management = 'D-dimer or ultrasound'
        else:
            risk = 'High (53%)'
            management = 'Ultrasound recommended'

        return {
            'score': score,
            'category': f'Wells Score: {score}',
            'interpretation': f'DVT probability: {risk}',
            'management': management
        }


# Example usage
if __name__ == "__main__":
    print("Wells Score for DVT Calculator")
    print("=" * 60 + "\n")

    # Example 1: Low probability
    patient1 = {
        'cancer': 0,
        'paralysis': 0,
        'bedridden': 0,
        'tenderness': 1,
        'swelling': 0,
        'calf': 0,
        'edema': 0,
        'veins': 0,
        'previous': 0,
        'alternative': -2  # Alternative diagnosis likely
    }

    result1 = WellsDVT.calculate(patient1)
    print("Example 1: Calf tenderness with likely alternative diagnosis")
    print(f"Score: {result1['score']}")
    print(f"{result1['interpretation']}")
    print(f"Management: {result1['management']}\n")

    # Example 2: Moderate probability
    patient2 = {
        'cancer': 0,
        'paralysis': 0,
        'bedridden': 1,
        'tenderness': 1,
        'swelling': 0,
        'calf': 0,
        'edema': 0,
        'veins': 0,
        'previous': 0,
        'alternative': 0
    }

    result2 = WellsDVT.calculate(patient2)
    print("Example 2: Recent surgery with leg tenderness")
    print(f"Score: {result2['score']}")
    print(f"{result2['interpretation']}")
    print(f"Management: {result2['management']}\n")

    # Example 3: High probability
    patient3 = {
        'cancer': 1,
        'paralysis': 0,
        'bedridden': 1,
        'tenderness': 1,
        'swelling': 1,
        'calf': 1,
        'edema': 1,
        'veins': 0,
        'previous': 1,
        'alternative': 0
    }

    result3 = WellsDVT.calculate(patient3)
    print("Example 3: Active cancer, recent immobilization, multiple clinical signs")
    print(f"Score: {result3['score']}")
    print(f"{result3['interpretation']}")
    print(f"Management: {result3['management']}\n")

    # Example 4: Moderate probability with previous DVT
    patient4 = {
        'cancer': 0,
        'paralysis': 0,
        'bedridden': 0,
        'tenderness': 1,
        'swelling': 0,
        'calf': 1,
        'edema': 0,
        'veins': 0,
        'previous': 1,
        'alternative': 0
    }

    result4 = WellsDVT.calculate(patient4)
    print("Example 4: History of DVT with current symptoms")
    print(f"Score: {result4['score']}")
    print(f"{result4['interpretation']}")
    print(f"Management: {result4['management']}")
