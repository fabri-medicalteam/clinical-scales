# 🎯 FIGMA BOARD IMPLEMENTATION GUIDE

Complete guide for implementing the "How to make a scales agent" from Figma board.

## 📋 Current Status vs Desired State

### ✅ Already Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| Scale extraction via LLM | ✅ Done | Claude API with strict rules |
| Python file generation | ✅ Done | SCALE_DATA dict format |
| Suggested triggers | ✅ Done | Automatic extraction |
| GitHub API save | ✅ Done | Production-ready |
| Duplicate checking | ✅ Done | Prevents re-creation |
| Structured output extraction | ✅ Done | Variables with descriptions |
| Interpretation stratification | ✅ Done | Risk-based when available |

### ❌ Missing (From Figma Board)

| Feature | Priority | Effort |
|---------|----------|--------|
| Database (MongoDB/Firestore) | 🔴 Critical | High |
| Separate Scale & Variable entities | 🔴 Critical | Medium |
| Multilingual support (ES/PT/EN) | 🟡 High | Medium |
| Functions as strings (exec() runtime) | 🔴 Critical | Low |
| Pint library for units | 🔴 Critical | Medium |
| getScales pipeline | 🔴 Critical | High |
| getScaleSession pipeline | 🔴 Critical | High |
| LLM contextual interpretation | 🟡 High | Medium |
| Structured output for variables | 🟡 High | Medium |
| Automatic scale agent | 🟢 Nice-to-have | Very High |

---

## 🗂️ Database Schema

### Scales Collection

```javascript
{
  code_name: "cha2ds2_vasc",  // Unique key
  name: {
    es: "Puntuación CHA₂DS₂-VASc",
    pt: "Escore CHA₂DS₂-VASc",
    en: "CHA₂DS₂-VASc Score"
  },
  variables: ["chf", "hypertension", "age_category", "diabetes", "stroke_history"],
  get_value_function: "def calculate(chf, hypertension, ...):\n    return sum(...)",
  interpretation_function: "def interpret(value):\n    if value < 2: ...",
  interpretation_dict: {
    es: {"0": "Bajo riesgo", "1": "Riesgo moderado"},
    pt: {"0": "Baixo risco", "1": "Risco moderado"},
    en: {"0": "Low risk", "1": "Moderate risk"}
  },
  interpretation_prompt_for_llm: "Interpret CHA2DS2-VASc considering...",
  description: "Stroke risk in atrial fibrillation",
  category: ["cardiology", "stroke_risk"]
}
```

### Variables Collection

```javascript
// Categorical variable
{
  name: "age_category",
  medical_name: {
    es: "Categoría de edad",
    pt: "Categoria de idade",
    en: "Age category"
  },
  description: "Extract patient age category: 0 for <65, 1 for 65-74, 2 for ≥75",
  type: "categorical",
  possible_values: ["0", "1", "2"]
}

// Numerical variable
{
  name: "weight",
  medical_name: {
    es: "Peso",
    pt: "Peso",
    en: "Weight"
  },
  description: "Extract patient body weight. Default unit: kg",
  type: "numerical",
  standardized_unit_of_measurement: "kg",
  possible_units: ["kg", "lb", "g"],
  min_value: 0.5,
  max_value: 500
}
```

---

## 🔄 Pipeline Architecture

### Current Pipeline (File-Based)

```
User Input → Claude Extraction → Generate Python File → Save to GitHub
```

### Desired Pipeline (Database + LLM Context)

```
getScales() Pipeline:
1. Receive: ["cha2ds2_vasc", "curb_65"]
2. Query scales from database
3. Extract distinct variables needed
4. Query variables from database
5. Call LLM with structured output → extract variable values
6. Convert units with Pint library
7. Calculate scales (exec() functions)
8. Return results

getScaleSession() Pipeline:
1-7. Same as getScales()
8. Call LLM for contextual interpretation
9. Save to EMR sessionDoc
10. Return results + interpretation
```

---

## 📁 File Structure

