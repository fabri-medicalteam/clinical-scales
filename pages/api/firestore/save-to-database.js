/**
 * API ENDPOINT: Save scale to Firestore database
 *
 * POST /api/firestore/save-to-database
 *
 * Body: {
 *   scaleData: { name, description, variables, formula, ... },
 *   variables: [{ name, description, type, ... }]
 * }
 */

import { FirestoreHelpers } from '../../../database/firestore';
import { generateDatabasePackage } from '../../../utils/generate_database_format';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scaleData, variables, calculateFunction } = req.body;

    if (!scaleData || !variables) {
      return res.status(400).json({
        error: 'scaleData and variables are required'
      });
    }

    // Generate database-compatible format
    const dbPackage = generateDatabasePackage(
      scaleData,
      variables,
      scaleData.formula || 'SUM_OF_POINTS',
      'en'
    );

    // Override get_value_function if provided
    if (calculateFunction) {
      dbPackage.scale.get_value_function = calculateFunction;
    }

    // Save Scale to Firestore
    const scaleResult = await FirestoreHelpers.upsertScale(dbPackage.scale);

    // Save Variables to Firestore
    const variableResults = [];
    for (const variable of dbPackage.variables) {
      const varResult = await FirestoreHelpers.upsertVariable(variable);
      variableResults.push(varResult);
    }

    return res.status(200).json({
      success: true,
      message: scaleResult.created ? 'Scale created in database' : 'Scale updated in database',
      scale: {
        id: scaleResult.id,
        code_name: dbPackage.scale.code_name,
        created: scaleResult.created,
        updated: scaleResult.updated
      },
      variables: variableResults.map(v => ({
        id: v.id,
        name: v.name,
        created: v.created,
        updated: v.updated
      })),
      metadata: dbPackage.metadata
    });

  } catch (error) {
    console.error('Error saving to Firestore:', error);
    return res.status(500).json({
      error: 'Failed to save to database: ' + error.message,
      details: error.stack
    });
  }
}
