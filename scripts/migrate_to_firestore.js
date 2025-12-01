/**
 * MIGRATION SCRIPT: Python files → Firestore
 *
 * Reads all .py files from scales/ directory and migrates them to Firestore
 * Creates both Scale and Variable entities
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { FirestoreHelpers } = require('../database/firestore');
const { generateDatabasePackage } = require('../utils/generate_database_format');

/**
 * Parse SCALE_DATA dict from Python file
 */
function parseScaleDataFromPython(pythonContent) {
  try {
    // Extract SCALE_DATA dict
    const scaleDataMatch = pythonContent.match(/SCALE_DATA\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);

    if (!scaleDataMatch) {
      console.error('Could not find SCALE_DATA in file');
      return null;
    }

    const scaleDataStr = '{' + scaleDataMatch[1] + '}';

    // Parse fields manually (since it's Python syntax, not valid JSON)
    const data = {
      scale_name: extractField(scaleDataStr, 'name'),
      description: extractField(scaleDataStr, 'description'),
      variables: extractVariablesDict(scaleDataStr),
      formula: extractField(scaleDataStr, 'formula'),
      interpretation: extractField(scaleDataStr, 'interpretation'),
      recommendation: extractField(scaleDataStr, 'recommendation'),
      suggested_triggers: extractArray(scaleDataStr, 'suggested_triggers')
    };

    return data;
  } catch (error) {
    console.error('Error parsing Python file:', error);
    return null;
  }
}

/**
 * Extract field value from Python dict string
 */
function extractField(pythonStr, fieldName) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"""([^"]*(?:"{1,2}[^"]+)*?)"""`, 's');
  const match = pythonStr.match(regex);

  if (match) {
    return match[1].trim();
  }

  // Try single-quoted string
  const regex2 = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 's');
  const match2 = pythonStr.match(regex2);

  if (match2) {
    return match2[1].trim();
  }

  return null;
}

/**
 * Extract variables dict from SCALE_DATA
 */
function extractVariablesDict(pythonStr) {
  const regex = /"variables"\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s;
  const match = pythonStr.match(regex);

  if (!match) {
    return [];
  }

  const varsStr = match[1];
  const variables = [];

  // Extract each variable: "var_name": "description"
  const varMatches = varsStr.matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g);

  for (const varMatch of varMatches) {
    const [, name, description] = varMatch;
    variables.push({
      name: name.trim(),
      description: description.trim(),
      type: 'numerical' // Default, will be refined
    });
  }

  return variables;
}

/**
 * Extract array from Python dict
 */
function extractArray(pythonStr, fieldName) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([^\\]]+)\\]`, 's');
  const match = pythonStr.match(regex);

  if (!match) {
    return [];
  }

  const arrayStr = match[1];
  const items = arrayStr.split(',').map(item => {
    return item.trim().replace(/^["']|["']$/g, '');
  }).filter(Boolean);

  return items;
}

/**
 * Extract calculate function from Python file
 */
function extractCalculateFunction(pythonContent) {
  const regex = /def calculate\([^)]*\):[\s\S]*?(?=\n(?:def |class |#|$))/;
  const match = pythonContent.match(regex);

  if (match) {
    return match[0].trim();
  }

  return null;
}

/**
 * Main migration function
 */
async function migrateToFirestore() {
  console.log('🔥 Starting migration to Firestore...\n');

  const scalesDir = path.join(__dirname, '../scales');

  // Check if scales directory exists
  if (!fs.existsSync(scalesDir)) {
    console.error('❌ scales/ directory not found');
    return;
  }

  // Get all .py files
  const files = fs.readdirSync(scalesDir).filter(f => f.endsWith('.py'));

  console.log(`📁 Found ${files.length} Python files to migrate\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    console.log(`📝 Processing: ${file}`);

    try {
      const filePath = path.join(scalesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Parse SCALE_DATA from file
      const scaleData = parseScaleDataFromPython(content);

      if (!scaleData) {
        console.error(`   ❌ Could not parse SCALE_DATA from ${file}`);
        errorCount++;
        continue;
      }

      // Extract calculate function
      const calculateFunction = extractCalculateFunction(content);

      // Generate database format
      const dbPackage = generateDatabasePackage(
        scaleData,
        scaleData.variables,
        scaleData.formula || 'SUM_OF_POINTS'
      );

      // Override get_value_function with actual extracted function
      if (calculateFunction) {
        dbPackage.scale.get_value_function = calculateFunction;
      }

      // Save Scale to Firestore
      const scaleResult = await FirestoreHelpers.upsertScale(dbPackage.scale);
      console.log(`   ✅ Scale saved: ${dbPackage.scale.code_name} (${scaleResult.created ? 'created' : 'updated'})`);

      // Save Variables to Firestore
      for (const variable of dbPackage.variables) {
        const varResult = await FirestoreHelpers.upsertVariable(variable);
        console.log(`      └─ Variable: ${variable.name} (${varResult.created ? 'created' : 'updated'})`);
      }

      successCount++;
      console.log('');

    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
      errorCount++;
      console.log('');
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${files.length}`);
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');

  try {
    const { scales, lastDoc } = await FirestoreHelpers.getAllScales(100);
    console.log(`✅ Found ${scales.length} scales in Firestore`);

    // Display first 5
    console.log('\n📋 Sample scales:');
    scales.slice(0, 5).forEach((scale, i) => {
      console.log(`   ${i + 1}. ${scale.code_name} - ${scale.name?.en || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
  }
}

/**
 * Interactive migration
 */
async function runMigration() {
  try {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  CLINICAL SCALES - FIRESTORE MIGRATION              ║
║  Migrates .py files to Firestore database           ║
╚══════════════════════════════════════════════════════╝
`);

    // Step 1: Migrate
    await migrateToFirestore();

    // Step 2: Verify
    await verifyMigration();

    console.log('\n✅ Migration complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateToFirestore,
  verifyMigration,
  parseScaleDataFromPython
};
