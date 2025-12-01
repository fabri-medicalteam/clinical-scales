/**
 * DATABASE SCHEMAS FOR CLINICAL SCALES
 *
 * This file defines the MongoDB/Firestore schemas for:
 * - Scales Entity
 * - Variables Entity
 *
 * Based on: How to make a scales agent (Figma board)
 */

// ============================================
// SCALES ENTITY SCHEMA
// ============================================

const ScaleSchema = {
  // Standard code name (key for the scale)
  code_name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    // Example: "cha2ds2_vasc", "curb_65", "apache_ii"
  },

  // Medical name in multiple languages
  name: {
    es: { type: String, required: true },  // Spanish
    pt: { type: String, required: true },  // Portuguese
    en: { type: String, required: true }   // English
  },

  // List of variable code names this scale requires
  // References to Variable entities
  variables: {
    type: [String],
    required: true,
    // Example: ["age", "weight", "height", "chf"]
  },

  // Python code (as string) to calculate the scale value
  // Will be executed at runtime using exec()
  get_value_function: {
    type: String,
    required: true,
    // Example: "def calculate(age, weight, height):\n    bmi = weight / (height/100)**2\n    return bmi"
  },

  // Python code (as string) to interpret the scale value
  // Converts numeric values to categories for interpretation_dict lookup
  interpretation_function: {
    type: String,
    required: false,  // Optional if using LLM interpretation only
    // Example: "def interpret(value):\n    if value < 18.5: return 'underweight'\n    ..."
  },

  // Interpretation dictionary for each possible value/category
  interpretation_dict: {
    es: {
      type: Map,
      of: String,
      // Example: {"0-1": "Bajo riesgo", "2-3": "Riesgo moderado", ...}
    },
    pt: {
      type: Map,
      of: String,
      // Example: {"0-1": "Baixo risco", "2-3": "Risco moderado", ...}
    },
    en: {
      type: Map,
      of: String,
      // Example: {"0-1": "Low risk", "2-3": "Moderate risk", ...}
    }
  },

  // Prompt for LLM contextual interpretation
  // Describes how this scale should be interpreted given patient context
  interpretation_prompt_for_llm: {
    type: String,
    required: false,
    // Example: "Interpret this CHA2DS2-VASc score considering patient's age, medications, and comorbidities..."
  },

  // Description of what the scale is and what it does
  description: {
    type: String,
    required: false,
    // Useful for automatic scale selection agents
  },

  // Categories this scale belongs to
  category: {
    type: [String],
    required: false,
    // Example: ["cardiology", "stroke_risk", "atrial_fibrillation"]
  },

  // Metadata
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: { type: String },  // User who created
  version: { type: Number, default: 1 }
};

// ============================================
// VARIABLES ENTITY SCHEMA
// ============================================

const VariableSchema = {
  // Code name of the variable (standardized internal name)
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
    // Example: "age", "weight", "systolic_bp"
  },

  // Medical name in multiple languages
  medical_name: {
    es: { type: String, required: true },
    pt: { type: String, required: true },
    en: { type: String, required: true }
  },

  // Description of what the variable is and how to extract it
  // Treated as a mini-prompt for LLM extraction
  description: {
    type: String,
    required: true,
    // Example: "Extract the patient's age in years from the conversation. If not mentioned, return null with errorMessage."
  },

  // Type of variable
  type: {
    type: String,
    enum: ['categorical', 'numerical'],
    required: true
  },

  // === FOR CATEGORICAL VARIABLES ===
  // Possible values the categorical variable can take
  possible_values: {
    type: [String],
    required: false,  // Only for categorical
    // Example: ["0-44", "45-64", "65-74", "75+"]
  },

  // === FOR NUMERICAL VARIABLES ===
  // Standard unit of measurement (SI or NIST notation)
  standardized_unit_of_measurement: {
    type: String,
    required: false,  // Only for numerical
    // Example: "cm", "kg", "mmHg", "mg/dL"
    // MUST be in SI (International System) or NIST standard notation
  },

  // All possible units this variable could be given in
  possible_units: {
    type: [String],
    required: false,  // Only for numerical
    // Example: ["cm", "m", "inches", "feet"]
    // MUST be in SI or NIST standard notation for Pint library compatibility
  },

  // Optional: Min/Max values for validation
  min_value: { type: Number, required: false },
  max_value: { type: Number, required: false },

  // Metadata
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
};

// ============================================
// MONGOOSE MODELS (if using MongoDB)
// ============================================

/*
const mongoose = require('mongoose');

const Scale = mongoose.model('Scale', new mongoose.Schema(ScaleSchema));
const Variable = mongoose.model('Variable', new mongoose.Schema(VariableSchema));

module.exports = { Scale, Variable };
*/