```
clinical-scales/
├── database/
│   ├── schemas.js                 ✅ Created (MongoDB/Firestore schemas)
│   ├── seed_data.js               ❌ TODO (Initial data)
│   └── migrations/                ❌ TODO
│
├── backend/
│   ├── get_scales_pipeline.py     ✅ Created (Main pipeline)
│   ├── llm_client.py              ❌ TODO (LLM wrapper)
│   └── database_client.py         ❌ TODO (DB wrapper)
│
├── utils/
│   ├── generate_database_format.js ✅ Created (Convert to DB schema)
│   └── pint_helpers.py            ❌ TODO (Unit conversions)
│
├── pages/
│   ├── index.js                   ✅ Updated (Current UI)
│   └── api/
│       ├── save-scale.js          ✅ GitHub API
│       ├── check-scale.js         ✅ Check duplicates
│       ├── get-scales.js          ❌ TODO (New endpoint)
│       └── get-scale-session.js   ❌ TODO (New endpoint)
│
└── scales/                        ✅ Python files storage
```

---

## 🚀 Implementation Roadmap

### Phase 1: Database Foundation (Week 1)

**Step 1.1: Setup Database**
- [ ] Choose MongoDB or Firestore
- [ ] Deploy database (MongoDB Atlas / Firebase)
- [ ] Configure connection strings
- [ ] Create indexes on code_name fields

**Step 1.2: Migrate Existing Scales**
```bash
# Script to convert existing .py files to database documents
node scripts/migrate_scales_to_db.js
```

**Step 1.3: Create API Endpoints**
```javascript
// /api/scales/create
POST /api/scales/create
Body: { scale: {...}, variables: [{...}] }

// /api/scales/get
GET /api/scales/:code_name

// /api/variables/create
POST /api/variables/create
Body: { variable: {...} }
```

### Phase 2: Python Backend (Week 2)

**Step 2.1: Install Dependencies**
```bash
pip install pint anthropic pymongo
```

**Step 2.2: Implement Pipeline**
- [ ] Complete `get_scales_pipeline.py`
- [ ] Add Pint unit conversions
- [ ] Test with existing scales

**Step 2.3: Create Flask/FastAPI Server**
```python
# backend/server.py
from flask import Flask, request, jsonify
from get_scales_pipeline import ScalesCalculatorPipeline

app = Flask(__name__)
pipeline = ScalesCalculatorPipeline(db_client, llm_client)

@app.route('/api/calculate-scales', methods=['POST'])
def calculate_scales():
    data = request.json
    results = pipeline.getScales(
        scale_code_names=data['scales'],
        conversation_context=data['context'],
        language=data.get('language', 'en')
    )
    return jsonify(results)
```

### Phase 3: Frontend Integration (Week 3)

**Step 3.1: Update UI**
- [ ] Add database save option
- [ ] Show multilingual names
- [ ] Add category filtering
- [ ] Preview database format

**Step 3.2: Create Admin Panel**
- [ ] View all scales in database
- [ ] Edit scale/variable entities
- [ ] Test scale calculations
- [ ] Manage categories

### Phase 4: LLM Contextual Interpretation (Week 4)

**Step 4.1: Implement Context Builder**
```python
def build_patient_context(session_id):
    """Get full patient context from EMR."""
    return {
        "demographics": {...},
        "medications": [...],
        "comorbidities": [...],
        "recent_labs": {...}
    }
```

**Step 4.2: Add Interpretation Prompts**
- [ ] Create prompt templates
- [ ] Test with sample patients
- [ ] Validate medical accuracy

### Phase 5: Automatic Scale Agent (Optional)

**Step 5.1: Web Search Integration**
- [ ] Integrate search API (Tavily, SerpAPI)
- [ ] Search for scale information
- [ ] Extract structured data

**Step 5.2: Agent Prompt Graph**
```python
# Autonomous agent that:
1. Searches web for scale information
2. Extracts all required fields
3. Generates Python functions
4. Validates with test cases
5. Saves to database
```

---

## 🧪 Testing Strategy

### Unit Tests

```python
# tests/test_pipeline.py
def test_get_scales_objects():
    """Test querying scales from database."""
    scales = pipeline.get_scales_objects(["cha2ds2_vasc"])
    assert len(scales) == 1
    assert scales[0]["code_name"] == "cha2ds2_vasc"
    assert callable(scales[0]["calculate"])

def test_pint_conversion():
    """Test unit conversion."""
    weight = ureg.Quantity(150, 'lb')
    weight_kg = weight.to('kg')
    assert 67 < weight_kg.magnitude < 69
```

