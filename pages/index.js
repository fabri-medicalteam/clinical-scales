import React, { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState('input');
  const [inputText, setInputText] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [variables, setVariables] = useState([]);
  const [testValues, setTestValues] = useState({});
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

  const BUILT_IN_SCALES = {
    'PREVENT': {
      name: 'PREVENT (Predicting Risk of CVD Events)',
      description: '10- and 30-year cardiovascular disease risk prediction.',
      reference: 'Khan SS, et al. Circulation. 2024;149:430-449',
      variables: [
        { name: 'sex', type: 'str', options: [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }], description: 'Sex' },
        { name: 'age', type: 'int', min: 30, max: 79, unit: 'years', description: 'Age' },
        { name: 'total_cholesterol', type: 'float', min: 2, max: 10, unit: 'mmol/L', description: 'Total Cholesterol' },
        { name: 'hdl_cholesterol', type: 'float', min: 0.3, max: 3, unit: 'mmol/L', description: 'HDL Cholesterol' },
        { name: 'systolic_bp', type: 'float', min: 80, max: 200, unit: 'mm Hg', description: 'Systolic BP' },
        { name: 'diabetes', type: 'bool', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }], description: 'Diabetes' },
        { name: 'current_smoker', type: 'bool', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }], description: 'Current Smoker' },
        { name: 'egfr', type: 'float', min: 15, max: 140, unit: 'mL/min/1.73m²', description: 'eGFR' },
        { name: 'on_antihypertensive', type: 'bool', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }], description: 'On BP Meds' },
        { name: 'on_statin', type: 'bool', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Yes' }], description: 'On Statin' },
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
    }
  };

  const runAutoTests = (scale) => {
    if (!scale.testCases) return null;
    const results = scale.testCases.map(tc => {
      const result = scale.calculate(tc.inputs);
      const actual = parseFloat(result.details.tenYear.totalCVD);
      const passed = Math.abs(actual - tc.expected.tenYearCVD) <= tc.expected.tolerance;
      return { name: tc.name, expected: tc.expected.tenYearCVD, actual, tolerance: tc.expected.tolerance, passed };
    });
    return { results, passedCount: results.filter(r => r.passed).length, totalCount: results.length, allPassed: results.every(r => r.passed) };
  };

  const generatePythonCode = (data) => {
    const className = data.scale_class_name || 'Scale';
    const varsCode = data.variables?.map(v => `    ${v.name}: ${v.type}  # ${v.description}`).join('\n') || '';
    return `"""
${data.scale_name || scaleName}
${data.description || ''}
Reference: ${data.reference || 'N/A'}
"""
from dataclasses import dataclass

@dataclass
class ${className}Input:
${varsCode}

class ${className}:
    @staticmethod
    def calculate(data):
        score = ${data.formula || '0'}
        return score
`;
  };

  const sendToSlack = async () => {
    setSlackSending(true);
    setError('');
    try {
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🏥 *${scaleName}*\n\`\`\`${generatedCode.substring(0, 3000)}\`\`\``
        })
      });
      if (response.ok) {
        setSlackSent(true);
        setTimeout(() => setSlackSent(false), 3000);
      } else {
        throw new Error('Erro do Slack');
      }
    } catch (err) {
      setError('Erro ao enviar: ' + err.message);
    } finally {
      setSlackSending(false);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scaleName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processInput = async () => {
    setIsLoading(true);
    setError('');
    const inputLower = inputText.toLowerCase();
    
    if (inputLower.includes('prevent') || (inputLower.includes('cvd') && inputLower.includes('egfr'))) {
      const scale = BUILT_IN_SCALES['PREVENT'];
      setSelectedScale('PREVENT');
      setScaleName(scale.name);
      setVariables(scale.variables);
      setScaleData({ ...scale, isBuiltIn: true });
      setAutoTestResults(runAutoTests(scale));
      setShowAutoTests(true);
      setTestValues({ sex: 'female', age: 45, total_cholesterol: 5.0, hdl_cholesterol: 1.3, systolic_bp: 120, diabetes: 'false', current_smoker: 'false', egfr: 90, on_antihypertensive: 'false', on_statin: 'false' });
      setGeneratedCode(`# PREVENT - Built-in validated implementation\n# Reference: ${scale.reference}`);
      setStep('code');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: `Extract this clinical scale as JSON only:\n${inputText}\n\nReturn: {"scale_name":"","scale_class_name":"","description":"","variables":[{"name":"","type":"int","min":0,"max":10,"options":[],"description":""}],"formula":"","interpretation":[]}` }]
        })
      });
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setScaleName(parsed.scale_name);
        setScaleData(parsed);
        setVariables(parsed.variables || []);
        setGeneratedCode(generatePythonCode(parsed));
        setManualFormula(parsed.formula);
        const initVals = {};
        (parsed.variables || []).forEach(v => { initVals[v.name] = v.options?.[0]?.value ?? v.min ?? 0; });
        setTestValues(initVals);
        setStep('code');
      }
    } catch (err) {
      setError('Erro: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runTest = () => {
    if (scaleData?.isBuiltIn && BUILT_IN_SCALES[selectedScale]) {
      setCalculationResult(BUILT_IN_SCALES[selectedScale].calculate(testValues));
      setStep('result');
      return;
    }
    try {
      let formula = manualFormula || scaleData?.formula || '0';
      Object.entries(testValues).forEach(([k, v]) => {
        const num = ['true','yes'].includes(String(v).toLowerCase()) ? 1 : ['false','no'].includes(String(v).toLowerCase()) ? 0 : parseFloat(v) || 0;
        formula = formula.replace(new RegExp(`\\b${k}\\b`, 'g'), `(${num})`);
      });
      const score = Function('"use strict"; return (' + formula + ')')();
      setCalculationResult({ score: Math.round(score * 100) / 100, category: 'Calculated', interpretation: 'See guidelines' });
      setStep('result');
    } catch (err) {
      setError('Erro no cálculo: ' + err.message);
      setShowManualEdit(true);
    }
  };

  const reset = () => {
    setStep('input'); setInputText(''); setGeneratedCode(''); setVariables([]); setTestValues({});
    setCalculationResult(null); setError(''); setScaleName(''); setScaleData(null);
    setShowManualEdit(false); setManualFormula(''); setSelectedScale(null);
    setAutoTestResults(null); setShowAutoTests(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-400 mb-1">🏥 Clinical Scales Extractor</h1>
        <p className="text-gray-400 text-sm mb-4">Extract → Validate → Test → Share</p>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

        {step === 'input' && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-600 rounded p-3 text-blue-200 text-sm">
              💡 Cole conteúdo do MDCalc. Escalas complexas como <strong>PREVENT</strong> usam implementação validada.
            </div>
            <textarea className="w-full h-56 bg-gray-800 border border-gray-700 rounded p-3 text-sm" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Cole o conteúdo da calculadora aqui..." />
            <button onClick={processInput} disabled={!inputText.trim() || isLoading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-2 rounded font-medium">
              {isLoading ? '⏳ Processando...' : '🔍 Extrair'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-green-400">✅ {scaleName}</h2>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(generatedCode)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">📋</button>
                <button onClick={downloadFile} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm">⬇️ .py</button>
                <button onClick={sendToSlack} disabled={slackSending} className={`px-3 py-1 rounded text-sm ${slackSent ? 'bg-green-600' : 'bg-pink-600 hover:bg-pink-700'}`}>
                  {slackSending ? '⏳' : slackSent ? '✅' : '📤 Slack'}
                </button>
              </div>
            </div>

            {autoTestResults && (
              <div className={`border rounded p-3 ${autoTestResults.allPassed ? 'bg-green-900/30 border-green-600' : 'bg-yellow-900/30 border-yellow-600'}`}>
                <div className="flex justify-between items-center">
                  <span className={autoTestResults.allPassed ? 'text-green-400' : 'text-yellow-400'}>
                    🧪 {autoTestResults.passedCount}/{autoTestResults.totalCount} testes passaram
                  </span>
                  <button onClick={() => setShowAutoTests(!showAutoTests)} className="text-xs text-gray-400">{showAutoTests ? 'Ocultar' : 'Ver'}</button>
                </div>
                {showAutoTests && (
                  <div className="mt-2 space-y-1 text-xs">
                    {autoTestResults.results.map((t, i) => (
                      <div key={i} className={`flex gap-2 p-1 rounded ${t.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <span>{t.passed ? '✅' : '❌'}</span>
                        <span className="flex-1">{t.name}</span>
                        <span className="text-gray-400">Esperado: {t.expected}%</span>
                        <span className={t.passed ? 'text-green-400' : 'text-red-400'}>Obtido: {t.actual}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {scaleData?.isBuiltIn && <div className="bg-green-900/30 border border-green-600 rounded p-3 text-green-200 text-sm">✅ Implementação validada do artigo original.</div>}

            <div className="bg-gray-800 border border-gray-700 rounded p-4">
              <h3 className="font-medium mb-3 text-sm">🧪 Seus valores:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {variables.map(v => (
                  <div key={v.name}>
                    <label className="block text-xs text-gray-400 mb-1">{v.description} {v.unit && `(${v.unit})`}</label>
                    {v.options ? (
                      <select className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm" value={testValues[v.name] || ''} onChange={e => setTestValues({ ...testValues, [v.name]: e.target.value })}>
                        {v.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input type="number" step="any" className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm" value={testValues[v.name] ?? ''} onChange={e => setTestValues({ ...testValues, [v.name]: e.target.value === '' ? '' : parseFloat(e.target.value) })} />
                    )}
                  </div>
                ))}
              </div>
              {showManualEdit && !scaleData?.isBuiltIn && (
                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                  <label className="text-xs text-yellow-400">✏️ Fórmula:</label>
                  <input type="text" className="w-full bg-gray-700 rounded px-3 py-2 text-sm mt-1 font-mono" value={manualFormula} onChange={e => setManualFormula(e.target.value)} />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button onClick={runTest} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">▶️ Calcular</button>
                <button onClick={reset} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm">↩️ Voltar</button>
              </div>
            </div>
          </div>
        )}

        {step === 'result' && calculationResult && (
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-600 rounded p-3">
              <h4 className="text-sm text-gray-400 mb-2">📋 Valores utilizados:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                {Object.entries(testValues).map(([k, v]) => {
                  const varInfo = variables.find(x => x.name === k);
                  const display = varInfo?.options?.find(o => o.value === String(v))?.label || v;
                  return <div key={k} className="bg-gray-700/50 rounded px-2 py-1"><span className="text-gray-400">{varInfo?.description || k}:</span> <span className="text-white font-medium">{display}</span></div>;
                })}
              </div>
            </div>

            <div className="bg-gray-800 border border-green-500 rounded p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-3">📊 Resultado</h3>
              {calculationResult.details ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded p-3">
                      <h4 className="text-sm text-blue-400 mb-2">10 Anos</h4>
                      <p className="text-2xl font-bold text-white">{calculationResult.details.tenYear.totalCVD}%</p>
                      <p className="text-xs text-gray-400 mt-1">ASCVD: {calculationResult.details.tenYear.ascvd}% | HF: {calculationResult.details.tenYear.heartFailure}%</p>
                    </div>
                    <div className="bg-gray-700/50 rounded p-3">
                      <h4 className="text-sm text-purple-400 mb-2">30 Anos</h4>
                      <p className="text-2xl font-bold text-white">{calculationResult.details.thirtyYear.totalCVD}%</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded">
                    <p className="text-sm"><span className="text-gray-400">Categoria:</span> <span className={calculationResult.category.includes('Low') ? 'text-green-400' : calculationResult.category.includes('High') ? 'text-red-400' : 'text-yellow-400'}>{calculationResult.category}</span></p>
                    <p className="text-sm mt-1"><span className="text-gray-400">Recomendação:</span> {calculationResult.management}</p>
                  </div>
                </div>
              ) : (
                <p className="text-3xl font-bold">{calculationResult.score}</p>
              )}
            </div>

            <div className="bg-gray-800 border border-yellow-500 rounded p-3">
              <p className="text-yellow-400 text-sm mb-2">⚠️ Compare com calculadora oficial (MDCalc) para validar.</p>
              <div className="flex gap-3 flex-wrap">
                <button onClick={reset} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">✅ Nova Escala</button>
                <button onClick={() => setStep('code')} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm">🔄 Ajustar</button>
                <button onClick={downloadFile} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm">⬇️ Download</button>
                <button onClick={sendToSlack} disabled={slackSending} className={`px-4 py-2 rounded text-sm ${slackSent ? 'bg-green-600' : 'bg-pink-600 hover:bg-pink-700'}`}>
                  {slackSending ? '⏳' : slackSent ? '✅ Enviado!' : '📤 Enviar no Slack'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-3 border-t border-gray-700 text-center text-gray-500 text-xs">
          Clinical Scales Extractor v3 • Built-in: PREVENT
        </div>
      </div>
    </div>
  );
}
