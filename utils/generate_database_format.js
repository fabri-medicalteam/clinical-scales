/**
 * GENERATE DATABASE-COMPATIBLE FORMAT
 *
 * This module converts extracted scale data to the database schema format
 * Required by the Figma board specification.
 *
 * Generates both:
 * 1. Scale entity document
 * 2. Variable entity documents
 */

/**
 * Generate Scale entity document for database
 *
 * @param {Object} data - Extracted scale data from Claude
 * @param {Array} variables - Array of variables
 * @param {string} formula - Formula string
 * @param {string} language - Default language (es/pt/en)
 * @returns {Object} Scale entity document
 */
function generateScaleEntity(data, variables, formula, language = 'en') {
  const code_name = (data.scale_name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  // Generate get_value_function as Python string
  const get_value_function = generateCalculateFunction(variables, formula);

  // Generate interpretation_function as Python string
  const interpretation_function = generateInterpretFunction(data.interpretation);

  // Build interpretation_dict in 3 languages
  const interpretation_dict = buildInterpretationDict(data.interpretation, language);

  // Generate interpretation_prompt_for_llm
  const interpretation_prompt_for_llm = generateLLMPrompt(data);

  // Extract categories from suggested_triggers or data
  const category = extractCategories(data);

  // Build multilingual names (default to English, translate if needed)
  const name = {
    es: data.scale_name || '',  // TODO: Translate to Spanish
    pt: data.scale_name || '',  // TODO: Translate to Portuguese
    en: data.scale_name || ''
  };

  return {
    code_name,
    name,
    variables: variables.map(v => v.name),  // Just code names
    get_value_function,
    interpretation_function,
    interpretation_dict,
    interpretation_prompt_for_llm,
    description: data.description || '',
    category,
    created_at: new Date().toISOString(),
    version: 1
  };
}

/**
 * Generate Variable entity documents for database
 *
 * @param {Array} variables - Array of variable definitions
 * @param {string} language - Default language
 * @returns {Array} Array of Variable entity documents
 */
function generateVariableEntities(variables, language = 'en') {
  return variables.map(v => {
    const name = v.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Determine type
    const type = v.type === 'select' ? 'categorical' : 'numerical';

    // Build multilingual medical_name
    const medical_name = {
      es: v.description || v.name,  // TODO: Translate
      pt: v.description || v.name,  // TODO: Translate
      en: v.description || v.name
    };

    // Build description (mini-prompt for LLM)
    const description = buildVariableDescription(v);

    const entity = {
      name,
      medical_name,
      description,
      type,
      created_at: new Date().toISOString()
    };

    // Add type-specific fields
    if (type === 'categorical') {
      entity.possible_values = v.options
        ? v.options.map(o => o.value)
        : [];
    } else {
      entity.standardized_unit_of_measurement = v.unit || 'unit';
      entity.possible_units = [v.unit || 'unit'];
      entity.min_value = v.min;
      entity.max_value = v.max;
    }

    return entity;
  });
}

/**
 * Generate calculate function as Python string
 */
function generateCalculateFunction(variables, formula) {
  const params = variables.map(v => v.name).join(', ');

  if (formula === 'SUM_OF_POINTS' || !formula) {
    return `def calculate(${params}):
    """Calculate scale value by summing all points."""
    score = 0
    for value in [${params}]:
        if value is not None:
            score += int(value) if isinstance(value, (int, float, str)) and str(value).lstrip('-').replace('.','').isdigit() else 0
    return score`;
  }

  // Mathematical formula
  const pythonFormula = formula.replace(/([a-z_]+)/gi, (match) => {
    return variables.find(v => v.name === match) ? match : `0`;
  });

  return `def calculate(${params}):
    """Calculate scale value using formula: ${formula}"""
    try:
        result = ${pythonFormula}
        return result
    except Exception as e:
        print(f"Calculation error: {e}")
        return None`;
}

/**
 * Generate interpretation function as Python string
 */
function generateInterpretFunction(interpretations) {
  if (!interpretations || !Array.isArray(interpretations)) {
    return `def interpret(value):
    """Convert numeric value to interpretation category."""
    return str(int(value)) if value is not None else None`;
  }

  // Build if-elif chain based on interpretation ranges
  let conditions = interpretations.map((interp, idx) => {
    const range = interp.range || '';
    const [min, max] = parseRange(range);

    if (min !== null && max !== null) {
      return `    ${idx === 0 ? 'if' : 'elif'} ${min} <= value <= ${max}:
        return "${range}"`;
    } else if (min !== null) {
      return `    ${idx === 0 ? 'if' : 'elif'} value >= ${min}:
        return "${range}"`;
    } else if (max !== null) {
      return `    ${idx === 0 ? 'if' : 'elif'} value <= ${max}:
        return "${range}"`;
    }
    return '';
  }).filter(Boolean).join('\n');

  return `def interpret(value):
    """Convert numeric value to interpretation category."""
    if value is None:
        return None
${conditions}
    return str(int(value))`;
}

/**
 * Build interpretation_dict in 3 languages
 */
function buildInterpretationDict(interpretations, defaultLang = 'en') {
  const dict = {
    es: {},
    pt: {},
    en: {}
  };

  if (!interpretations || !Array.isArray(interpretations)) {
    return dict;
  }

  interpretations.forEach(interp => {
    const key = interp.range || '';
    const meaning = interp.meaning || '';
    const recommendation = interp.recommendation || '';
    const fullText = `${meaning}${recommendation ? ' - ' + recommendation : ''}`;

    // Default to English, TODO: translate
    dict.es[key] = fullText;
    dict.pt[key] = fullText;
    dict.en[key] = fullText;
  });

  return dict;
}

/**
 * Generate interpretation_prompt_for_llm
 */
function generateLLMPrompt(data) {
  const scaleName = data.scale_name || 'this scale';

  return `You are interpreting ${scaleName} for clinical decision support.

Given:
- Scale value: {value}
- Patient context: {patient_context}

Provide a contextualized interpretation considering:
1. Patient-specific risk factors
2. Current medications and potential interactions
3. Comorbidities and contraindications
4. Clinical guidelines and evidence-based recommendations
5. Practical next steps for management

${data.description ? `\nScale purpose: ${data.description}` : ''}

Format your interpretation as:
- Clinical significance of this score
- Risk level and implications
- Specific recommendations for this patient
- Follow-up and monitoring plan
- Any red flags or urgent actions needed

Base your interpretation STRICTLY on the information provided. Do not invent or assume clinical data.`;
}

/**
 * Build variable description (mini-prompt for LLM extraction)
 */
function buildVariableDescription(variable) {
  const name = variable.description || variable.name;
  const type = variable.type;

  if (type === 'select') {
    const options = variable.options
      ? variable.options.map(o => `"${o.label}" (value: ${o.value}, points: ${o.points || 0})`).join(', ')
      : '';

    return `Extract the value for "${name}" from the conversation.
This is a categorical variable with possible values: ${options}.
If not explicitly mentioned, return null with errorMessage: "Doctor did not mention ${name}".
Only extract what is EXPLICITLY stated in the conversation.`;
  } else {
    const unit = variable.unit || 'unit';
    const range = variable.min !== undefined && variable.max !== undefined
      ? ` (expected range: ${variable.min}-${variable.max} ${unit})`
      : '';

    return `Extract the numeric value for "${name}" from the conversation${range}.
Include the unit of measurement if mentioned. Default unit: ${unit}.
If not explicitly mentioned, return null with errorMessage: "Doctor did not mention ${name}".
Only extract what is EXPLICITLY stated in the conversation.`;
  }
}

/**
 * Extract categories from data
 */
function extractCategories(data) {
  const categories = [];

  // From description
  if (data.description) {
    const desc = data.description.toLowerCase();
    if (desc.includes('cardio')) categories.push('cardiology');
    if (desc.includes('stroke')) categories.push('stroke_risk');
    if (desc.includes('pneumonia')) categories.push('pulmonology');
    if (desc.includes('kidney') || desc.includes('renal')) categories.push('nephrology');
    if (desc.includes('liver') || desc.includes('hepat')) categories.push('hepatology');
  }

  // From suggested_triggers if available
  if (data.suggested_triggers && Array.isArray(data.suggested_triggers)) {
    categories.push(...data.suggested_triggers.slice(0, 5));
  }

  return [...new Set(categories)]; // Remove duplicates
}

/**
 * Parse range string to min/max numbers
 */
function parseRange(rangeStr) {
  if (!rangeStr) return [null, null];

  // Handle formats: "0-5", "<5", ">10", "≥20", "5+"
  const match = rangeStr.match(/(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/);
  if (match) {
    return [parseFloat(match[1]), parseFloat(match[2])];
  }

  const gtMatch = rangeStr.match(/[>≥]\s*(\d+\.?\d*)/);
  if (gtMatch) {
    return [parseFloat(gtMatch[1]), null];
  }

  const ltMatch = rangeStr.match(/[<≤]\s*(\d+\.?\d*)/);
  if (ltMatch) {
    return [null, parseFloat(ltMatch[1])];
  }

  const plusMatch = rangeStr.match(/(\d+\.?\d*)\s*\+/);
  if (plusMatch) {
    return [parseFloat(plusMatch[1]), null];
  }

  return [null, null];
}

/**
 * Generate complete database-ready package
 */
function generateDatabasePackage(data, variables, formula, language = 'en') {
  const scaleEntity = generateScaleEntity(data, variables, formula, language);
  const variableEntities = generateVariableEntities(variables, language);

  return {
    scale: scaleEntity,
    variables: variableEntities,
    metadata: {
      generated_at: new Date().toISOString(),
      source: 'clinical-scales-extractor',
      version: '1.0'
    }
  };
}

module.exports = {
  generateScaleEntity,
  generateVariableEntities,
  generateCalculateFunction,
  generateInterpretFunction,
  buildInterpretationDict,
  generateLLMPrompt,
  buildVariableDescription,
  generateDatabasePackage
};
