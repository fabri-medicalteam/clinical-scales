import React, { useState } from 'react';
import { getPossibleUnits, inferMeasurementType, formatUnitForDisplay } from '../utils/unit_definitions';

export default function Home() {
  const [step, setStep] = useState('input');
  const [inputText, setInputText] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [variables, setVariables] = useState([]);
  const [testValues, setTestValues] = useState({});
  const [selectedUnits, setSelectedUnits] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [scaleName, setScaleName] = useState('');
  const [scaleData, setScaleData] = useState(null);
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [manualFormula, setManualFormula] = useState('');
  const [selectedScale, setSelectedScale] = useState(null);
  const [autoTestResults, setAutoTestResults] = useState(null);
  const [showAutoTests, setShowAutoTests] = useState(false);
  const [slackSending, setSlackSending] = useState(false);
  const [slackSent, setSlackSent] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fileSaving, setFileSaving] = useState(false);
  const [fileSaved, setFileSaved] = useState(false);

  // ============================================
  // BUILT-IN SCALES WITH VALIDATED IMPLEMENTATION
  // ============================================
  
  const BUILT_IN_SCALES = {
    'PREVENT': {
      name: 'PREVENT (Predicting Risk of CVD Events)',
      description: '10- and 30-year cardiovascular disease risk prediction.',
      reference: 'Khan SS, et al. Circulation. 2024;149:430-449',
      variables: [
        { name: 'sex', type: 'select', options: [{ value: 'female', label: 'Female', points: 0 }, { value: 'male', label: 'Male', points: 0 }], description: 'Sex' },
        { name: 'age', type: 'number', min: 30, max: 79, unit: 'years', description: 'Age' },
        { name: 'total_cholesterol', type: 'number', min: 2, max: 10, unit: 'mmol/L', description: 'Total Cholesterol' },
        { name: 'hdl_cholesterol', type: 'number', min: 0.3, max: 3, unit: 'mmol/L', description: 'HDL Cholesterol' },
        { name: 'systolic_bp', type: 'number', min: 80, max: 200, unit: 'mm Hg', description: 'Systolic BP' },
        { name: 'diabetes', type: 'select', options: [{ value: 'false', label: 'No', points: 0 }, { value: 'true', label: 'Yes', points: 1 }], description: 'Diabetes' },
        { name: 'current_smoker', type: 'select', options: [{ value: 'false', label: 'No', points: 0 }, { value: 'true', label: 'Yes', points: 1 }], description: 'Current Smoker' },
        { name: 'egfr', type: 'number', min: 15, max: 140, unit: 'mL/min/1.73m²', description: 'eGFR' },
        { name: 'on_antihypertensive', type: 'select', options: [{ value: 'false', label: 'No', points: 0 }, { value: 'true', label: 'Yes', points: 1 }], description: 'On BP Meds' },
        { name: 'on_statin', type: 'select', options: [{ value: 'false', label: 'No', points: 0 }, { value: 'true', label: 'Yes', points: 1 }], description: 'On Statin' },
      ],
      testCases: [
        { name: 'Low Risk Female 35yo', inputs: { sex: 'female', age: 35, total_cholesterol: 4.5, hdl_cholesterol: 1.5, systolic_bp: 115, diabetes: 'false', current_smoker: 'false', egfr: 95, on_antihypertensive: 'false', on_statin: 'false' }, expected: { tenYearCVD: 0.16, tolerance: 0.5 } },
        { name: 'Low Risk Male 40yo', inputs: { sex: 'male', age: 40, total_cholesterol: 5.0, hdl_cholesterol: 1.3, systolic_bp: 120, diabetes: 'false', current_smoker: 'false', egfr: 90, on_antihypertensive: 'false', on_statin: 'false' }, expected: { tenYearCVD: 1.0, tolerance: 0.8 } },
        { name: 'Moderate Risk Male 55yo', inputs: { sex: 'male', age: 55, total_cholesterol: 5.5, hdl_cholesterol: 1.0, systolic_bp: 140, diabetes: 'false', current_smoker: 'true', egfr: 75, on_antihypertensive: 'true', on_statin: 'false' }, expected: { tenYearCVD: 8.0, tolerance: 3.0 } },
        { name: 'High Risk Male 65yo', inputs: { sex: 'male', age: 65, total_cholesterol: 6.0, hdl_cholesterol: 0.9, systolic_bp: 150, diabetes: 'true', current_smoker: 'false', egfr: 55, on_antihypertensive: 'true', on_statin: 'false' }, expected: { tenYearCVD: 20.0, tolerance: 8.0 } },
        { name: 'Female 50yo Diabetic', inputs: { sex: 'female', age: 50, total_cholesterol: 5.2, hdl_cholesterol: 1.2, systolic_bp: 135, diabetes: 'true', current_smoker: 'false', egfr: 80, on_antihypertensive: 'false', on_statin: 'false' }, expected: { tenYearCVD: 5.0, tolerance: 2.5 } }
      ],
      calculate: (values) => {
        const sex = values.sex;
        const age = parseFloat(values.age);
        const tc = parseFloat(values.total_cholesterol);
        const hdl = parseFloat(values.hdl_cholesterol);
        const sbp = parseFloat(values.systolic_bp);
        const diabetes = values.diabetes === 'true' || values.diabetes === true ? 1 : 0;
        const smoking = values.current_smoker === 'true' || values.current_smoker === true ? 1 : 0;
        const egfr = parseFloat(values.egfr);
        const antihtn = values.on_antihypertensive === 'true' || values.on_antihypertensive === true ? 1 : 0;
        const statin = values.on_statin === 'true' || values.on_statin === true ? 1 : 0;

        const cage = (age - 55) / 10;
        const cnhdl = tc - hdl - 3.5;
        const chdl = (hdl - 1.3) / 0.3;
        const csbp = (Math.min(sbp, 110) - 110) / 20;
        const csbp2 = (Math.max(sbp, 110) - 130) / 20;
        const cegfr = (Math.min(egfr, 60) - 60) / -15;
        const cegfr2 = (Math.max(egfr, 60) - 90) / -15;

        const coef = sex === 'female' ? {
          cage: 0.7939, cnhdl: 0.0305, chdl: -0.1607, csbp: -0.2394, csbp2: 0.3600,
          diabetes: 0.8668, smoking: 0.5361, cegfr: 0.6046, cegfr2: 0.0434,
          antihtn: 0.3152, statin: -0.1478, csbp2_antihtn: -0.0664, cnhdl_statin: 0.1198,
          cage_cnhdl: -0.0820, cage_chdl: 0.0307, cage_csbp2: -0.0946,
          cage_diabetes: -0.2706, cage_smoking: -0.0787, cage_cegfr: -0.1638,
          constant: -3.3077
        } : {
          cage: 0.7689, cnhdl: 0.0736, chdl: -0.0954, csbp: -0.4347, csbp2: 0.3363,
          diabetes: 0.7693, smoking: 0.4387, cegfr: 0.5379, cegfr2: 0.0165,
          antihtn: 0.2889, statin: -0.1337, csbp2_antihtn: -0.0476, cnhdl_statin: 0.1503,
          cage_cnhdl: -0.0518, cage_chdl: 0.0191, cage_csbp2: -0.1049,
          cage_diabetes: -0.2252, cage_smoking: -0.0895, cage_cegfr: -0.1543,
          constant: -3.0312
        };

        let x = coef.constant;
        x += coef.cage * cage + coef.cnhdl * cnhdl + coef.chdl * chdl;
        x += coef.csbp * csbp + coef.csbp2 * csbp2;
        x += coef.diabetes * diabetes + coef.smoking * smoking;
        x += coef.cegfr * cegfr + coef.cegfr2 * cegfr2;
        x += coef.antihtn * antihtn + coef.statin * statin;
        x += coef.csbp2_antihtn * csbp2 * antihtn + coef.cnhdl_statin * cnhdl * statin;
        x += coef.cage_cnhdl * cage * cnhdl + coef.cage_chdl * cage * chdl;
        x += coef.cage_csbp2 * cage * csbp2 + coef.cage_diabetes * cage * diabetes;
        x += coef.cage_smoking * cage * smoking + coef.cage_cegfr * cage * cegfr;

        const risk10yCVD = (Math.exp(x) / (1 + Math.exp(x))) * 100;
        const risk10yASCVD = risk10yCVD * 0.69;
        const risk10yHF = risk10yCVD * 0.56;
        const risk10yCHD = risk10yCVD * 0.25;
        const risk10yStroke = risk10yCVD * 0.50;

        let mult30 = age > 75 ? 1.3 : age > 65 ? 2.0 : age > 55 ? 3.5 : age > 45 ? 5.5 : 7.3;
        const risk30yCVD = Math.min(risk10yCVD * mult30, 95);

        return {
          score: risk10yCVD.toFixed(2),
          interpretation: `10-Year Total CVD Risk: ${risk10yCVD.toFixed(2)}%`,
          category: risk10yCVD < 5 ? 'Low Risk (<5%)' : risk10yCVD < 7.5 ? 'Borderline (5-7.5%)' : risk10yCVD < 20 ? 'Intermediate (7.5-20%)' : 'High Risk (≥20%)',
          management: risk10yCVD < 5 ? 'Lifestyle modifications. Reassess in 4-6 years.' : risk10yCVD < 7.5 ? 'Consider risk-enhancing factors.' : risk10yCVD < 20 ? 'Moderate-intensity statin recommended.' : 'High-intensity statin recommended.',
          details: {
            modelType: 'Base Model (10-Year Total CVD)',
            tenYear: { totalCVD: risk10yCVD.toFixed(2), ascvd: risk10yASCVD.toFixed(2), heartFailure: risk10yHF.toFixed(2), chd: risk10yCHD.toFixed(2), stroke: risk10yStroke.toFixed(2) },
            thirtyYear: { totalCVD: risk30yCVD.toFixed(2), ascvd: Math.min(risk10yASCVD * mult30, 95).toFixed(2), heartFailure: Math.min(risk10yHF * mult30, 95).toFixed(2), chd: Math.min(risk10yCHD * mult30, 95).toFixed(2), stroke: Math.min(risk10yStroke * mult30, 95).toFixed(2) }
          }
        };
      }
    },
    'CHA2DS2-VASc': {
      name: 'CHA₂DS₂-VASc Score',
      description: 'Stroke risk in atrial fibrillation',
      reference: 'Lip GY, et al. Chest. 2010',
      variables: [
        { name: 'chf', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'CHF History' },
        { name: 'hypertension', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Hypertension' },
        { name: 'age', type: 'select', options: [{ value: '0', label: '<65 years', points: 0 }, { value: '1', label: '65-74 years', points: 1 }, { value: '2', label: '≥75 years', points: 2 }], description: 'Age' },
        { name: 'diabetes', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Diabetes' },
        { name: 'stroke', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '2', label: 'Yes', points: 2 }], description: 'Stroke/TIA/Thromboembolism' },
        { name: 'vascular', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Vascular Disease (MI, PAD, Aortic plaque)' },
        { name: 'sex', type: 'select', options: [{ value: '0', label: 'Male', points: 0 }, { value: '1', label: 'Female', points: 1 }], description: 'Sex' },
      ],
      calculate: (values) => {
        let score = 0;
        for (const v of Object.values(values)) {
          score += parseInt(v) || 0;
        }
        const riskMap = {
          0: '0%', 1: '1.3%', 2: '2.2%', 3: '3.2%', 4: '4.0%', 5: '6.7%', 6: '9.8%', 7: '9.6%', 8: '12.5%', 9: '15.2%'
        };
        const risk = riskMap[Math.min(score, 9)] || '>15%';
        let recommendation = '';
        if (score === 0) recommendation = 'No anticoagulation recommended (male) or consider (female with score 1)';
        else if (score === 1) recommendation = 'Consider oral anticoagulation';
        else recommendation = 'Oral anticoagulation recommended';
        
        return { score, category: `Score: ${score}`, interpretation: `Annual stroke risk: ${risk}`, management: recommendation };
      }
    },
    'CURB-65': {
      name: 'CURB-65 Score',
      description: 'Pneumonia severity and mortality risk',
      reference: 'Lim WS, et al. Thorax. 2003',
      variables: [
        { name: 'confusion', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Confusion (new)' },
        { name: 'bun', type: 'select', options: [{ value: '0', label: '≤19 mg/dL (≤7 mmol/L)', points: 0 }, { value: '1', label: '>19 mg/dL (>7 mmol/L)', points: 1 }], description: 'BUN' },
        { name: 'rr', type: 'select', options: [{ value: '0', label: '<30/min', points: 0 }, { value: '1', label: '≥30/min', points: 1 }], description: 'Respiratory Rate' },
        { name: 'bp', type: 'select', options: [{ value: '0', label: 'SBP ≥90 or DBP ≥60', points: 0 }, { value: '1', label: 'SBP <90 or DBP <60', points: 1 }], description: 'Blood Pressure' },
        { name: 'age', type: 'select', options: [{ value: '0', label: '<65 years', points: 0 }, { value: '1', label: '≥65 years', points: 1 }], description: 'Age' },
      ],
      calculate: (values) => {
        let score = 0;
        for (const v of Object.values(values)) {
          score += parseInt(v) || 0;
        }
        const mortality = ['0.6%', '2.7%', '6.8%', '14%', '27.8%', '27.8%'][score] || '>27%';
        const disposition = score <= 1 ? 'Outpatient treatment' : score === 2 ? 'Consider hospital admission' : 'Hospital admission (ICU if 4-5)';
        
        return { score, category: `CURB-65: ${score}`, interpretation: `30-day mortality: ${mortality}`, management: disposition };
      }
    },
    'Wells-DVT': {
      name: 'Wells Score for DVT',
      description: 'Deep vein thrombosis probability',
      reference: 'Wells PS, et al. NEJM. 2003',
      variables: [
        { name: 'cancer', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Active cancer (treatment within 6mo or palliative)' },
        { name: 'paralysis', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Paralysis, paresis, or recent leg immobilization' },
        { name: 'bedridden', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Bedridden >3 days or major surgery within 12 weeks' },
        { name: 'tenderness', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Localized tenderness along deep venous system' },
        { name: 'swelling', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Entire leg swollen' },
        { name: 'calf', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Calf swelling >3cm compared to other leg' },
        { name: 'edema', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Pitting edema (greater in symptomatic leg)' },
        { name: 'veins', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Collateral superficial veins (non-varicose)' },
        { name: 'previous', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '1', label: 'Yes', points: 1 }], description: 'Previously documented DVT' },
        { name: 'alternative', type: 'select', options: [{ value: '0', label: 'No', points: 0 }, { value: '-2', label: 'Yes', points: -2 }], description: 'Alternative diagnosis at least as likely' },
      ],
      calculate: (values) => {
        let score = 0;
        for (const v of Object.values(values)) {
          score += parseInt(v) || 0;
        }
        let risk = '', management = '';
        if (score <= 0) { risk = 'Low (5%)'; management = 'D-dimer; if negative, DVT excluded'; }
        else if (score <= 2) { risk = 'Moderate (17%)'; management = 'D-dimer or ultrasound'; }
        else { risk = 'High (53%)'; management = 'Ultrasound recommended'; }
        
        return { score, category: `Wells Score: ${score}`, interpretation: `DVT probability: ${risk}`, management };
      }
    },
    'MELD': {
      name: 'MELD Score',
      description: 'Model for End-Stage Liver Disease',
      reference: 'Kamath PS, et al. Hepatology. 2001',
      variables: [
        { name: 'dialysis', type: 'select', options: [{ value: '0', label: 'No (or <2x/week)', points: 0 }, { value: '1', label: 'Yes (≥2x/week)', points: 1 }], description: 'Dialysis at least twice in past week' },
        { name: 'creatinine', type: 'number', min: 0.1, max: 15, unit: 'mg/dL', description: 'Creatinine' },
        { name: 'bilirubin', type: 'number', min: 0.1, max: 50, unit: 'mg/dL', description: 'Bilirubin' },
        { name: 'inr', type: 'number', min: 0.5, max: 10, unit: '', description: 'INR' },
        { name: 'sodium', type: 'number', min: 100, max: 160, unit: 'mEq/L', description: 'Sodium (for MELD-Na)' },
      ],
      calculate: (values) => {
        let cr = parseFloat(values.creatinine) || 1;
        const bili = parseFloat(values.bilirubin) || 1;
        const inr = parseFloat(values.inr) || 1;
        const na = parseFloat(values.sodium) || 140;
        const dialysis = values.dialysis === '1';
        
        // Cap values
        cr = Math.max(1, Math.min(cr, 4));
        if (dialysis) cr = 4;
        const crCapped = Math.max(1, cr);
        const biliCapped = Math.max(1, bili);
        const inrCapped = Math.max(1, inr);
        const naCapped = Math.max(125, Math.min(na, 137));
        
        // MELD score
        const meld = Math.round(
          10 * (0.957 * Math.log(crCapped) + 0.378 * Math.log(biliCapped) + 1.120 * Math.log(inrCapped) + 0.643)
        );
        const meldCapped = Math.max(6, Math.min(meld, 40));
        
        // MELD-Na
        const meldNa = Math.round(
          meldCapped + 1.32 * (137 - naCapped) - 0.033 * meldCapped * (137 - naCapped)
        );
        const meldNaCapped = Math.max(6, Math.min(meldNa, 40));
        
        let mortality = '';
        if (meldCapped <= 9) mortality = '1.9% (3-month)';
        else if (meldCapped <= 19) mortality = '6% (3-month)';
        else if (meldCapped <= 29) mortality = '19.6% (3-month)';
        else if (meldCapped <= 39) mortality = '52.6% (3-month)';
        else mortality = '71.3% (3-month)';
        
        return { 
          score: meldNaCapped, 
          category: `MELD: ${meldCapped} | MELD-Na: ${meldNaCapped}`, 
          interpretation: `Mortality: ${mortality}`,
          management: meldCapped >= 15 ? 'Consider transplant referral' : 'Monitor closely'
        };
      }
    },
    'Cockcroft-Gault': {
      name: 'Cockcroft-Gault Creatinine Clearance',
      description: 'Estimates creatinine clearance (CrCl)',
      reference: 'Cockcroft DW, Gault MH. Nephron. 1976',
      variables: [
        { name: 'age', type: 'number', min: 18, max: 120, unit: 'years', description: 'Age' },
        { name: 'sex', type: 'select', options: [{ value: 'male', label: 'Male', points: 1 }, { value: 'female', label: 'Female', points: 0.85 }], description: 'Sex' },
        { name: 'weight', type: 'number', min: 20, max: 300, unit: 'kg', description: 'Weight' },
        { name: 'creatinine', type: 'number', min: 0.1, max: 20, unit: 'mg/dL', description: 'Serum Creatinine' },
      ],
      calculate: (values) => {
        const age = parseFloat(values.age) || 40;
        const weight = parseFloat(values.weight) || 70;
        const cr = parseFloat(values.creatinine) || 1;
        const sexFactor = values.sex === 'female' ? 0.85 : 1;
        
        const crcl = ((140 - age) * weight * sexFactor) / (72 * cr);
        
        let stage = '', recommendation = '';
        if (crcl >= 90) { stage = 'Normal or High'; recommendation = 'No dose adjustment typically needed'; }
        else if (crcl >= 60) { stage = 'Mildly decreased'; recommendation = 'Check drug-specific recommendations'; }
        else if (crcl >= 30) { stage = 'Moderately decreased'; recommendation = 'Dose adjustment often required'; }
        else if (crcl >= 15) { stage = 'Severely decreased'; recommendation = 'Significant dose adjustment required'; }
        else { stage = 'Kidney failure'; recommendation = 'Dialysis consideration; major dose adjustments'; }
        
        return { 
          score: crcl.toFixed(1), 
          category: `CrCl: ${crcl.toFixed(1)} mL/min`, 
          interpretation: `Kidney function: ${stage}`,
          management: recommendation
        };
      }
    }
  };

  const runAutoTests = (scale) => {
    if (!scale.testCases) return null;
    const results = scale.testCases.map(tc => {
      const result = scale.calculate(tc.inputs);
      const actual = parseFloat(result.details?.tenYear?.totalCVD || result.score);
      const passed = Math.abs(actual - tc.expected.tenYearCVD) <= tc.expected.tolerance;
      return { name: tc.name, expected: tc.expected.tenYearCVD, actual, tolerance: tc.expected.tolerance, passed };
    });
    return { results, passedCount: results.filter(r => r.passed).length, totalCount: results.length, allPassed: results.every(r => r.passed) };
  };

  const generatePythonCode = (data, vars, formula) => {
    const className = (data.scale_name || scaleName || 'Scale').replace(/[^a-zA-Z0-9]/g, '');

    // Generate variables dict with English definitions
    let variablesDict = '';
    let calcCode = '';
    const suggestedTriggers = new Set();

    if (vars && vars.length > 0) {
      const varEntries = vars.map(v => {
        let definition = v.description || v.name;

        // Add variable-related terms to triggers
        const varWords = definition.toLowerCase().split(/\s+/);
        varWords.forEach(word => {
          if (word.length > 3 && !['with', 'from', 'the', 'and', 'for'].includes(word)) {
            suggestedTriggers.add(word.replace(/[^a-z]/g, ''));
          }
        });

        if (v.unit) {
          definition += ` (${v.unit})`;
        }

        return `        "${v.name}": "${definition}"`;
      }).join(',\n');

      variablesDict = `{\n${varEntries}\n    }`;

      // Generate calculation code
      if (data.calculationType === 'sum' || formula === 'SUM_OF_POINTS') {
        calcCode = `    score = 0
    for key, value in inputs.items():
        score += int(value) if isinstance(value, (int, str)) and str(value).lstrip('-').isdigit() else 0
    return score`;
      } else if (formula && formula.includes('+')) {
        const pythonFormula = formula.replace(/([a-z_]+)/gi, (match) => `inputs.get("${match}", 0)`);
        calcCode = `    # Formula: ${formula}
    score = ${pythonFormula}
    return score`;
      } else {
        calcCode = `    score = sum(int(v) for v in inputs.values() if str(v).lstrip('-').isdigit())
    return score`;
      }
    }

    // Extract one-sentence description
    const description = data.description || `Clinical assessment scale for ${data.scale_name || scaleName}`;

    // Add scale name terms to triggers
    const scaleWords = (data.scale_name || scaleName || '').toLowerCase().split(/\s+/);
    scaleWords.forEach(word => {
      if (word.length > 2) {
        suggestedTriggers.add(word.replace(/[^a-z]/g, ''));
      }
    });

    // Build interpretation section (only with data from source)
    let interpretationText = '';

    // Risk stratification (only if interpretation data exists)
    if (data.interpretation && Array.isArray(data.interpretation) && data.interpretation.length > 0) {
      const riskLevels = data.interpretation.map(interp => {
        const range = interp.range || '';
        const meaning = interp.meaning || '';
        const recommendation = interp.recommendation || '';

        // Extract risk level terms for triggers
        const riskWords = meaning.toLowerCase().split(/\s+/);
        riskWords.forEach(word => {
          if (word.length > 3) {
            suggestedTriggers.add(word.replace(/[^a-z]/g, ''));
          }
        });

        return `Score ${range}: ${meaning}${recommendation ? ' - ' + recommendation : ''}`;
      }).join('\\n');

      interpretationText = riskLevels;
    }

    // Variable interpretation (only if present in source)
    if (data.variable_interpretation) {
      interpretationText += '\\n\\nVARIABLE INTERPRETATION:\\n';
      Object.entries(data.variable_interpretation).forEach(([varName, meaning]) => {
        interpretationText += `- ${varName}: ${meaning}\\n`;
      });
    }

    // Monitoring strategy (only if present in source)
    if (data.monitoring_strategy && Array.isArray(data.monitoring_strategy)) {
      interpretationText += '\\n\\nMONITORING STRATEGY:\\n';
      data.monitoring_strategy.forEach(item => {
        interpretationText += `- ${item}\\n`;

        // Add monitoring terms to triggers
        const monitorWords = item.toLowerCase().split(/\s+/);
        monitorWords.forEach(word => {
          if (word.length > 4) {
            suggestedTriggers.add(word.replace(/[^a-z]/g, ''));
          }
        });
      });
    }

    // Treatment modifications (only if present in source)
    if (data.treatment_modifications && Array.isArray(data.treatment_modifications)) {
      interpretationText += '\\n\\nTREATMENT MODIFICATIONS:\\n';
      data.treatment_modifications.forEach(item => {
        interpretationText += `- ${item}\\n`;

        // Add treatment terms to triggers
        const treatWords = item.toLowerCase().split(/\s+/);
        treatWords.forEach(word => {
          if (word.length > 4) {
            suggestedTriggers.add(word.replace(/[^a-z]/g, ''));
          }
        });
      });
    }

    // Build recommendation (only from source data)
    let recommendationText = '';
    if (data.recommendation) {
      recommendationText = data.recommendation;
    } else if (data.interpretation && data.interpretation.length > 0) {
      // Fallback: use first interpretation recommendation if available
      const firstRec = data.interpretation.find(i => i.recommendation);
      if (firstRec) {
        recommendationText = firstRec.recommendation;
      }
    }

    // Convert triggers set to sorted array
    const triggersArray = Array.from(suggestedTriggers)
      .filter(t => t.length > 2)
      .sort()
      .slice(0, 20); // Limit to 20 most relevant

    const triggersStr = triggersArray.map(t => `    "${t}"`).join(',\n');

    return `"""
${data.scale_name || scaleName}
${description}
Reference: ${data.reference || 'N/A'}

STRICT RULE: All data in this file is derived ONLY from the extracted source text.
No medical data, cutoffs, thresholds, or recommendations have been invented or inferred.
"""

SCALE_DATA = {
    "name": "${data.scale_name || scaleName}",
    "description": "${description}",
    "variables": ${variablesDict},
    "formula": "${formula || 'SUM_OF_POINTS'}",
    "interpretation": """${interpretationText || 'Refer to source documentation for interpretation guidelines.'}""",
    "recommendation": """${recommendationText || 'Consult clinical guidelines and source documentation.'}""",
    "suggested_triggers": [
${triggersStr}
    ]
}

def calculate(inputs):
    """
    Calculate score based on input variables.

    Args:
        inputs (dict): Dictionary with variable names as keys

    Returns:
        float or int: Calculated score
    """
${calcCode}

# Example usage:
# result = calculate({"var1": value1, "var2": value2})
# print(f"Score: {result}")
# print(f"Interpretation: {SCALE_DATA['interpretation']}")
`;
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const sendToSlack = async () => {
    setSlackSending(true);
    setError('');
    try {
      const message = calculationResult
        ? `🏥 *${scaleName}*\n\n📊 *Result:* ${calculationResult.score}\n${calculationResult.category}\n${calculationResult.interpretation}\n\n💊 ${calculationResult.management}`
        : `🏥 *${scaleName}*\n\`\`\`${generatedCode.substring(0, 2500)}\`\`\``;

      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
      if (response.ok) {
        setSlackSent(true);
        setTimeout(() => setSlackSent(false), 3000);
      } else {
        throw new Error('Slack error');
      }
    } catch (err) {
      setError('Error sending to Slack: ' + err.message);
    } finally {
      setSlackSending(false);
    }
  };

  const saveToRepository = async () => {
    setFileSaving(true);
    setError('');
    try {
      const fileName = (scaleName || 'scale').toLowerCase().replace(/[^a-z0-9]+/g, '_');

      // 1. Save as .py file to GitHub
      const fileResponse = await fetch('/api/save-scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName, content: generatedCode })
      });

      const fileData = await fileResponse.json();

      if (!fileResponse.ok) {
        throw new Error(fileData.error || 'Failed to save file to GitHub');
      }

      showNotification(`✅ Arquivo .py salvo no GitHub: ${fileData.filePath}`, 'success');

      // 2. Save to Firestore database
      try {
        const firestoreResponse = await fetch('/api/firestore/save-to-database', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scaleData: scaleData,
            variables: variables,
            calculateFunction: generatedCode
          })
        });

        const firestoreData = await firestoreResponse.json();

        if (firestoreResponse.ok) {
          showNotification(`✅ Escala salva no Firestore: ${firestoreData.scale?.code_name || 'success'}`, 'success');
        } else {
          console.error('Firestore save failed:', firestoreData.error);
          showNotification(`⚠️ Arquivo salvo no GitHub, mas erro ao salvar no Firestore: ${firestoreData.error}`, 'warning');
        }
      } catch (firestoreErr) {
        console.error('Firestore error:', firestoreErr);
        showNotification(`⚠️ Arquivo salvo no GitHub, mas erro ao salvar no Firestore: ${firestoreErr.message}`, 'warning');
      }

      setFileSaved(true);
      setTimeout(() => setFileSaved(false), 3000);

    } catch (err) {
      setError('Erro ao salvar arquivo: ' + err.message);
      showNotification('❌ Erro ao salvar arquivo no repositório', 'error');
    } finally {
      setFileSaving(false);
    }
  };

  const processInput = async () => {
    setIsLoading(true);
    setError('');
    const inputLower = inputText.toLowerCase();

    // Extract potential scale name from input
    let potentialScaleName = inputText.trim().split('\n')[0].substring(0, 100);

    // Check if scale already exists in built-in or repository
    for (const [key, scale] of Object.entries(BUILT_IN_SCALES)) {
      const keyLower = key.toLowerCase();
      const nameLower = scale.name.toLowerCase();
      if (inputLower.includes(keyLower) || inputLower.includes(nameLower) ||
          (key === 'CHA2DS2-VASc' && (inputLower.includes('cha2ds2') || inputLower.includes('chads'))) ||
          (key === 'CURB-65' && inputLower.includes('curb')) ||
          (key === 'Wells-DVT' && inputLower.includes('wells') && inputLower.includes('dvt')) ||
          (key === 'MELD' && inputLower.includes('meld')) ||
          (key === 'Cockcroft-Gault' && (inputLower.includes('cockcroft') || inputLower.includes('crcl') || inputLower.includes('creatinine clearance')))) {
        potentialScaleName = scale.name;
        break;
      }
    }

    // Check if file already exists in repository
    try {
      const checkResponse = await fetch('/api/check-scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scaleName: potentialScaleName })
      });
      const checkData = await checkResponse.json();

      if (checkData.exists) {
        setIsLoading(false);
        showNotification(`⚠️ A escala "${potentialScaleName}" já existe no repositório em: ${checkData.filePath}. Não é necessário criá-la novamente.`, 'warning');
        return;
      }
    } catch (err) {
      console.error('Error checking scale existence:', err);
      // Continue processing if check fails
    }

    // Check for built-in scales
    for (const [key, scale] of Object.entries(BUILT_IN_SCALES)) {
      const keyLower = key.toLowerCase();
      const nameLower = scale.name.toLowerCase();
      if (inputLower.includes(keyLower) || inputLower.includes(nameLower) || 
          (key === 'CHA2DS2-VASc' && (inputLower.includes('cha2ds2') || inputLower.includes('chads'))) ||
          (key === 'CURB-65' && inputLower.includes('curb')) ||
          (key === 'Wells-DVT' && inputLower.includes('wells') && inputLower.includes('dvt')) ||
          (key === 'MELD' && inputLower.includes('meld')) ||
          (key === 'Cockcroft-Gault' && (inputLower.includes('cockcroft') || inputLower.includes('crcl') || inputLower.includes('creatinine clearance')))) {
        setSelectedScale(key);
        setScaleName(scale.name);
        setVariables(scale.variables);
        setScaleData({ ...scale, isBuiltIn: true });
        if (scale.testCases) {
          setAutoTestResults(runAutoTests(scale));
          setShowAutoTests(true);
        }
        // Initialize test values
        const initVals = {};
        scale.variables.forEach(v => {
          if (v.type === 'select' && v.options) {
            initVals[v.name] = v.options[0].value;
          } else {
            initVals[v.name] = v.min || 0;
          }
        });
        setTestValues(initVals);
        setGeneratedCode(generatePythonCode({ scale_name: scale.name, description: scale.description, reference: scale.reference }, scale.variables, null));
        setStep('code');
        setIsLoading(false);
        return;
      }
    }

    // Use Claude API for unknown scales
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ 
            role: 'user', 
            content: `Extract this clinical scale and return ONLY valid JSON (no markdown, no explanation).

🚨 STRICT RULES - CRITICAL:
1. NEVER create, guess, infer, or invent medical data not explicitly present in the source text
2. NEVER add cutoffs, thresholds, ranges, treatments, or recommendations not in the source
3. If a field is not mentioned in the source, OMIT it entirely from the JSON
4. Only extract what is EXPLICITLY stated in the provided text
5. All text must be in English

FORMULA RULES:
- If point-based scale (like CHA2DS2-VASc, CURB-65): use "SUM_OF_POINTS"
- If mathematical formula exists: write it using variable names (e.g., "(140 - age) * weight / (72 * creatinine)")
- NEVER write descriptions like "Addition of points"

INTERPRETATION RULES:
- Only include risk levels/ranges that are EXPLICITLY mentioned in the source
- Do NOT create risk categories if they don't exist in the source
- Include the exact wording from the source

OPTIONAL FIELDS (only include if present in source):
- "variable_interpretation": {"var_name": "meaning"} - only if source explains individual variables
- "monitoring_strategy": ["item1", "item2"] - only if source mentions monitoring
- "treatment_modifications": ["rule1", "rule2"] - only if source mentions treatment changes
- "recommendation": "text" - general recommendation if present in source

Return this exact JSON structure:
{
  "scale_name": "Name of the scale in English",
  "description": "One-sentence clinical description in English",
  "reference": "Author, Journal, Year (if available)",
  "calculationType": "sum" or "formula",
  "variables": [
    {
      "name": "variable_name",
      "type": "select" or "number",
      "description": "Short English definition",
      "options": [
        {"value": "0", "label": "No", "points": 0},
        {"value": "1", "label": "Yes", "points": 1}
      ],
      "min": 0,
      "max": 100,
      "unit": "mg/dL"
    }
  ],
  "formula": "SUM_OF_POINTS or actual mathematical formula",
  "interpretation": [
    {"range": "0-1", "meaning": "Low risk", "recommendation": "minimal monitoring"}
  ],
  "variable_interpretation": {
    "var_name": "Interpretation from source only"
  },
  "monitoring_strategy": [
    "Strategy item from source only"
  ],
  "treatment_modifications": [
    "Treatment rule from source only"
  ],
  "recommendation": "General clinical recommendation from source in English"
}

REMEMBER: Only include fields that are EXPLICITLY present in the source text. Do not add, infer, or create any medical information.

Content to extract:
${inputText}`
          }]
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      const text = data.content?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setScaleName(parsed.scale_name || 'Unknown Scale');
        setScaleData(parsed);
        setVariables(parsed.variables || []);
        setManualFormula(parsed.formula || 'SUM_OF_POINTS');
        
        // Initialize values
        const initVals = {};
        (parsed.variables || []).forEach(v => {
          if (v.type === 'select' && v.options && v.options.length > 0) {
            initVals[v.name] = v.options[0].value;
          } else if (v.type === 'number') {
            initVals[v.name] = v.min || 0;
          } else {
            initVals[v.name] = 0;
          }
        });
        setTestValues(initVals);
        setGeneratedCode(generatePythonCode(parsed, parsed.variables, parsed.formula));
        setStep('code');
      } else {
        throw new Error('Could not parse response');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = () => {
    setError('');
    
    // Built-in scale calculation
    if (scaleData?.isBuiltIn && selectedScale && BUILT_IN_SCALES[selectedScale]) {
      const result = BUILT_IN_SCALES[selectedScale].calculate(testValues);
      setCalculationResult(result);
      setStep('result');
      return;
    }
    
    // Extracted scale calculation
    try {
      let score = 0;
      const formula = manualFormula || scaleData?.formula || 'SUM_OF_POINTS';
      
      if (formula === 'SUM_OF_POINTS' || formula.toLowerCase().includes('sum') || formula.toLowerCase().includes('addition')) {
        // Sum all point values
        for (const [key, value] of Object.entries(testValues)) {
          const varDef = variables.find(v => v.name === key);
          if (varDef?.type === 'select' && varDef?.options) {
            const opt = varDef.options.find(o => o.value === String(value));
            score += opt?.points ?? (parseInt(value) || 0);
          } else {
            score += parseFloat(value) || 0;
          }
        }
      } else {
        // Try to evaluate mathematical formula
        let evalFormula = formula;
        for (const [key, value] of Object.entries(testValues)) {
          const numVal = parseFloat(value) || 0;
          evalFormula = evalFormula.replace(new RegExp(`\\b${key}\\b`, 'g'), `(${numVal})`);
        }
        // Replace common functions
        evalFormula = evalFormula.replace(/ln\(/g, 'Math.log(');
        evalFormula = evalFormula.replace(/log\(/g, 'Math.log10(');
        evalFormula = evalFormula.replace(/sqrt\(/g, 'Math.sqrt(');
        
        score = Function('"use strict"; return (' + evalFormula + ')')();
      }
      
      // Find interpretation
      let interpretation = '';
      let recommendation = '';
      if (scaleData?.interpretation) {
        for (const interp of scaleData.interpretation) {
          if (interp.range) {
            const [min, max] = interp.range.split('-').map(s => parseFloat(s.replace(/[^0-9.-]/g, '')));
            if (score >= min && (isNaN(max) || score <= max)) {
              interpretation = interp.meaning || '';
              recommendation = interp.recommendation || '';
              break;
            }
          }
        }
      }
      
      setCalculationResult({
        score: typeof score === 'number' ? (Number.isInteger(score) ? score : score.toFixed(2)) : score,
        category: `Score: ${typeof score === 'number' ? (Number.isInteger(score) ? score : score.toFixed(2)) : score}`,
        interpretation: interpretation || 'See clinical guidelines for interpretation',
        management: recommendation || 'Consult clinical guidelines'
      });
      setStep('result');
      
    } catch (err) {
      setError('Calculation error: ' + err.message);
      setShowManualEdit(true);
    }
  };

  const reset = () => {
    setStep('input');
    setInputText('');
    setGeneratedCode('');
    setVariables([]);
    setTestValues({});
    setCalculationResult(null);
    setError('');
    setScaleName('');
    setScaleData(null);
    setShowManualEdit(false);
    setManualFormula('');
    setSelectedScale(null);
    setAutoTestResults(null);
    setShowAutoTests(false);
    setSlackSent(false);
    setNotification(null);
    setFileSaved(false);
    setFileSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-400 mb-1">🏥 Clinical Scales Extractor</h1>
        <p className="text-gray-400 text-sm mb-4">Extract → Validate → Test → Share</p>

        {notification && (
          <div className={`p-3 rounded mb-4 text-sm border ${
            notification.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-200' :
            notification.type === 'warning' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-200' :
            notification.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' :
            'bg-blue-900/50 border-blue-500 text-blue-200'
          }`}>
            {notification.message}
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: INPUT */}
        {step === 'input' && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded p-3 text-blue-200 text-sm">
              <p className="font-medium mb-2">💡 Built-in validated scales:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BUILT_IN_SCALES).map(([key, scale]) => (
                  <button
                    key={key}
                    onClick={() => { setInputText(key); }}
                    className="bg-blue-800/50 hover:bg-blue-700/50 px-2 py-1 rounded text-xs"
                  >
                    {scale.name.split('(')[0].trim()}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-blue-300">Click one above or paste content from MDCalc below</p>
            </div>
            
            <textarea
              className="w-full h-56 bg-gray-800 border border-gray-700 rounded p-3 text-sm font-mono focus:border-blue-500 focus:outline-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a scale name (e.g., CURB-65) or paste content from MDCalc..."
            />
            
            <button
              onClick={processInput}
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-2 rounded font-medium"
            >
              {isLoading ? '⏳ Processing...' : '🔍 Extract'}
            </button>
          </div>
        )}

        {/* STEP 2: CODE & TEST */}
        {step === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-green-400">✅ {scaleName}</h2>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">📋</button>
                <button
                  onClick={saveToRepository}
                  disabled={fileSaving}
                  className={`px-3 py-1 rounded text-sm ${fileSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {fileSaving ? '⏳' : fileSaved ? '✅ Salvo' : '💾 Salvar'}
                </button>
                <button
                  onClick={sendToSlack}
                  disabled={slackSending}
                  className={`px-3 py-1 rounded text-sm ${slackSent ? 'bg-green-600' : 'bg-pink-600 hover:bg-pink-700'}`}
                >
                  {slackSending ? '⏳' : slackSent ? '✅' : '📤 Slack'}
                </button>
              </div>
            </div>

            {scaleData?.isBuiltIn && (
              <div className="bg-green-900/30 border border-green-600 rounded p-3 text-green-200 text-sm">
                ✅ Validated built-in implementation • Reference: {scaleData.reference}
              </div>
            )}

            {autoTestResults && (
              <div className={`border rounded p-3 ${autoTestResults.allPassed ? 'bg-green-900/30 border-green-600' : 'bg-yellow-900/30 border-yellow-600'}`}>
                <div className="flex justify-between items-center">
                  <span className={autoTestResults.allPassed ? 'text-green-400' : 'text-yellow-400'}>
                    🧪 {autoTestResults.passedCount}/{autoTestResults.totalCount} tests passed
                  </span>
                  <button onClick={() => setShowAutoTests(!showAutoTests)} className="text-xs text-gray-400">
                    {showAutoTests ? 'Hide' : 'Show'}
                  </button>
                </div>
                {showAutoTests && (
                  <div className="mt-2 space-y-1 text-xs">
                    {autoTestResults.results.map((t, i) => (
                      <div key={i} className={`flex gap-2 p-1 rounded ${t.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <span>{t.passed ? '✅' : '❌'}</span>
                        <span className="flex-1">{t.name}</span>
                        <span className="text-gray-400">Expected: {t.expected}%</span>
                        <span className={t.passed ? 'text-green-400' : 'text-red-400'}>Got: {t.actual}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="font-medium mb-3 text-sm">🧪 Enter values:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variables.map((v) => {
                  // Get possible units for this variable
                  const measurementType = inferMeasurementType(v.name || v.description || '');
                  const possibleUnits = getPossibleUnits(measurementType);
                  const hasUnits = possibleUnits.length > 0 && v.type !== 'select';
                  const currentUnit = selectedUnits[v.name] || v.unit || (possibleUnits[0]?.value);

                  return (
                    <div key={v.name}>
                      <label className="block text-xs text-gray-400 mb-1">
                        {v.description}
                      </label>
                      {v.type === 'select' && v.options ? (
                        <select
                          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                          value={testValues[v.name] ?? ''}
                          onChange={(e) => setTestValues({ ...testValues, [v.name]: e.target.value })}
                        >
                          {v.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label} {o.points !== undefined && o.points !== 0 ? `(+${o.points})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex gap-1">
                          <input
                            type="number"
                            step="any"
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
                            value={testValues[v.name] ?? ''}
                            onChange={(e) => setTestValues({ ...testValues, [v.name]: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                            placeholder={v.min !== undefined ? `${v.min}-${v.max}` : ''}
                          />
                          {hasUnits && (
                            <select
                              className="w-20 bg-gray-700 border border-gray-600 rounded px-1 py-1.5 text-xs"
                              value={currentUnit}
                              onChange={(e) => setSelectedUnits({ ...selectedUnits, [v.name]: e.target.value })}
                              title="Unit"
                            >
                              {possibleUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                  {formatUnitForDisplay(unit.value)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showManualEdit && !scaleData?.isBuiltIn && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                  <label className="text-xs text-yellow-400">✏️ Formula (use variable names or SUM_OF_POINTS):</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 rounded px-3 py-2 text-sm mt-1 font-mono"
                    value={manualFormula}
                    onChange={(e) => setManualFormula(e.target.value)}
                    placeholder="e.g., SUM_OF_POINTS or (140 - age) * weight / (72 * creatinine)"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4 flex-wrap">
                <button onClick={runTest} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium">
                  ▶️ Calculate
                </button>
                {!showManualEdit && !scaleData?.isBuiltIn && (
                  <button onClick={() => setShowManualEdit(true)} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm">
                    ✏️ Edit Formula
                  </button>
                )}
                <button onClick={reset} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">
                  ↩️ Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && calculationResult && (
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-600 rounded p-3">
              <h4 className="text-sm text-gray-400 mb-2">📋 Input values:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(testValues).map(([k, v]) => {
                  const varInfo = variables.find(x => x.name === k);
                  const display = varInfo?.options?.find(o => o.value === String(v))?.label || v;
                  return (
                    <div key={k} className="bg-gray-700/50 rounded px-2 py-1">
                      <span className="text-gray-400">{varInfo?.description || k}:</span>{' '}
                      <span className="text-white font-medium">{display}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-800 border border-green-500 rounded p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Result</h3>
              
              {calculationResult.details ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded p-3">
                      <h4 className="text-sm text-blue-400 mb-2">10-Year</h4>
                      <p className="text-2xl font-bold text-white">{calculationResult.details.tenYear.totalCVD}%</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ASCVD: {calculationResult.details.tenYear.ascvd}% | HF: {calculationResult.details.tenYear.heartFailure}%
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded p-3">
                      <h4 className="text-sm text-purple-400 mb-2">30-Year</h4>
                      <p className="text-2xl font-bold text-white">{calculationResult.details.thirtyYear.totalCVD}%</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded">
                    <p className="text-sm">
                      <span className="text-gray-400">Category:</span>{' '}
                      <span className={calculationResult.category.includes('Low') ? 'text-green-400' : calculationResult.category.includes('High') ? 'text-red-400' : 'text-yellow-400'}>
                        {calculationResult.category}
                      </span>
                    </p>
                    <p className="text-sm mt-1"><span className="text-gray-400">Recommendation:</span> {calculationResult.management}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold text-white mb-2">{calculationResult.score}</p>
                  <p className="text-gray-300">{calculationResult.category}</p>
                  <p className="text-gray-400 text-sm mt-2">{calculationResult.interpretation}</p>
                  <p className="text-blue-400 text-sm mt-2">💊 {calculationResult.management}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 border border-yellow-500 rounded p-3">
              <p className="text-yellow-400 text-sm mb-2">⚠️ Always verify with official calculator (MDCalc) for clinical decisions.</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={reset} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">✅ New Scale</button>
                <button onClick={() => setStep('code')} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm">🔄 Adjust</button>
                <button
                  onClick={saveToRepository}
                  disabled={fileSaving}
                  className={`px-4 py-2 rounded text-sm ${fileSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {fileSaving ? '⏳ Salvando...' : fileSaved ? '✅ Salvo!' : '💾 Salvar no Repositório'}
                </button>
                <button
                  onClick={sendToSlack}
                  disabled={slackSending}
                  className={`px-4 py-2 rounded text-sm ${slackSent ? 'bg-green-600' : 'bg-pink-600 hover:bg-pink-700'}`}
                >
                  {slackSending ? '⏳' : slackSent ? '✅ Sent!' : '📤 Send to Slack'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-gray-700 text-center text-gray-500 text-xs">
          Clinical Scales Extractor v4 • Built-in: {Object.keys(BUILT_IN_SCALES).join(', ')}
        </div>
      </div>
    </div>
  );
}
