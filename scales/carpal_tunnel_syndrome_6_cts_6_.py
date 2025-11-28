"""
Carpal Tunnel Syndrome-6 (CTS-6)
Estimates the likelihood of carpal tunnel syndrome (CTS) in adults using symptoms and physical exam findings
Reference: Various sources
"""

class CarpalTunnelSyndrome6CTS6:
    """
    Variables:
    # Numbness predominately or exclusively in median nerve territory (sensory symptoms are mostly in the thumb, index, middle, and/or ring fingers): {"0": 0, "1": 3.5}
    # Nocturnal numbness (symptoms are prominent when patient sleeps; numbness wakes patient from sleep): {"0": 0, "1": 4}
    # Thenar atrophy and/or weakness (the bulk of the thenar area is reduced or manual motor testing shows strength of grade 4 or less): {"0": 0, "1": 5}
    # Positive Phalen test (flexion of the wrist reproduces or worsens symptoms of numbness in the median nerve territory): {"0": 0, "1": 5}
    # Loss of 2 point discrimination (a failure to discriminate two points held 5 mm or less apart from one another in the median nerve innervated digits): {"0": 0, "1": 4.5}
    # Positive Tinel sign (light tapping over the median nerve at the level of the carpal tunnel causing radiating paresthesia into the median nerve innervated digits): {"0": 0, "1": 4}
    """

    @staticmethod
    def calculate(inputs):
        score = 0
        for key, value in inputs.items():
            score += int(value) if isinstance(value, (int, str)) and str(value).lstrip('-').isdigit() else 0
        return score

# Example usage:
# result = CarpalTunnelSyndrome6CTS6.calculate({"var1": value1, "var2": value2})
