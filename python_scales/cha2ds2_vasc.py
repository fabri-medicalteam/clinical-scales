"""
CHA₂DS₂-VASc Score

Stroke risk stratification in patients with atrial fibrillation.

Reference: Lip GY, et al. Chest. 2010
"""

from typing import Dict, Union


class CHA2DS2VASc:
    """
    CHA₂DS₂-VASc Score for stroke risk in atrial fibrillation.

    Calculates annual stroke risk and provides anticoagulation recommendations.

    Variables:
        chf: Congestive heart failure (0=No, 1=Yes)
        hypertension: Hypertension history (0=No, 1=Yes)
        age: Age category (0=<65 years, 1=65-74 years, 2=≥75 years)
        diabetes: Diabetes mellitus (0=No, 1=Yes)
        stroke: Prior stroke/TIA/thromboembolism (0=No, 2=Yes)
        vascular: Vascular disease - MI, PAD, or aortic plaque (0=No, 1=Yes)
        sex: Sex category (0=Male, 1=Female)

    Score Range: 0-9 points
    """

    # Annual stroke risk by score
    RISK_MAP = {
        0: '0%',
        1: '1.3%',
        2: '2.2%',
        3: '3.2%',
        4: '4.0%',
        5: '6.7%',
        6: '9.8%',
        7: '9.6%',
        8: '12.5%',
        9: '15.2%'
    }

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate CHA₂DS₂-VASc score.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, category, interpretation, and management
        """
        # Sum all point values
        score = 0
        for value in values.values():
            score += int(value) if value else 0

        # Cap at maximum score of 9
        score = min(score, 9)

        # Get annual stroke risk
        risk = CHA2DS2VASc.RISK_MAP.get(score, '>15%')

        # Determine anticoagulation recommendation
        if score == 0:
            recommendation = 'No anticoagulation recommended (male) or consider (female with score 1)'
        elif score == 1:
            recommendation = 'Consider oral anticoagulation'
        else:
            recommendation = 'Oral anticoagulation recommended'

        return {
            'score': score,
            'category': f'Score: {score}',
            'interpretation': f'Annual stroke risk: {risk}',
            'management': recommendation
        }


# Example usage
if __name__ == "__main__":
    print("CHA₂DS₂-VASc Score Calculator")
    print("=" * 60 + "\n")

    # Example 1: Low risk male
    patient1 = {
        'chf': 0,
        'hypertension': 0,
        'age': 0,  # <65 years
        'diabetes': 0,
        'stroke': 0,
        'vascular': 0,
        'sex': 0  # Male
    }

    result1 = CHA2DS2VASc.calculate(patient1)
    print("Example 1: Low risk male <65 years")
    print(f"Score: {result1['score']}")
    print(f"{result1['interpretation']}")
    print(f"Recommendation: {result1['management']}\n")

    # Example 2: High risk patient
    patient2 = {
        'chf': 1,
        'hypertension': 1,
        'age': 2,  # ≥75 years
        'diabetes': 1,
        'stroke': 2,
        'vascular': 1,
        'sex': 1  # Female
    }

    result2 = CHA2DS2VASc.calculate(patient2)
    print("Example 2: High risk female ≥75 years with multiple comorbidities")
    print(f"Score: {result2['score']}")
    print(f"{result2['interpretation']}")
    print(f"Recommendation: {result2['management']}\n")

    # Example 3: Moderate risk
    patient3 = {
        'chf': 0,
        'hypertension': 1,
        'age': 1,  # 65-74 years
        'diabetes': 1,
        'stroke': 0,
        'vascular': 0,
        'sex': 0  # Male
    }

    result3 = CHA2DS2VASc.calculate(patient3)
    print("Example 3: Moderate risk male 65-74 years")
    print(f"Score: {result3['score']}")
    print(f"{result3['interpretation']}")
    print(f"Recommendation: {result3['management']}")
