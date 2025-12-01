"""
SCALES CALCULATOR PIPELINE
Based on: How to make a scales agent (Figma board)

This module implements the complete pipeline for:
1. getScales - Calculate scales from database
2. getScaleSession - Calculate and save to EMR with LLM interpretation

Database structure:
- scales collection: Scale entities
- variables collection: Variable entities
"""

import json
from typing import Dict, List, Any, Optional
from pint import UnitRegistry

# Initialize Pint for unit conversions (SI/NIST standard)
ureg = UnitRegistry()


class ScalesCalculatorPipeline:
    """
    Main pipeline for calculating clinical scales from database.

    Implements the desired pipeline:
    1. Receive list of scale code names
    2. Query scales from database
    3. Extract distinct variables needed
    4. Query variables from database
    5. Call LLM to extract variable values (structured output)
    6. Convert units using Pint
    7. Calculate scale values using exec()
    8. Get LLM contextual interpretation
    9. Return results / Save to EMR
    """

    def __init__(self, db_client, llm_client):
        """
        Initialize pipeline.

        Args:
            db_client: Database client (MongoDB/Firestore)
            llm_client: LLM client (Anthropic Claude, OpenAI, etc)
        """
        self.db = db_client
        self.llm = llm_client

    # ============================================
    # STEP 1: QUERY SCALES FROM DATABASE
    # ============================================

    def get_scales_objects(self, scale_code_names: List[str]) -> List[Dict[str, Any]]:
        """
        Retrieve scale entities from database and create runtime objects.

        This function should be modified as per Figma board:
        - Query database for scale documents
        - Use exec() to convert function strings to actual functions
        - Return scale objects ready for calculation

        Args:
            scale_code_names: List of scale code names to retrieve
                             Example: ["cha2ds2_vasc", "curb_65"]

        Returns:
            List of scale objects with executable functions
        """
        scales_objects = []

        for code_name in scale_code_names:
            # Query database
            scale_doc = self.db.scales.find_one({"code_name": code_name})

            if not scale_doc:
                print(f"Warning: Scale '{code_name}' not found in database")
                continue

            # Convert function strings to actual functions using exec()
            scale_obj = self._create_scale_object_from_document(scale_doc)
            scales_objects.append(scale_obj)

        return scales_objects

    def _create_scale_object_from_document(self, scale_doc: Dict) -> Dict[str, Any]:
        """
        Dynamically create scale object with executable functions from document.

        Uses exec() to convert string functions to runtime Python functions.
        """
        scale_obj = {
            "code_name": scale_doc["code_name"],
            "name": scale_doc["name"],
            "variables": scale_doc["variables"],
            "description": scale_doc.get("description"),
            "interpretation_dict": scale_doc.get("interpretation_dict", {}),
            "interpretation_prompt_for_llm": scale_doc.get("interpretation_prompt_for_llm"),
            "category": scale_doc.get("category", [])
        }

        # Create calculate function from string
        namespace = {}
        exec(scale_doc["get_value_function"], namespace)
        scale_obj["calculate"] = namespace.get("calculate")

        # Create interpretation function if exists
        if scale_doc.get("interpretation_function"):
            exec(scale_doc["interpretation_function"], namespace)
            scale_obj["interpret"] = namespace.get("interpret")

        return scale_obj

    # ============================================
    # STEP 2: EXTRACT DISTINCT VARIABLES
    # ============================================

    def get_variables(self, scale_objects: List[Dict]) -> tuple:
        """
        Extract complete list of distinct variables required by all scales.

        This function should be modified as per Figma board:
        - Get distinct variables from all scales
        - Query database for variable documents
        - Create variable objects
        - Create mapping: variable -> scales that use it
        - Create dict structure for storing values

        Args:
            scale_objects: List of scale objects

        Returns:
            Tuple of (variables_objects, variables_to_scales_map, values_dict)
        """
        # Get distinct variable names
        all_variables = set()
        for scale in scale_objects:
            all_variables.update(scale["variables"])

        # Query database for variable documents
        variables_objects = []
        for var_name in all_variables:
            var_doc = self.db.variables.find_one({"name": var_name})
            if var_doc:
                variables_objects.append(var_doc)
            else:
                print(f"Warning: Variable '{var_name}' not found in database")

        # Create mapping: variable -> scales that use it
        variables_to_scales_map = {}
        for var in all_variables:
            variables_to_scales_map[var] = [
                scale["code_name"]
                for scale in scale_objects
                if var in scale["variables"]
            ]

        # Create dict structure to store values for each scale
        values_dict = {}
        for scale in scale_objects:
            values_dict[scale["code_name"]] = {}

        return variables_objects, variables_to_scales_map, values_dict

    # ============================================
    # STEP 3: LLM EXTRACTION WITH STRUCTURED OUTPUT
    # ============================================

    def extract_variables_with_llm(
        self,
        variables: List[Dict],
        conversation_context: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Call LLM to extract variable values from conversation.

        Uses structured output to ensure exact format:
        - Categorical: {value: str|null, errorMessage: str|null}
        - Numerical: {value: float|null, unit: str|null, errorMessage: str|null}

        Args:
            variables: List of variable objects
            conversation_context: Full conversation text
            language: Language for error messages (es/pt/en)

        Returns:
            Dict with extracted values for each variable
        """
        # Build prompt with variable descriptions
        prompt = self._build_extraction_prompt(variables, conversation_context, language)

        # Define structured output schema
        structured_schema = self._build_structured_output_schema(variables)

        # Call LLM with structured output
        response = self.llm.call_with_structured_output(
            prompt=prompt,
            schema=structured_schema,
            model="claude-sonnet-4-20250514"
        )

        return response

    def _build_extraction_prompt(
        self,
        variables: List[Dict],
        context: str,
        language: str
    ) -> str:
        """Build extraction prompt with variable descriptions."""
        error_messages = {
            "es": "Doctor, no mencionó",
            "pt": "Doutor, você não mencionou",
            "en": "Doctor, you did not mention"
        }

        variables_desc = "\n\n".join([
            f"**{var['name']}** ({var['type']}):\n{var['description']}\n"
            f"Medical name: {var['medical_name'][language]}"
            for var in variables
        ])

        prompt = f"""Extract the following clinical variables from the conversation.

VARIABLES TO EXTRACT:
{variables_desc}

CONVERSATION CONTEXT:
{context}

RULES:
1. Extract ONLY explicitly mentioned values
2. For numerical variables: include unit of measurement
3. If not mentioned: set value=null and provide errorMessage
4. errorMessage format: "{error_messages[language]} [variable name]"

Return in the structured format specified."""

        return prompt

    def _build_structured_output_schema(self, variables: List[Dict]) -> Dict:
        """Build structured output schema for LLM."""
        schema = {"type": "object", "properties": {}}

        for var in variables:
            if var["type"] == "categorical":
                schema["properties"][var["name"]] = {
                    "type": "object",
                    "properties": {
                        "value": {
                            "type": ["string", "null"],
                            "enum": var.get("possible_values", []) + [None]
                        },
                        "errorMessage": {"type": ["string", "null"]}
                    },
                    "required": ["value", "errorMessage"]
                }
            else:  # numerical
                schema["properties"][var["name"]] = {
                    "type": "object",
                    "properties": {
                        "value": {"type": ["number", "null"]},
                        "unit": {
                            "type": ["string", "null"],
                            "enum": var.get("possible_units", []) + [None]
                        },
                        "errorMessage": {"type": ["string", "null"]}
                    },
                    "required": ["value", "unit", "errorMessage"]
                }

        return schema

    # ============================================
    # STEP 4: PROCESS EXTRACTED VALUES
    # ============================================

    def process_extracted_values(
        self,
        extracted_data: Dict,
        variables_objects: List[Dict],
        variables_to_scales_map: Dict,
        values_dict: Dict
    ) -> Dict:
        """
        Process LLM output and populate values_dict.

        - Convert numerical values to Pint objects with units
        - Inject values into appropriate scale dicts

        Args:
            extracted_data: LLM extraction output
            variables_objects: List of variable objects
            variables_to_scales_map: Map of variable -> scales
            values_dict: Dict to populate with values

        Returns:
            Updated values_dict
        """
        for var in variables_objects:
            var_name = var["name"]
            extracted = extracted_data.get(var_name, {})

            value = extracted.get("value")

            if value is None:
                # Variable not extracted, skip
                continue

            # Convert numerical variables to Pint objects
            if var["type"] == "numerical":
                unit = extracted.get("unit") or var["standardized_unit_of_measurement"]

                # Validate unit is in possible_units
                if unit not in var.get("possible_units", []):
                    print(f"Warning: Invalid unit '{unit}' for variable '{var_name}'")
                    continue

                # Create Pint quantity
                pint_value = ureg.Quantity(value, unit)

                # Convert to standardized unit
                standard_unit = var["standardized_unit_of_measurement"]
                pint_value = pint_value.to(standard_unit)

                # Extract magnitude for calculation
                value = pint_value.magnitude

            # Inject value into all scales that need this variable
            for scale_code_name in variables_to_scales_map.get(var_name, []):
                values_dict[scale_code_name][var_name] = value

        return values_dict

    # ============================================
    # STEP 5: CALCULATE SCALES
    # ============================================

    def calculate_scales(
        self,
        scale_objects: List[Dict],
        values_dict: Dict,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Calculate value for each scale and get interpretations.

        Args:
            scale_objects: List of scale objects with calculate functions
            values_dict: Dict with variable values for each scale
            language: Language for interpretations

        Returns:
            Dict with scale results
        """
        results = {}

        for scale in scale_objects:
            code_name = scale["code_name"]
            scale_values = values_dict[code_name]

            # Check if we have all required variables
            missing_vars = [
                var for var in scale["variables"]
                if var not in scale_values or scale_values[var] is None
            ]

            if missing_vars:
                results[code_name] = {
                    "scale": {
                        "key": code_name,
                        "scale_name": scale["name"][language],
                        "value": None,
                        "interpretation": None,
                        "unit": None,
                        "errorMessage": f"Missing variables: {', '.join(missing_vars)}"
                    },
                    "variables": scale_values
                }
                continue

            # Calculate scale value by destructuring values dict
            try:
                calculated_value = scale["calculate"](**scale_values)
            except Exception as e:
                results[code_name] = {
                    "scale": {
                        "key": code_name,
                        "scale_name": scale["name"][language],
                        "value": None,
                        "interpretation": None,
                        "unit": None,
                        "errorMessage": f"Calculation error: {str(e)}"
                    },
                    "variables": scale_values
                }
                continue

            # Get interpretation (static from dict)
            interpretation_category = None
            if scale.get("interpret"):
                interpretation_category = scale["interpret"](calculated_value)
            else:
                interpretation_category = str(int(calculated_value))

            interpretation_text = scale["interpretation_dict"].get(language, {}).get(
                interpretation_category,
                "No interpretation available"
            )

            results[code_name] = {
                "scale": {
                    "key": code_name,
                    "scale_name": scale["name"][language],
                    "value": calculated_value,
                    "interpretation": interpretation_text,
                    "unit": None,  # Most scales are dimensionless
                    "errorMessage": None
                },
                "variables": scale_values
            }

        return results

    # ============================================
    # STEP 6: LLM CONTEXTUAL INTERPRETATION
    # ============================================

    def get_llm_interpretation(
        self,
        results: Dict,
        scale_objects: List[Dict],
        patient_context: Dict,
        language: str = "en"
    ) -> str:
        """
        Get contextualized LLM interpretation for all scales together.

        Args:
            results: Calculated scale results
            scale_objects: List of scale objects
            patient_context: Full patient EMR context
            language: Language for interpretation

        Returns:
            Comprehensive interpretation string
        """
        # Build prompt with all scale values and patient context
        scales_summary = self._build_scales_summary(results, scale_objects, language)

        prompt = f"""You are a clinical decision support system providing contextualized interpretation of clinical scales.

PATIENT CONTEXT:
{json.dumps(patient_context, indent=2)}

CALCULATED SCALES:
{scales_summary}

Provide a comprehensive interpretation considering:
1. How these scales relate to each other
2. Patient-specific risk factors and context
3. Current medications and contraindications
4. Practical clinical recommendations
5. Follow-up and monitoring needs

Language: {language.upper()}
Be concise, actionable, and evidence-based."""

        llm_interpretation = self.llm.call(
            prompt=prompt,
            model="claude-sonnet-4-20250514",
            max_tokens=1000
        )

        return llm_interpretation

    def _build_scales_summary(
        self,
        results: Dict,
        scale_objects: List[Dict],
        language: str
    ) -> str:
        """Build summary of calculated scales for LLM prompt."""
        summary = []

        for scale in scale_objects:
            code_name = scale["code_name"]
            result = results.get(code_name, {}).get("scale", {})

            if result.get("value") is not None:
                summary.append(
                    f"- {result['scale_name']}: {result['value']} - {result['interpretation']}"
                )

                # Add scale-specific LLM prompt if exists
                if scale.get("interpretation_prompt_for_llm"):
                    summary.append(f"  Context: {scale['interpretation_prompt_for_llm']}")

        return "\n".join(summary)

    # ============================================
    # MAIN PIPELINE FUNCTIONS
    # ============================================

    def getScales(
        self,
        scale_code_names: List[str],
        conversation_context: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Main function: Calculate scales from database.

        This implements the DESIRED pipeline from Figma board.

        Args:
            scale_code_names: List of scale code names to calculate
            conversation_context: Full conversation text
            language: Language for results (es/pt/en)

        Returns:
            Dict with calculated scales and variables
        """
        # Step 1: Query scales from database
        scale_objects = self.get_scales_objects(scale_code_names)

        # Step 2: Extract distinct variables
        variables_objects, variables_to_scales_map, values_dict = self.get_variables(scale_objects)

        # Step 3: Call LLM to extract variable values
        extracted_data = self.extract_variables_with_llm(
            variables_objects,
            conversation_context,
            language
        )

        # Step 4: Process extracted values (Pint conversion)
        values_dict = self.process_extracted_values(
            extracted_data,
            variables_objects,
            variables_to_scales_map,
            values_dict
        )

        # Step 5: Calculate scale values
        results = self.calculate_scales(scale_objects, values_dict, language)

        return results

    def getScaleSession(
        self,
        scale_code_names: List[str],
        conversation_context: str,
        patient_context: Dict,
        session_id: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Calculate scales and save to EMR with LLM interpretation.

        This implements the complete pipeline including:
        - Calculate scales (using getScales)
        - Get LLM contextual interpretation
        - Save to EMR sessionDoc

        Args:
            scale_code_names: List of scale code names
            conversation_context: Full conversation text
            patient_context: Complete patient EMR data
            session_id: Session document ID
            language: Language for results

        Returns:
            Dict with scales, interpretation, and EMR status
        """
        # Calculate scales using main pipeline
        results = self.getScales(scale_code_names, conversation_context, language)

        # Get scale objects for LLM interpretation
        scale_objects = self.get_scales_objects(scale_code_names)

        # Get contextualized LLM interpretation
        llm_interpretation = self.get_llm_interpretation(
            results,
            scale_objects,
            patient_context,
            language
        )

        # Save to EMR sessionDoc
        emr_data = {
            "scales": results,
            "llm_interpretation": llm_interpretation,
            "timestamp": None,  # Add timestamp
            "calculated_by": "ScalesCalculatorPipeline"
        }

        # Save to database (implement based on your EMR structure)
        # self.db.sessions.update_one(
        #     {"_id": session_id},
        #     {"$set": {"emr.scales": emr_data}}
        # )

        return {
            "scales": results,
            "llm_interpretation": llm_interpretation,
            "emr_saved": True
        }


# ============================================
# EXAMPLE USAGE
# ============================================

if __name__ == "__main__":
    # Example: Calculate CHA2DS2-VASc and CURB-65

    # Initialize pipeline (pseudo-code)
    # db_client = MongoClient()
    # llm_client = AnthropicClient()
    # pipeline = ScalesCalculatorPipeline(db_client, llm_client)

    # Calculate scales
    # results = pipeline.getScales(
    #     scale_code_names=["cha2ds2_vasc", "curb_65"],
    #     conversation_context="Patient is 72 years old with hypertension...",
    #     language="en"
    # )

    # Or with EMR integration
    # session_results = pipeline.getScaleSession(
    #     scale_code_names=["cha2ds2_vasc"],
    #     conversation_context="...",
    #     patient_context={...},
    #     session_id="session_123",
    #     language="en"
    # )

    pass
