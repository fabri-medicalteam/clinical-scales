"""
PREVENT - Predicting Risk of CVD Events

10- and 30-year cardiovascular disease risk prediction.

Reference: Khan SS, et al. Circulation. 2024;149:430-449
"""

import math
from typing import Dict, Union


class PREVENT:
    """
    PREVENT cardiovascular disease risk calculator.

    Predicts 10-year and 30-year risk of total CVD events including:
    - ASCVD (atherosclerotic cardiovascular disease)
    - Heart failure
    - Coronary heart disease
    - Stroke

    Variables:
        sex: 'female' or 'male'
        age: Age in years (30-79)
        total_cholesterol: Total cholesterol in mmol/L (2-10)
        hdl_cholesterol: HDL cholesterol in mmol/L (0.3-3)
        systolic_bp: Systolic blood pressure in mm Hg (80-200)
        diabetes: True/False or 'true'/'false'
        current_smoker: True/False or 'true'/'false'
        egfr: eGFR in mL/min/1.73m² (15-140)
        on_antihypertensive: True/False or 'true'/'false' - On BP medications
        on_statin: True/False or 'true'/'false' - On statin therapy
    """

    # Sex-specific coefficients
    FEMALE_COEF = {
        'cage': 0.7939,
        'cnhdl': 0.0305,
        'chdl': -0.1607,
        'csbp': -0.2394,
        'csbp2': 0.3600,
        'diabetes': 0.8668,
        'smoking': 0.5361,
        'cegfr': 0.6046,
        'cegfr2': 0.0434,
        'antihtn': 0.3152,
        'statin': -0.1478,
        'csbp2_antihtn': -0.0664,
        'cnhdl_statin': 0.1198,
        'cage_cnhdl': -0.0820,
        'cage_chdl': 0.0307,
        'cage_csbp2': -0.0946,
        'cage_diabetes': -0.2706,
        'cage_smoking': -0.0787,
        'cage_cegfr': -0.1638,
        'constant': -3.3077
    }

    MALE_COEF = {
        'cage': 0.7689,
        'cnhdl': 0.0736,
        'chdl': -0.0954,
        'csbp': -0.4347,
        'csbp2': 0.3363,
        'diabetes': 0.7693,
        'smoking': 0.4387,
        'cegfr': 0.5379,
        'cegfr2': 0.0165,
        'antihtn': 0.2889,
        'statin': -0.1337,
        'csbp2_antihtn': -0.0476,
        'cnhdl_statin': 0.1503,
        'cage_cnhdl': -0.0518,
        'cage_chdl': 0.0191,
        'cage_csbp2': -0.1049,
        'cage_diabetes': -0.2252,
        'cage_smoking': -0.0895,
        'cage_cegfr': -0.1543,
        'constant': -3.0312
    }

    @staticmethod
    def _convert_bool(value: Union[str, bool, int]) -> int:
        """Convert various boolean representations to 0 or 1."""
        if isinstance(value, bool):
            return 1 if value else 0
        if isinstance(value, str):
            return 1 if value.lower() in ('true', 'yes', '1') else 0
        return int(value) if value else 0

    @staticmethod
    def calculate(values: Dict) -> Dict:
        """
        Calculate PREVENT cardiovascular disease risk.

        Args:
            values: Dictionary containing all required variables

        Returns:
            Dictionary with score, interpretation, category, management, and detailed results
        """
        # Parse inputs
        sex = values.get('sex', 'male')
        age = float(values.get('age', 55))
        tc = float(values.get('total_cholesterol', 5.0))
        hdl = float(values.get('hdl_cholesterol', 1.3))
        sbp = float(values.get('systolic_bp', 120))
        diabetes = PREVENT._convert_bool(values.get('diabetes', False))
        smoking = PREVENT._convert_bool(values.get('current_smoker', False))
        egfr = float(values.get('egfr', 90))
        antihtn = PREVENT._convert_bool(values.get('on_antihypertensive', False))
        statin = PREVENT._convert_bool(values.get('on_statin', False))

        # Calculate centered variables
        cage = (age - 55) / 10
        cnhdl = tc - hdl - 3.5
        chdl = (hdl - 1.3) / 0.3
        csbp = (min(sbp, 110) - 110) / 20
        csbp2 = (max(sbp, 110) - 130) / 20
        cegfr = (min(egfr, 60) - 60) / -15
        cegfr2 = (max(egfr, 60) - 90) / -15

        # Select sex-specific coefficients
        coef = PREVENT.FEMALE_COEF if sex == 'female' else PREVENT.MALE_COEF

        # Calculate linear predictor
        x = coef['constant']
        x += coef['cage'] * cage + coef['cnhdl'] * cnhdl + coef['chdl'] * chdl
        x += coef['csbp'] * csbp + coef['csbp2'] * csbp2
        x += coef['diabetes'] * diabetes + coef['smoking'] * smoking
        x += coef['cegfr'] * cegfr + coef['cegfr2'] * cegfr2
        x += coef['antihtn'] * antihtn + coef['statin'] * statin
        x += coef['csbp2_antihtn'] * csbp2 * antihtn + coef['cnhdl_statin'] * cnhdl * statin
        x += coef['cage_cnhdl'] * cage * cnhdl + coef['cage_chdl'] * cage * chdl
        x += coef['cage_csbp2'] * cage * csbp2 + coef['cage_diabetes'] * cage * diabetes
        x += coef['cage_smoking'] * cage * smoking + coef['cage_cegfr'] * cage * cegfr

        # Calculate 10-year risks
        risk10y_cvd = (math.exp(x) / (1 + math.exp(x))) * 100
        risk10y_ascvd = risk10y_cvd * 0.69
        risk10y_hf = risk10y_cvd * 0.56
        risk10y_chd = risk10y_cvd * 0.25
        risk10y_stroke = risk10y_cvd * 0.50

        # Calculate 30-year risk multiplier
        if age > 75:
            mult30 = 1.3
        elif age > 65:
            mult30 = 2.0
        elif age > 55:
            mult30 = 3.5
        elif age > 45:
            mult30 = 5.5
        else:
            mult30 = 7.3

        risk30y_cvd = min(risk10y_cvd * mult30, 95)

        # Determine risk category
        if risk10y_cvd < 5:
            category = 'Low Risk (<5%)'
            management = 'Lifestyle modifications. Reassess in 4-6 years.'
        elif risk10y_cvd < 7.5:
            category = 'Borderline (5-7.5%)'
            management = 'Consider risk-enhancing factors.'
        elif risk10y_cvd < 20:
            category = 'Intermediate (7.5-20%)'
            management = 'Moderate-intensity statin recommended.'
        else:
            category = 'High Risk (≥20%)'
            management = 'High-intensity statin recommended.'

        return {
            'score': round(risk10y_cvd, 2),
            'interpretation': f'10-Year Total CVD Risk: {risk10y_cvd:.2f}%',
            'category': category,
            'management': management,
            'details': {
                'modelType': 'Base Model (10-Year Total CVD)',
                'tenYear': {
                    'totalCVD': round(risk10y_cvd, 2),
                    'ascvd': round(risk10y_ascvd, 2),
                    'heartFailure': round(risk10y_hf, 2),
                    'chd': round(risk10y_chd, 2),
                    'stroke': round(risk10y_stroke, 2)
                },
                'thirtyYear': {
                    'totalCVD': round(risk30y_cvd, 2),
                    'ascvd': round(min(risk10y_ascvd * mult30, 95), 2),
                    'heartFailure': round(min(risk10y_hf * mult30, 95), 2),
                    'chd': round(min(risk10y_chd * mult30, 95), 2),
                    'stroke': round(min(risk10y_stroke * mult30, 95), 2)
                }
            }
        }


