"""
Cardiotoxicity Risk Score for Cancer Patients
Predicts susceptibility to cardiotoxicity in cancer patients receiving chemotherapy
Reference: Based on clinical cardio-oncology guidelines and risk stratification models
"""

class CardiotoxicityRiskScoreCancerPatients:
    """
    Variables:
    # Previous Radiotherapy (mediastinal or chest radiation): {"No": 0, "Yes": 2}
    # Acute Myeloid Leukemia diagnosis: {"No": 0, "Yes": 2}
    # Monoclonal Antibodies therapy (HER2-directed, anti-VEGF, checkpoint inhibitors): {"No": 0, "Yes": 1}
    # Baseline LVEF (Left Ventricular Ejection Fraction): {">64%": 0, "54-63%": 2, "≤53%": 3}
    # Baseline Serum Creatinine: {"<1.2 mg/dL": 0, "1.2-1.6 mg/dL": 1, "1.61-2.0 mg/dL": 2, ">2.0 mg/dL": 3}

    Interpretation:

    SCORE 0-1 - LOW RISK (<5%):
    Cardiotoxicity Incidence: 3.3%

    Recommendation:
    - Standard cardiac monitoring
    - Baseline echocardiography at treatment start
    - Clinical assessment each chemotherapy cycle
    - LVEF reassessment every 6-12 months during therapy
    - Routine post-treatment follow-up (annual)
    - Standard lifestyle counseling
    - No intensive cardioprotection needed
    - Patient education on warning signs
    - Continue regular oncology care


    SCORE 2 - MODERATE RISK (13-22%):
    Cardiotoxicity Incidence: 13-22%

    Recommendation:
    - Enhanced cardiac monitoring
    - Baseline echocardiography mandatory
    - Repeat echo every 3 months during active therapy
    - Baseline cardiac biomarkers (NT-ProBNP, troponin) with serial monitoring every 3 months
    - Monthly blood pressure monitoring
    - Consider cardioprotective agents (beta-blockers, ACE inhibitors/ARBs) if risk factors present
    - Discuss potential dose modifications if severe dysfunction develops
    - Coordinate care between oncology and cardiology
    - Patient education on warning signs (dyspnea, palpitations, orthopnea, fatigue)
    - Smoking cessation counseling
    - Moderate-intensity exercise 150 min/week
    - Sodium restriction if hypertensive
    - Monthly risk reassessment


    SCORE 3-4 - HIGH RISK (17-23%):
    Cardiotoxicity Incidence: 17-23%

    Recommendation:
    - Intensive cardiac monitoring mandatory
    - Baseline comprehensive evaluation (echo, biomarkers, EKG, stress testing if feasible)
    - Cardiology co-management recommended
    - Echo every 2-3 months during therapy
    - Monthly/bimonthly biomarker monitoring (NT-ProBNP, troponin I)
    - Monthly BP and HR monitoring
    - Initiate prophylactic cardioprotection (ACE inhibitors/ARBs, beta-blockers)
    - Consider dexrazoxane if cumulative anthracycline doses high
    - Dose modifications of cardiotoxic agents if LVEF decline >10% or <50%
    - Frequent oncology-cardiology communication
    - Aggressive risk factor modification (BP target <130/80, LDL <70)
    - Regular tailored exercise prescription
    - Dietary counseling (sodium/fluid restriction)
    - Stress management and sleep optimization
    - Reassess every 1-2 months during active therapy


    SCORE ≥5 - VERY HIGH RISK (>25%):
    Cardiotoxicity Incidence: >25%
    Sensitivity: 70%
    Specificity: 98.80% for identifying very high-risk patients

    Recommendation:
    - Intensive specialist surveillance required
    - Integrated cardio-oncology program mandatory
    - Baseline comprehensive imaging (2D/3D echo, strain imaging, cardiac MRI if indicated)
    - Baseline advanced biomarkers (NT-ProBNP, troponin I, galectin-3)
    - EKG at baseline and regularly
    - Consider baseline cardiac catheterization/stress testing to assess coronary reserve

    Preventive Cardioprotection Mandatory:
    - ACE inhibitor/ARB (target dose) PLUS beta-blocker (target dose)
    - Consider aldosterone antagonist (spironolactone 25-50 mg daily)
    - Dexrazoxane strongly considered if cumulative doxorubicin >400 mg/m²
    - Trastuzumab monitoring if HER2-directed therapy (close LVEF follow-up, consider temporary interruption if significant decline)

    Monitoring Schedule:
    - Biweekly/monthly biomarker monitoring during active therapy
    - Echo every 4-8 weeks during therapy and 3-6 months post-therapy
    - Strict BP control <130/80 mm Hg

    Additional Measures:
    - Avoid concurrent nephrotoxic agents (creatinine monitoring essential)
    - Optimize renal function (hydration, medication review)
    - Dose reduction or treatment modification if cardiac dysfunction emerges
    - Aggressive lifestyle modifications (sodium restriction, fluid restriction, exercise, weight management)
    - Frequent team meetings (every 2-4 weeks)
    - Patient education on daily weight monitoring (report >2-3 lb gain)
    - Smoking cessation mandatory
    - Psychological support for cancer and cardiac comorbidity
    - Post-treatment surveillance (every 3 months first year, every 6 months thereafter minimum)


    RISK FACTORS INTERPRETATION:

    Previous Radiotherapy (2 pts):
    - Significantly increases cardiotoxicity risk
    - Mediastinal radiation particularly concerning
    - Requires intense monitoring regardless of other factors

    Acute Myeloid Leukemia (2 pts):
    - High intrinsic cardiotoxicity risk
    - Often requires intensive chemotherapy with high cardiotoxicity burden

    Monoclonal Antibodies (1 pt):
    - HER2-directed agents (trastuzumab, pertuzumab, T-DM1)
    - Anti-VEGF agents (bevacizumab, sunitinib)
    - Checkpoint inhibitors (nivolumab, pembrolizumab)
    - Different monitoring strategies by agent

    Low LVEF (2-3 pts):
    - LVEF >64% protective
    - LVEF 54-63% intermediate risk (2 pts)
    - LVEF ≤53% high risk for further decline (3 pts)
    - Each 1% LVEF decrease increases risk

    Elevated Creatinine (1-3 pts):
    - Reflects renal function and systemic vascular disease
    - Higher creatinine predicts greater risk
    - Baseline renal dysfunction limits cardioprotective agent use
    - <1.2 mg/dL: 0 pts
    - 1.2-1.6 mg/dL: 1 pt
    - 1.61-2.0 mg/dL: 2 pts
    - >2.0 mg/dL: 3 pts


    MONITORING STRATEGY BY RISK CATEGORY:

    Low Risk (0-1):
    - Annual/biannual echo, clinical assessment each cycle

    Moderate Risk (2):
    - Echo every 3 months, monthly biomarkers, bimonthly clinical assessment

    High Risk (3-4):
    - Echo every 2-3 months, monthly biomarkers, monthly clinical assessment, cardiology co-management

    Very High Risk (≥5):
    - Echo every 4-8 weeks, biweekly biomarkers, biweekly clinical assessment, integrated cardio-oncology program


    CARDIOPROTECTIVE AGENTS:

    ACE Inhibitor/ARB:
    - Reduce afterload, prevent remodeling, improve survival
    - Start early in high-risk
    - Target: Lisinopril 10-20 mg daily equivalent

    Beta-Blocker:
    - Reduce myocardial O2 demand, prevent remodeling
    - Target: Metoprolol 190 mg daily, carvedilol 25 mg daily equivalent

    Dexrazoxane:
    - Iron chelator, reduces anthracycline cardiotoxicity
    - Consider if cumulative doxorubicin >400 mg/m²
    - Dose: 10 mg/kg IV pre-chemotherapy (max 500 mg/m² per cycle)

    Aldosterone Antagonist:
    - Additional neurohormonal blockade
    - Spironolactone 25-50 mg daily in very high-risk


    TREATMENT MODIFICATIONS:

    Dose Reduction:
    - Consider if LVEF decline >10% or LVEF <50%

    Treatment Interruption:
    - Temporary or permanent if severe cardiotoxicity (LVEF <40% or decline >15%)

    Alternative Agents:
    - Switch to less cardiotoxic alternatives if available


    SCRIBE TRIGGER SUGGESTIONS (Telepathy Intelligence):

    The following phrases in clinical transcripts/audio should trigger this cardiotoxicity risk calculator:

    Primary Triggers (High Confidence):
    - "cardiotoxicity risk"
    - "cardiac monitoring for chemotherapy"
    - "anthracycline cardiotoxicity"
    - "heart function before chemo"
    - "LVEF monitoring"
    - "cardio-oncology"
    - "chemotherapy heart damage"
    - "trastuzumab cardiac effects"
    - "doxorubicin heart toxicity"

    Cancer Treatment Context Triggers:
    - "starting doxorubicin"
    - "beginning adriamycin"
    - "HER2 positive therapy"
    - "trastuzumab therapy"
    - "anthracycline-based regimen"
    - "chest radiation history"
    - "mediastinal radiation"
    - "acute myeloid leukemia treatment"
    - "AML chemotherapy"

    Cardiac Assessment Triggers:
    - "baseline echo before chemo"
    - "ejection fraction assessment"
    - "cardiac clearance for chemotherapy"
    - "heart function monitoring"
    - "troponin before cancer treatment"
    - "NT-ProBNP baseline"
    - "cardiology clearance for chemo"

    Risk Factor Combination Triggers:
    - "previous radiation + chemotherapy"
    - "low ejection fraction + cancer"
    - "renal dysfunction + cardiotoxic chemo"
    - "elderly patient + anthracycline"
    - "hypertension + trastuzumab"

    Clinical Scenario Triggers:
    - "breast cancer HER2 positive"
    - "lymphoma with chest involvement"
    - "leukemia intensive chemotherapy"
    - "sarcoma with doxorubicin"
    - "can patient tolerate full dose chemo"
    - "cardiac risk stratification cancer"

    Follow-up and Monitoring Triggers:
    - "serial echo during chemo"
    - "monitoring heart during treatment"
    - "when to repeat echocardiogram"
    - "biomarker monitoring chemotherapy"
    - "cardioprotective medication"
    - "dexrazoxane indication"
    - "beta blocker for chemo protection"

    Warning Sign Triggers:
    - "shortness of breath during chemo"
    - "fatigue with chemotherapy"
    - "palpitations on trastuzumab"
    - "leg swelling during cancer treatment"
    - "orthopnea + chemotherapy"
    - "declining exercise tolerance chemo"

    Medication-Specific Triggers:
    - "doxorubicin dose"
    - "epirubicin cumulative dose"
    - "trastuzumab initiation"
    - "pertuzumab cardiac"
    - "bevacizumab heart"
    - "checkpoint inhibitor cardiotoxicity"
    - "nivolumab myocarditis"
    - "pembrolizumab cardiac"

    Multi-word Pattern Triggers:
    - "calculate cardiotoxicity risk"
    - "heart risk score for cancer patient"
    - "cardiac side effects of chemotherapy"
    - "safe to continue chemotherapy"
    - "heart damage from cancer treatment"
    - "need cardiology referral for chemo"

    Contextual Pattern Recognition:
    When the following combinations appear in same note/transcript:
    - Cancer diagnosis + Chemotherapy plan + Heart/cardiac mention
    - LVEF value + Cancer medication names
    - Creatinine level + Cardiotoxic agent + Cancer
    - Radiation history + Planned chemotherapy
    - Age >65 + Anthracycline + Any cardiac risk factor

    Question-Based Triggers:
    - "Is the patient's heart strong enough for chemo?"
    - "What is the cardiac risk?"
    - "Should we get cardiology involved?"
    - "Can we give full dose anthracycline?"
    - "Does the patient need an echo?"
    - "When should we monitor troponin?"
    - "Should we start cardioprotection?"
    """

    @staticmethod
    def calculate(inputs):
        """
        Calculate cardiotoxicity risk score

        Args:
            inputs (dict): Dictionary with keys:
                - 'radiotherapy': 0 (No) or 2 (Yes)
                - 'aml': 0 (No) or 2 (Yes)
                - 'monoclonal_antibodies': 0 (No) or 1 (Yes)
                - 'lvef': 0 (>64%), 2 (54-63%), or 3 (≤53%)
                - 'creatinine': 0 (<1.2), 1 (1.2-1.6), 2 (1.61-2.0), or 3 (>2.0)

        Returns:
            int: Total risk score (0-11 range)
        """
        score = 0
        for key, value in inputs.items():
            if isinstance(value, (int, str)) and str(value).lstrip('-').isdigit():
                score += int(value)
        return score

    @staticmethod
    def get_risk_category(score):
        """
        Get risk category based on score

        Args:
            score (int): Total cardiotoxicity risk score

        Returns:
            str: Risk category (Low, Moderate, High, Very High)
        """
        if score <= 1:
            return "Low Risk (<5%)"
        elif score == 2:
            return "Moderate Risk (13-22%)"
        elif score in [3, 4]:
            return "High Risk (17-23%)"
        else:  # score >= 5
            return "Very High Risk (>25%)"

# Example usage:
# inputs = {
#     'radiotherapy': 2,  # Yes
#     'aml': 0,  # No
#     'monoclonal_antibodies': 1,  # Yes
#     'lvef': 2,  # 54-63%
#     'creatinine': 1  # 1.2-1.6 mg/dL
# }
# score = CardiotoxicityRiskScoreCancerPatients.calculate(inputs)
# risk_category = CardiotoxicityRiskScoreCancerPatients.get_risk_category(score)
# print(f"Score: {score}, Risk Category: {risk_category}")
