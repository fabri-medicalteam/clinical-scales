# Unit Conversion System

## Overview

The Clinical Scales Extractor now includes a comprehensive unit conversion system that allows users to input measurements in their preferred units. The system automatically converts all values to standardized SI/NIST units before calculations.

## Features

### ✅ Automatic Unit Detection
- Intelligently infers measurement types from variable names
- Supports 15+ measurement types (weight, height, glucose, etc.)
- Automatic mapping to standard units

### ✅ Multiple Units Per Variable
- Users can select from compatible units
- Real-time unit dropdown in the UI
- Examples:
  - Weight: kg, g, lb, oz
  - Height: m, cm, ft, in
  - Glucose: mg/dL, mmol/L
  - Temperature: °C, °F, K

### ✅ Python Pint Integration
- Uses Pint library for accurate conversions
- Follows SI/NIST standards
- Handles complex units (mg/dL, mL/min/1.73m², etc.)

### ✅ Frontend Unit Selection
- Dropdown selector for each numerical variable
- Display-friendly unit formatting
- Preserves user's unit choice during input

## Supported Measurement Types

| Measurement Type | Standard Unit | Possible Units |
|-----------------|---------------|----------------|
| Weight/Mass | kg | kg, g, mg, lb, oz |
| Height/Length | m | m, cm, mm, ft, in |
| Temperature | °C | °C, °F, K |
| Blood Pressure | mmHg | mmHg, kPa |
| Glucose | mg/dL | mg/dL, mmol/L |
| Creatinine | mg/dL | mg/dL, µmol/L, mmol/L |
| Cholesterol | mg/dL | mg/dL, mmol/L |
| Hemoglobin | g/dL | g/dL, g/L, mmol/L |
| Bilirubin | mg/dL | mg/dL, µmol/L |
| Volume | L | L, mL, dL |
| Heart Rate | bpm | bpm, /min |
| Time | s | s, min, h, day |

## How It Works

### 1. Variable Detection

When a scale is extracted, the system:
1. Analyzes variable names (e.g., "weight", "glucose", "height")
2. Infers the measurement type
3. Assigns standard unit and possible units

```javascript
// Example: Variable "weight" is detected
inferMeasurementType("weight") // Returns: "weight"
getStandardUnit("weight")      // Returns: "kg"
getPossibleUnits("weight")     // Returns: [kg, g, lb, oz]
```

### 2. Frontend Unit Selection

Users see a dropdown next to numerical inputs:

```
┌─────────────────┬──────┐
│ Weight: [70.5__]│ kg ▼ │  ← User can select unit
└─────────────────┴──────┘
```

Options in dropdown: kg, g, lb, oz

### 3. Automatic Conversion

When the scale is calculated:

```python
def calculate(weight, weight_unit='kg', height, height_unit='m'):
    # Import unit converter
    from utils.unit_converter import normalize_to_standard

    # Convert to standard units
    weight = normalize_to_standard(weight, weight_unit, 'weight')
    height = normalize_to_standard(height, height_unit, 'height')

    # Calculate using standardized values
    bmi = weight / (height ** 2)
    return bmi
```

**Example:**
- User inputs: 150 lb
- System converts: 150 lb → 68.04 kg
- Calculation uses: 68.04 kg (standard unit)

## Installation

### Install Pint Library

For Python unit conversion to work, install Pint:

```bash
pip install pint
```

or

```bash
pip3 install pint
```

## Usage Examples

### Example 1: BMI Calculator with Units

**Input:**
- Weight: 150 lb
- Height: 5.9 ft

**Processing:**
1. System detects: weight → weight type, height → height type
2. Converts: 150 lb → 68.04 kg, 5.9 ft → 1.80 m
3. Calculates: BMI = 68.04 / (1.80²) = 21.0

### Example 2: Glucose Monitoring

**Input:**
- Fasting Glucose: 110 mg/dL (US standard)
- Or: 6.1 mmol/L (International standard)

**Processing:**
1. Both convert to standard: mg/dL
2. Calculation uses standardized value
3. Works seamlessly with either unit

### Example 3: Creatinine Clearance

**Input:**
- Creatinine: 88 µmol/L (International)
- Weight: 70 kg
- Age: 65 years

**Processing:**
1. Converts: 88 µmol/L → 1.0 mg/dL
2. Uses standardized values for Cockcroft-Gault formula
3. Returns clearance in mL/min

## Code Structure

```
clinical-scales/
├── utils/
│   ├── unit_converter.py         # Python Pint-based converter
│   ├── unit_definitions.js       # JavaScript unit mappings
│   └── generate_database_format.js  # Auto-generates unit support
├── pages/
│   └── index.js                  # Frontend with unit dropdowns
└── UNIT_CONVERSION_SYSTEM.md    # This documentation
```