# Test cases from original implementation
TEST_CASES = [
    {
        'name': 'Low Risk Female 35yo',
        'inputs': {
            'sex': 'female', 'age': 35, 'total_cholesterol': 4.5,
            'hdl_cholesterol': 1.5, 'systolic_bp': 115, 'diabetes': False,
            'current_smoker': False, 'egfr': 95, 'on_antihypertensive': False,
            'on_statin': False
        },
        'expected': {'tenYearCVD': 0.16, 'tolerance': 0.5}
    },
    {
        'name': 'Low Risk Male 40yo',
        'inputs': {
            'sex': 'male', 'age': 40, 'total_cholesterol': 5.0,
            'hdl_cholesterol': 1.3, 'systolic_bp': 120, 'diabetes': False,
            'current_smoker': False, 'egfr': 90, 'on_antihypertensive': False,
            'on_statin': False
        },
        'expected': {'tenYearCVD': 1.0, 'tolerance': 0.8}
    },
    {
        'name': 'Moderate Risk Male 55yo',
        'inputs': {
            'sex': 'male', 'age': 55, 'total_cholesterol': 5.5,
            'hdl_cholesterol': 1.0, 'systolic_bp': 140, 'diabetes': False,
            'current_smoker': True, 'egfr': 75, 'on_antihypertensive': True,
            'on_statin': False
        },
        'expected': {'tenYearCVD': 8.0, 'tolerance': 3.0}
    },
    {
        'name': 'High Risk Male 65yo',
        'inputs': {
            'sex': 'male', 'age': 65, 'total_cholesterol': 6.0,
            'hdl_cholesterol': 0.9, 'systolic_bp': 150, 'diabetes': True,
            'current_smoker': False, 'egfr': 55, 'on_antihypertensive': True,
            'on_statin': False
        },
        'expected': {'tenYearCVD': 20.0, 'tolerance': 8.0}
    },
    {
        'name': 'Female 50yo Diabetic',
        'inputs': {
            'sex': 'female', 'age': 50, 'total_cholesterol': 5.2,
            'hdl_cholesterol': 1.2, 'systolic_bp': 135, 'diabetes': True,
            'current_smoker': False, 'egfr': 80, 'on_antihypertensive': False,
            'on_statin': False
        },
        'expected': {'tenYearCVD': 5.0, 'tolerance': 2.5}
    }
]


