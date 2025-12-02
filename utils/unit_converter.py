"""
UNIT CONVERTER MODULE

Handles unit conversions using Pint library following SI/NIST standards.
Supports common medical and clinical measurement units.
"""

try:
    from pint import UnitRegistry
    ureg = UnitRegistry()
    PINT_AVAILABLE = True
except ImportError:
    PINT_AVAILABLE = False
    print("Warning: Pint library not installed. Unit conversion disabled.")
    print("Install with: pip install pint")


# Standard units for each measurement type (SI/NIST standards)
STANDARD_UNITS = {
    # Mass/Weight
    'mass': 'kg',
    'weight': 'kg',

    # Length/Height
    'length': 'm',
    'height': 'm',
    'distance': 'm',

    # Volume
    'volume': 'L',

    # Time
    'time': 's',
    'duration': 's',

    # Temperature
    'temperature': 'degC',

    # Pressure
    'pressure': 'mmHg',
    'blood_pressure': 'mmHg',

    # Concentration
    'concentration': 'mg/dL',
    'molar_concentration': 'mmol/L',

    # Area
    'area': 'm**2',
    'body_surface_area': 'm**2',

    # Rate
    'heart_rate': 'bpm',
    'respiratory_rate': '/min',
    'glomerular_filtration_rate': 'mL/min/1.73m**2',

    # Other clinical
    'glucose': 'mg/dL',
    'creatinine': 'mg/dL',
    'cholesterol': 'mg/dL',
    'hemoglobin': 'g/dL',
}


# Possible units for each measurement type
POSSIBLE_UNITS = {
    'mass': ['kg', 'g', 'mg', 'lb', 'oz'],
    'weight': ['kg', 'g', 'lb', 'oz'],
    'length': ['m', 'cm', 'mm', 'ft', 'in'],
    'height': ['m', 'cm', 'ft', 'in'],
    'volume': ['L', 'mL', 'dL', 'gallon', 'fl_oz'],
    'temperature': ['degC', 'degF', 'K'],
    'pressure': ['mmHg', 'kPa', 'atm', 'psi'],
    'blood_pressure': ['mmHg', 'kPa'],
    'concentration': ['mg/dL', 'g/L', 'mmol/L'],
    'glucose': ['mg/dL', 'mmol/L'],
    'creatinine': ['mg/dL', 'umol/L', 'mmol/L'],
    'cholesterol': ['mg/dL', 'mmol/L'],
    'hemoglobin': ['g/dL', 'g/L', 'mmol/L'],
    'time': ['s', 'min', 'h', 'day', 'week', 'month', 'year'],
    'heart_rate': ['bpm', '/min'],
    'respiratory_rate': ['/min', '/s'],
    'area': ['m**2', 'cm**2', 'ft**2'],
}


def convert_unit(value, from_unit, to_unit):
    """
    Convert value from one unit to another using Pint.

    Args:
        value (float): Numeric value to convert
        from_unit (str): Source unit (e.g., 'lb', 'mg/dL')
        to_unit (str): Target unit (e.g., 'kg', 'mmol/L')

    Returns:
        float: Converted value

    Raises:
        ValueError: If units are incompatible or invalid
        ImportError: If Pint library is not installed
    """
    if not PINT_AVAILABLE:
        raise ImportError("Pint library not installed. Cannot perform unit conversion.")

    if from_unit == to_unit:
        return value

    try:
        # Create quantity with source unit
        quantity = ureg.Quantity(value, from_unit)

        # Convert to target unit
        converted = quantity.to(to_unit)

        return float(converted.magnitude)

    except Exception as e:
        raise ValueError(f"Cannot convert {from_unit} to {to_unit}: {str(e)}")


def get_standard_unit(measurement_type):
    """
    Get the standard unit for a measurement type.

    Args:
        measurement_type (str): Type of measurement (e.g., 'mass', 'glucose')

    Returns:
        str: Standard unit for this measurement type
    """
    return STANDARD_UNITS.get(measurement_type.lower(), None)


def get_possible_units(measurement_type):
    """
    Get list of possible units for a measurement type.

    Args:
        measurement_type (str): Type of measurement

    Returns:
        list: List of possible unit strings
    """
    return POSSIBLE_UNITS.get(measurement_type.lower(), [])


def validate_unit_compatibility(unit1, unit2):
    """
    Check if two units are compatible (can be converted).

    Args:
        unit1 (str): First unit
        unit2 (str): Second unit

    Returns:
        bool: True if units are compatible
    """
    if not PINT_AVAILABLE:
        return False

    if unit1 == unit2:
        return True

    try:
        quantity = ureg.Quantity(1, unit1)
        quantity.to(unit2)
        return True
    except:
        return False


def normalize_to_standard(value, from_unit, measurement_type):
    """
    Convert value to the standard unit for its measurement type.

    Args:
        value (float): Value to normalize
        from_unit (str): Current unit
        measurement_type (str): Type of measurement

    Returns:
        float: Value in standard unit
    """
    standard_unit = get_standard_unit(measurement_type)

    if standard_unit is None:
        return value  # No standard defined, return as-is

    if from_unit == standard_unit:
        return value

    return convert_unit(value, from_unit, standard_unit)


# Example usage and tests
if __name__ == "__main__":
    print("Unit Converter Module - Examples\n")

    if PINT_AVAILABLE:
        # Example 1: Weight conversion
        print("Example 1: Weight conversion")
        print(f"150 lb = {convert_unit(150, 'lb', 'kg'):.2f} kg")
        print(f"70 kg = {convert_unit(70, 'kg', 'lb'):.2f} lb\n")

        # Example 2: Height conversion
        print("Example 2: Height conversion")
        print(f"5.9 ft = {convert_unit(5.9, 'ft', 'm'):.2f} m")
        print(f"180 cm = {convert_unit(180, 'cm', 'm'):.2f} m\n")

        # Example 3: Volume conversion
        print("Example 3: Volume conversion")
        print(f"1000 mL = {convert_unit(1000, 'mL', 'L'):.2f} L")
        print(f"2.5 L = {convert_unit(2.5, 'L', 'mL'):.0f} mL\n")

        # Note: mg/dL to mmol/L requires molecular weight (not direct conversion)
        print("Note: Mass/concentration to molar concentration requires molecular weight")
        print("Example for glucose: 100 mg/dL ≈ 5.55 mmol/L (factor: 18.018)")

        # Example 4: Temperature conversion
        print("Example 4: Temperature conversion")
        print(f"98.6 °F = {convert_unit(98.6, 'degF', 'degC'):.2f} °C")
        print(f"37 °C = {convert_unit(37, 'degC', 'degF'):.2f} °F\n")

        # Example 5: Unit compatibility
        print("Example 5: Unit compatibility")
        print(f"kg compatible with lb? {validate_unit_compatibility('kg', 'lb')}")
        print(f"kg compatible with mmHg? {validate_unit_compatibility('kg', 'mmHg')}")
    else:
        print("Pint not installed. Install with: pip install pint")
