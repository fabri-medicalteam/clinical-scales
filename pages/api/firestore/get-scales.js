/**
 * API ENDPOINT: Get scales from Firestore
 *
 * GET /api/firestore/get-scales?code_names=cha2ds2_vasc,curb_65
 * or
 * POST /api/firestore/get-scales
 * Body: { code_names: ["cha2ds2_vasc", "curb_65"] }
 */

import { FirestoreHelpers } from '../../../database/firestore';

export default async function handler(req, res) {
  try {
    let code_names = [];

    if (req.method === 'GET') {
      // Parse query parameter
      const queryParam = req.query.code_names;
      if (queryParam) {
        code_names = queryParam.split(',').map(s => s.trim());
      }
    } else if (req.method === 'POST') {
      // Parse body
      code_names = req.body.code_names || [];
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!code_names || code_names.length === 0) {
      return res.status(400).json({
        error: 'code_names parameter is required'
      });
    }

    // Get scales from Firestore
    const scales = await FirestoreHelpers.getScales(code_names);

    // Get all unique variable names from scales
    const variableNames = new Set();
    scales.forEach(scale => {
      if (scale.variables && Array.isArray(scale.variables)) {
        scale.variables.forEach(v => variableNames.add(v));
      }
    });

    // Get variables from Firestore
    const variables = await FirestoreHelpers.getVariables([...variableNames]);

    // Build variables map for quick lookup
    const variablesMap = {};
    variables.forEach(v => {
      variablesMap[v.name] = v;
    });

    return res.status(200).json({
      success: true,
      scales: scales,
      variables: variablesMap,
      metadata: {
        scales_count: scales.length,
        variables_count: variables.length,
        requested: code_names.length,
        found: scales.length
      }
    });

  } catch (error) {
    console.error('Error fetching scales:', error);
    return res.status(500).json({
      error: 'Failed to fetch scales: ' + error.message
    });
  }
}
