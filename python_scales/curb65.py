"""
CURB-65 Score

Pneumonia severity assessment and mortality risk prediction.

Reference: Lim WS, et al. Thorax. 2003
"""

from typing import Dict


class CURB65:
    """
    CURB-65 Score for community-acquired pneumonia severity.

    Predicts 30-day mortality and guides disposition decisions.

    Variables:
        confusion: New onset confusion (0=No, 1=Yes)
        bun: Blood urea nitrogen (0=≤19 mg/dL or ≤7 mmol/L, 1=>19 mg/dL or >7 mmol/L)
        rr: Respiratory rate (0=<30/min, 1=≥30/min)
        bp: Blood pressure (0=SBP≥90 or DBP≥60, 1=SBP<90 or DBP<60)
        age: Age (0=<65 years, 1=≥65 years)

    Score Range: 0-5 points
    """

    # 30-day mortality risk by score
    MORTALITY_RISK = {
        0: '0.6%',
        1: '2.7%',
        2: '6.8%',
        3: '14%',
        4: '27.8%',
        5: '27.8%'
    }

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate CURB-65 score.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, category, interpretation, and management
        """
        # Sum all point values
        score = 0
        for value in values.values():
            score += int(value) if value else 0

        # Cap at maximum score of 5
        score = min(score, 5)

        # Get mortality risk
        mortality = CURB65.MORTALITY_RISK.get(score, '>27%')

        # Determine disposition recommendation
        if score <= 1:
            disposition = 'Outpatient treatment'
        elif score == 2:
            disposition = 'Consider hospital admission'
        else:
            disposition = 'Hospital admission (ICU if 4-5)'

        return {
            'score': score,
            'category': f'CURB-65: {score}',
            'interpretation': f'30-day mortality: {mortality}',
            'management': disposition
        }


# Example usage
if __name__ == "__main__":
    print("CURB-65 Score Calculator")
    print("=" * 60 + "\n")

    # Example 1: Low risk - outpatient treatment
    patient1 = {
        'confusion': 0,
        'bun': 0,
        'rr': 0,
        'bp': 0,
        'age': 0
    }

    result1 = CURB65.calculate(patient1)
    print("Example 1: Young patient, normal vitals")
    print(f"Score: {result1['score']}")
    print(f"{result1['interpretation']}")
    print(f"Recommendation: {result1['management']}\n")

    # Example 2: Moderate risk - consider admission
    patient2 = {
        'confusion': 0,
        'bun': 1,
        'rr': 1,
        'bp': 0,
        'age': 0
    }

    result2 = CURB65.calculate(patient2)
    print("Example 2: Elevated BUN and respiratory rate")
    print(f"Score: {result2['score']}")
    print(f"{result2['interpretation']}")
    print(f"Recommendation: {result2['management']}\n")

    # Example 3: High risk - hospitalization
    patient3 = {
        'confusion': 1,
        'bun': 1,
        'rr': 1,
        'bp': 1,
        'age': 1
    }

    result3 = CURB65.calculate(patient3)
    print("Example 3: Elderly patient with confusion and abnormal vitals")
    print(f"Score: {result3['score']}")
    print(f"{result3['interpretation']}")
    print(f"Recommendation: {result3['management']}\n")

    # Example 4: Very high risk - ICU consideration
    patient4 = {
        'confusion': 1,
        'bun': 1,
        'rr': 0,
        'bp': 1,
        'age': 1
    }

    result4 = CURB65.calculate(patient4)
    print("Example 4: Elderly patient with hypotension and confusion")
    print(f"Score: {result4['score']}")
    print(f"{result4['interpretation']}")
    print(f"Recommendation: {result4['management']}")