## Generated Code Example

When a scale is generated, it includes unit conversion:

```python
"""
Clinical Scale: Body Mass Index (BMI)
"""

SCALE_DATA = {
    "name": "Body Mass Index",
    "description": "Calculates BMI from weight and height",
    "variables": {
        "weight": {"type": "numerical", "unit": "kg", "possible_units": ["kg", "g", "lb", "oz"]},
        "height": {"type": "numerical", "unit": "m", "possible_units": ["m", "cm", "ft", "in"]}
    },
    "formula": "weight / (height ** 2)"
}

def calculate(weight, weight_unit='kg', height, height_unit='m'):
    """Calculate BMI with automatic unit conversion."""

    # Import unit converter
    try:
        from utils.unit_converter import normalize_to_standard
    except ImportError:
        def normalize_to_standard(value, unit, measure_type):
            return value  # Fallback: no conversion

    # Convert all inputs to standard units
    weight = normalize_to_standard(weight, weight_unit, 'weight')
    height = normalize_to_standard(height, height_unit, 'height')

    # Calculate using formula
    try:
        result = weight / (height ** 2)
        return result
    except Exception as e:
        print(f"Calculation error: {e}")
        return None
```

## Benefits

### For Users
- ✅ Enter values in familiar units (US vs International)
- ✅ No manual conversion needed
- ✅ Reduced input errors
- ✅ Better user experience

### For Developers
- ✅ Standardized internal calculations
- ✅ Automatic unit inference
- ✅ Extensible unit system
- ✅ Follows SI/NIST standards

### For Clinical Applications
- ✅ Supports international medical standards
- ✅ Accurate conversions (Pint library)
- ✅ Validates unit compatibility
- ✅ Reduces medical errors

## Testing

### Test Python Unit Converter

```bash
cd utils
python unit_converter.py
```

Expected output:
```
Example 1: Weight conversion
150 lb = 68.04 kg
70 kg = 154.32 lb

Example 2: Height conversion
5.9 ft = 1.80 m
180 cm = 1.80 m

Example 3: Glucose conversion
100 mg/dL = 5.55 mmol/L
5.5 mmol/L = 99.09 mg/dL

Example 4: Temperature conversion
98.6 °F = 37.00 °C
37 °C = 98.60 °F
```

### Test Frontend

1. Run development server:
   ```bash
   npm run dev
   ```

2. Create a scale with weight or glucose variables

3. Verify:
   - Unit dropdown appears next to input
   - Can select different units
   - Calculation works with all units

## Limitations

### Current Limitations

1. **Pint Dependency**: Python calculations require Pint library
   - Fallback: Returns values as-is without conversion
   - Install: `pip install pint`

2. **Complex Units**: Some medical units are approximations
   - Example: mmol/L conversions depend on molecular weight
   - System uses standard conversion factors

3. **Frontend Only**: Unit conversion happens in Python backend
   - Frontend displays results but doesn't perform conversions
   - Could add client-side conversion in future

### Future Enhancements

- [ ] Client-side JavaScript unit conversion (remove Pint dependency for display)
- [ ] More medical units (IU/L, pg/mL, etc.)
- [ ] Unit validation in frontend (prevent incompatible units)
- [ ] Unit conversion history/tracking
- [ ] Custom unit definitions per scale
- [ ] Automatic unit detection from PDF parsing

## FAQ

### Q: Do I need to install Pint?

**A:** For full functionality, yes. Install with `pip install pint`. If not installed, the system will work but won't perform conversions (uses values as-is).

### Q: Can I add custom units?

**A:** Yes! Edit `utils/unit_definitions.js` (JavaScript) and `utils/unit_converter.py` (Python). Add your units to the `POSSIBLE_UNITS` and `STANDARD_UNITS` dictionaries.

### Q: What if a variable doesn't have units?

**A:** The system automatically detects this and doesn't show a unit dropdown. Examples: age, scores, ratios (like INR).

### Q: Can I use this offline?

**A:** Yes! All unit conversions happen locally using the Pint library. No API calls required.

### Q: How accurate are the conversions?

**A:** Very accurate. Pint uses standard conversion factors from NIST and international standards.

## Support

For issues or questions about the unit conversion system:
- Check this documentation first
- Verify Pint is installed: `pip list | grep pint`
- Test the converter: `python utils/unit_converter.py`
- Check console for errors

## License

Part of the Clinical Scales Extractor project.
Uses Pint library (BSD license) for unit conversions.
