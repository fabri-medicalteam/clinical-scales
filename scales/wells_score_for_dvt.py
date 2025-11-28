"""
Wells Score for DVT
Deep vein thrombosis probability
Reference: Wells PS, et al. NEJM. 2003
"""

class WellsScoreforDVT:
    """
    Variables:
    # Active cancer (treatment within 6mo or palliative): {"0": 0, "1": 1}
    # Paralysis, paresis, or recent leg immobilization: {"0": 0, "1": 1}
    # Bedridden >3 days or major surgery within 12 weeks: {"0": 0, "1": 1}
    # Localized tenderness along deep venous system: {"0": 0, "1": 1}
    # Entire leg swollen: {"0": 0, "1": 1}
    # Calf swelling >3cm compared to other leg: {"0": 0, "1": 1}
    # Pitting edema (greater in symptomatic leg): {"0": 0, "1": 1}
    # Collateral superficial veins (non-varicose): {"0": 0, "1": 1}
    # Previously documented DVT: {"0": 0, "1": 1}
    # Alternative diagnosis at least as likely: {"0": 0, "-2": -2}
    """

    @staticmethod
    def calculate(inputs):
        # Implement calculation logic
        score = sum(int(v) for v in inputs.values() if str(v).lstrip('-').isdigit())
        return score

# Example usage:
# result = WellsScoreforDVT.calculate({"var1": value1, "var2": value2})
