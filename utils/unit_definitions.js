/**
 * UNIT DEFINITIONS
 *
 * Standard and possible units for clinical measurements
 * Following SI/NIST standards
 */

// Standard units for each measurement type (SI/NIST standards)
export const STANDARD_UNITS = {
  // Mass/Weight
  'mass': 'kg',
  'weight': 'kg',

  // Length/Height
  'length': 'm',
  'height': 'm',
  'distance': 'm',

  // Volume
  'volume': 'L',

  // Time
  'time': 's',
  'duration': 's',

  // Temperature
  'temperature': '°C',

  // Pressure
  'pressure': 'mmHg',
  'blood_pressure': 'mmHg',

  // Concentration
  'concentration': 'mg/dL',
  'molar_concentration': 'mmol/L',

  // Area
  'area': 'm²',
  'body_surface_area': 'm²',

  // Rate
  'heart_rate': 'bpm',
  'respiratory_rate': '/min',
  'glomerular_filtration_rate': 'mL/min/1.73m²',

  // Clinical measurements
  'glucose': 'mg/dL',
  'creatinine': 'mg/dL',
  'cholesterol': 'mg/dL',
  'hemoglobin': 'g/dL',
  'bilirubin': 'mg/dL',
  'albumin': 'g/dL',
  'inr': 'ratio',
  'platelets': '×10³/µL',
};

// Possible units for each measurement type with display names
export const POSSIBLE_UNITS = {
  'mass': [
    { value: 'kg', label: 'kg (kilograms)' },
    { value: 'g', label: 'g (grams)' },
    { value: 'mg', label: 'mg (milligrams)' },
    { value: 'lb', label: 'lb (pounds)' },
    { value: 'oz', label: 'oz (ounces)' }
  ],
  'weight': [
    { value: 'kg', label: 'kg (kilograms)' },
    { value: 'g', label: 'g (grams)' },
    { value: 'lb', label: 'lb (pounds)' },
    { value: 'oz', label: 'oz (ounces)' }
  ],
  'length': [
    { value: 'm', label: 'm (meters)' },
    { value: 'cm', label: 'cm (centimeters)' },
    { value: 'mm', label: 'mm (millimeters)' },
    { value: 'ft', label: 'ft (feet)' },
    { value: 'in', label: 'in (inches)' }
  ],
  'height': [
    { value: 'm', label: 'm (meters)' },
    { value: 'cm', label: 'cm (centimeters)' },
    { value: 'ft', label: 'ft (feet)' },
    { value: 'in', label: 'in (inches)' }
  ],
  'volume': [
    { value: 'L', label: 'L (liters)' },
    { value: 'mL', label: 'mL (milliliters)' },
    { value: 'dL', label: 'dL (deciliters)' }
  ],
  'temperature': [
    { value: '°C', label: '°C (Celsius)' },
    { value: '°F', label: '°F (Fahrenheit)' },
    { value: 'K', label: 'K (Kelvin)' }
  ],
  'pressure': [
    { value: 'mmHg', label: 'mmHg (millimeters of mercury)' },
    { value: 'kPa', label: 'kPa (kilopascals)' }
  ],
  'blood_pressure': [
    { value: 'mmHg', label: 'mmHg (millimeters of mercury)' },
    { value: 'kPa', label: 'kPa (kilopascals)' }
  ],
  'glucose': [
    { value: 'mg/dL', label: 'mg/dL (US standard)' },
    { value: 'mmol/L', label: 'mmol/L (International)' }
  ],
  'creatinine': [
    { value: 'mg/dL', label: 'mg/dL (US standard)' },
    { value: 'µmol/L', label: 'µmol/L (International)' },
    { value: 'mmol/L', label: 'mmol/L' }
  ],
  'cholesterol': [
    { value: 'mg/dL', label: 'mg/dL (US standard)' },
    { value: 'mmol/L', label: 'mmol/L (International)' }
  ],
  'hemoglobin': [
    { value: 'g/dL', label: 'g/dL (US standard)' },
    { value: 'g/L', label: 'g/L (International)' },
    { value: 'mmol/L', label: 'mmol/L' }
  ],
  'bilirubin': [
    { value: 'mg/dL', label: 'mg/dL (US standard)' },
    { value: 'µmol/L', label: 'µmol/L (International)' }
  ],
  'albumin': [
    { value: 'g/dL', label: 'g/dL (US standard)' },
    { value: 'g/L', label: 'g/L (International)' }
  ],
  'time': [
    { value: 's', label: 's (seconds)' },
    { value: 'min', label: 'min (minutes)' },
    { value: 'h', label: 'h (hours)' },
    { value: 'day', label: 'days' }
  ],
  'heart_rate': [
    { value: 'bpm', label: 'bpm (beats per minute)' },
    { value: '/min', label: '/min' }
  ],
  'respiratory_rate': [
    { value: '/min', label: '/min (per minute)' }
  ],
  'area': [
    { value: 'm²', label: 'm² (square meters)' },
    { value: 'cm²', label: 'cm² (square centimeters)' }
  ],
};