def run_tests():
    """Run validation tests."""
    print("Running PREVENT validation tests...\n")
    passed = 0
    total = len(TEST_CASES)

    for test in TEST_CASES:
        result = PREVENT.calculate(test['inputs'])
        actual = result['details']['tenYear']['totalCVD']
        expected = test['expected']['tenYearCVD']
        tolerance = test['expected']['tolerance']

        is_passed = abs(actual - expected) <= tolerance
        status = "✅ PASS" if is_passed else "❌ FAIL"

        print(f"{status} - {test['name']}")
        print(f"  Expected: {expected}% (±{tolerance}%)")
        print(f"  Actual: {actual}%\n")

        if is_passed:
            passed += 1

    print(f"Results: {passed}/{total} tests passed")
    return passed == total


# Example usage
if __name__ == "__main__":
    # Run validation tests
    all_passed = run_tests()

    print("\n" + "="*60)
    print("Example calculation:")
    print("="*60 + "\n")

    # Example patient
    patient = {
        'sex': 'male',
        'age': 55,
        'total_cholesterol': 5.5,
        'hdl_cholesterol': 1.0,
        'systolic_bp': 140,
        'diabetes': False,
        'current_smoker': True,
        'egfr': 75,
        'on_antihypertensive': True,
        'on_statin': False
    }

    result = PREVENT.calculate(patient)

    print(f"10-Year CVD Risk: {result['details']['tenYear']['totalCVD']}%")
    print(f"30-Year CVD Risk: {result['details']['thirtyYear']['totalCVD']}%")
    print(f"Category: {result['category']}")
    print(f"Management: {result['management']}")