// ============================================
// FIRESTORE COLLECTIONS (if using Firestore)
// ============================================

/*
const admin = require('firebase-admin');
const db = admin.firestore();

const scalesCollection = db.collection('scales');
const variablesCollection = db.collection('variables');

module.exports = { scalesCollection, variablesCollection };
*/

// ============================================
// EXAMPLE DOCUMENTS
// ============================================

const exampleScaleDocument = {
  code_name: "cha2ds2_vasc",
  name: {
    es: "Puntuación CHA₂DS₂-VASc",
    pt: "Escore CHA₂DS₂-VASc",
    en: "CHA₂DS₂-VASc Score"
  },
  variables: ["chf", "hypertension", "age_category", "diabetes", "stroke_history", "vascular_disease", "sex"],
  get_value_function: `def calculate(chf, hypertension, age_category, diabetes, stroke_history, vascular_disease, sex):
    score = 0
    score += int(chf)
    score += int(hypertension)
    score += int(age_category)  # 0 for <65, 1 for 65-74, 2 for >=75
    score += int(diabetes)
    score += int(stroke_history) * 2  # Stroke worth 2 points
    score += int(vascular_disease)
    score += int(sex)  # 1 if female, 0 if male
    return score`,
  interpretation_function: `def interpret(value):
    # Convert numeric score to risk category
    if value == 0:
        return "0"
    elif value == 1:
        return "1"
    elif value == 2:
        return "2"
    elif value >= 3:
        return "3+"
    return str(int(value))`,
  interpretation_dict: {
    es: {
      "0": "Riesgo bajo: 0% anual de ACV",
      "1": "Riesgo bajo: 1.3% anual de ACV - Considerar anticoagulación",
      "2": "Riesgo moderado: 2.2% anual de ACV - Anticoagulación recomendada",
      "3+": "Riesgo alto: ≥3.2% anual de ACV - Anticoagulación oral recomendada"
    },
    pt: {
      "0": "Risco baixo: 0% anual de AVC",
      "1": "Risco baixo: 1.3% anual de AVC - Considerar anticoagulação",
      "2": "Risco moderado: 2.2% anual de AVC - Anticoagulação recomendada",
      "3+": "Risco alto: ≥3.2% anual de AVC - Anticoagulação oral recomendada"
    },
    en: {
      "0": "Low risk: 0% annual stroke risk",
      "1": "Low risk: 1.3% annual stroke risk - Consider anticoagulation",
      "2": "Moderate risk: 2.2% annual stroke risk - Anticoagulation recommended",
      "3+": "High risk: ≥3.2% annual stroke risk - Oral anticoagulation recommended"
    }
  },
  interpretation_prompt_for_llm: `You are interpreting a CHA₂DS₂-VASc score for stroke risk stratification in atrial fibrillation.

Given:
- CHA₂DS₂-VASc score: {value}
- Patient context: {patient_context}

Provide a contextualized interpretation considering:
1. The patient's specific risk factors
2. Current medications (especially anticoagulants, antiplatelets)
3. Bleeding risk factors (age, falls, GI bleed history)
4. Contraindications to anticoagulation
5. Patient preferences and lifestyle

Format your interpretation as:
- Risk level and annual stroke risk percentage
- Recommendation for anticoagulation (yes/no/consider)
- Specific considerations for this patient
- Follow-up recommendations`,
  description: "Stroke risk stratification score for patients with atrial fibrillation. Helps determine need for anticoagulation therapy.",
  category: ["cardiology", "stroke_risk", "atrial_fibrillation", "anticoagulation"]
};

const exampleVariableDocument = {
  name: "age_category",
  medical_name: {
    es: "Categoría de edad",
    pt: "Categoria de idade",
    en: "Age category"
  },
  description: "Extract the patient's age and categorize it: 0 points for age <65 years, 1 point for age 65-74 years, 2 points for age ≥75 years. If age is not mentioned, return null with errorMessage 'Doctor did not mention patient age'.",
  type: "categorical",
  possible_values: ["0", "1", "2"]
};

const exampleNumericalVariableDocument = {
  name: "weight",
  medical_name: {
    es: "Peso",
    pt: "Peso",
    en: "Weight"
  },
  description: "Extract the patient's body weight from the conversation. Accept any unit of measurement mentioned (kg, lb, g). If not mentioned, return null with errorMessage 'Doctor did not mention patient weight'.",
  type: "numerical",
  standardized_unit_of_measurement: "kg",
  possible_units: ["kg", "lb", "g", "oz"],
  min_value: 0.5,  // 0.5 kg (newborn minimum)
  max_value: 500   // 500 kg (extreme cases)
};

module.exports = {
  ScaleSchema,
  VariableSchema,
  exampleScaleDocument,
  exampleVariableDocument,
  exampleNumericalVariableDocument
};