// Common measurement types for clinical scales
export const MEASUREMENT_TYPES = [
  { value: 'age', label: 'Age', unit: 'years', hasUnits: false },
  { value: 'weight', label: 'Weight', hasUnits: true },
  { value: 'height', label: 'Height', hasUnits: true },
  { value: 'blood_pressure', label: 'Blood Pressure', hasUnits: true },
  { value: 'heart_rate', label: 'Heart Rate', hasUnits: true },
  { value: 'respiratory_rate', label: 'Respiratory Rate', hasUnits: true },
  { value: 'temperature', label: 'Temperature', hasUnits: true },
  { value: 'glucose', label: 'Glucose', hasUnits: true },
  { value: 'creatinine', label: 'Creatinine', hasUnits: true },
  { value: 'cholesterol', label: 'Cholesterol', hasUnits: true },
  { value: 'hemoglobin', label: 'Hemoglobin', hasUnits: true },
  { value: 'platelets', label: 'Platelets', hasUnits: true },
  { value: 'bilirubin', label: 'Bilirubin', hasUnits: true },
  { value: 'albumin', label: 'Albumin', hasUnits: true },
  { value: 'inr', label: 'INR', hasUnits: false },
  { value: 'other', label: 'Other', hasUnits: false }
];

/**
 * Get standard unit for a measurement type
 */
export function getStandardUnit(measurementType) {
  return STANDARD_UNITS[measurementType.toLowerCase()] || null;
}

/**
 * Get possible units for a measurement type
 */
export function getPossibleUnits(measurementType) {
  return POSSIBLE_UNITS[measurementType.toLowerCase()] || [];
}

/**
 * Infer measurement type from variable name
 */
export function inferMeasurementType(variableName) {
  const name = variableName.toLowerCase();

  // Age
  if (name.includes('age') || name.includes('anos') || name.includes('years')) {
    return 'age';
  }

  // Weight
  if (name.includes('weight') || name.includes('peso') || name.includes('mass')) {
    return 'weight';
  }

  // Height
  if (name.includes('height') || name.includes('altura') || name.includes('tall')) {
    return 'height';
  }

  // Blood pressure
  if (name.includes('blood pressure') || name.includes('bp') || name.includes('systolic') || name.includes('diastolic') || name.includes('pressão')) {
    return 'blood_pressure';
  }

  // Heart rate
  if (name.includes('heart rate') || name.includes('hr') || name.includes('pulse') || name.includes('frequência cardíaca')) {
    return 'heart_rate';
  }

  // Temperature
  if (name.includes('temp') || name.includes('fever') || name.includes('temperatura')) {
    return 'temperature';
  }

  // Glucose
  if (name.includes('glucose') || name.includes('glicose') || name.includes('sugar') || name.includes('blood sugar')) {
    return 'glucose';
  }

  // Creatinine
  if (name.includes('creatinine') || name.includes('creatinina')) {
    return 'creatinine';
  }

  // Cholesterol
  if (name.includes('cholesterol') || name.includes('colesterol') || name.includes('ldl') || name.includes('hdl')) {
    return 'cholesterol';
  }

  // Hemoglobin
  if (name.includes('hemoglobin') || name.includes('hemoglobina') || name.includes('hb') || name.includes('hgb')) {
    return 'hemoglobin';
  }

  // Bilirubin
  if (name.includes('bilirubin') || name.includes('bilirrubina')) {
    return 'bilirubin';
  }

  // Albumin
  if (name.includes('albumin') || name.includes('albumina')) {
    return 'albumin';
  }

  // INR
  if (name.includes('inr')) {
    return 'inr';
  }

  return 'other';
}

/**
 * Format unit for display (convert Python Pint format to readable format)
 */
export function formatUnitForDisplay(unit) {
  const unitMap = {
    'degC': '°C',
    'degF': '°F',
    'umol/L': 'µmol/L',
    'm**2': 'm²',
    'cm**2': 'cm²',
  };

  return unitMap[unit] || unit;
}

/**
 * Convert display unit to Python Pint format
 */
export function formatUnitForPython(unit) {
  const unitMap = {
    '°C': 'degC',
    '°F': 'degF',
    'µmol/L': 'umol/L',
    'm²': 'm**2',
    'cm²': 'cm**2',
  };

  return unitMap[unit] || unit;
}