### Integration Tests

```python
def test_full_pipeline():
    """Test complete getScales pipeline."""
    results = pipeline.getScales(
        scale_code_names=["cha2ds2_vasc"],
        conversation_context="Patient is 72 with hypertension and diabetes",
        language="en"
    )
    assert results["cha2ds2_vasc"]["scale"]["value"] >= 0
```

### E2E Tests

```bash
# Test via API
curl -X POST http://localhost:5000/api/calculate-scales \
  -H "Content-Type: application/json" \
  -d '{
    "scales": ["cha2ds2_vasc"],
    "context": "Patient is 72 with AFib and hypertension",
    "language": "en"
  }'
```

---

## 🔐 Security Considerations

1. **Database Access**
   - Use environment variables for credentials
   - Implement rate limiting
   - Audit logs for all changes

2. **Code Execution (exec())**
   - Sandbox Python execution
   - Validate function strings before exec()
   - Whitelist allowed functions

3. **LLM Calls**
   - Sanitize inputs
   - Validate structured outputs
   - Handle API errors gracefully

4. **PHI/HIPAA Compliance**
   - Encrypt patient data
   - Audit trail for all access
   - Anonymize logs

---

## 📊 Migration Script Example

```javascript
// scripts/migrate_scales_to_db.js
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

async function migrateScalesToDB() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('clinical_scales');

  // Read all .py files from scales/
  const scalesDir = path.join(__dirname, '../scales');
  const files = fs.readdirSync(scalesDir).filter(f => f.endsWith('.py'));

  for (const file of files) {
    const content = fs.readFileSync(path.join(scalesDir, file), 'utf8');

    // Parse SCALE_DATA dict from Python file
    const scaleData = parseScaleDataFromPython(content);

    // Convert to database format
    const dbPackage = generateDatabasePackage(
      scaleData,
      scaleData.variables,
      scaleData.formula
    );

    // Insert scale
    await db.collection('scales').insertOne(dbPackage.scale);

    // Insert variables (if not exist)
    for (const variable of dbPackage.variables) {
      await db.collection('variables').updateOne(
        { name: variable.name },
        { $setOnInsert: variable },
        { upsert: true }
      );
    }

    console.log(`Migrated: ${file}`);
  }

  await client.close();
}
```

---

## 🎓 Key Learnings from Figma Board

1. **Separation of Concerns**
   - Scales and Variables are separate entities
   - Reuse variables across multiple scales
   - Easier to maintain and update

2. **Runtime Code Execution**
   - Functions stored as strings in database
   - exec() at runtime for flexibility
   - Can update logic without code deployment

3. **Multilingual Support**
   - All user-facing text in 3 languages
   - Improves adoption in Latin America
   - Better UX for international teams

4. **Unit Handling with Pint**
   - Automatic conversions (lb→kg, cm→m)
   - Prevents calculation errors
   - Must use SI/NIST standard notation

5. **LLM Contextual Interpretation**
   - Static interpretations are limited
   - Patient context makes recommendations relevant
   - Requires careful prompt engineering

6. **Structured Output**
   - Ensures consistent LLM responses
   - Easier error handling
   - Validates data types automatically

---

## 📚 Resources

- **Pint Documentation**: https://pint.readthedocs.io/
- **MongoDB Schema Design**: https://www.mongodb.com/docs/manual/core/data-modeling-introduction/
- **Anthropic Structured Output**: https://docs.anthropic.com/claude/docs/tool-use
- **SI Units**: https://www.nist.gov/pml/owm/metric-si/si-units
- **Clinical Scales Reference**: MDCalc.com

---

## ✅ Next Steps

1. **Choose database** (MongoDB vs Firestore)
2. **Set up Python backend** (Flask/FastAPI)
3. **Migrate 1-2 scales** as proof of concept
4. **Test full pipeline** with real data
5. **Iterate based on feedback**

Want me to start implementing any of these phases? 🚀
