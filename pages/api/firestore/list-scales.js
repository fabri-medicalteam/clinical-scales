/**
 * API ENDPOINT: List all scales from Firestore
 *
 * GET /api/firestore/list-scales?limit=50&category=cardiology&search=stroke
 */

import { FirestoreHelpers } from '../../../database/firestore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      limit = 50,
      category,
      search,
      language = 'en'
    } = req.query;

    let scales = [];

    // Filter by category
    if (category) {
      scales = await FirestoreHelpers.getScalesByCategory(
        category,
        parseInt(limit)
      );
    }
    // Search by name/description
    else if (search) {
      scales = await FirestoreHelpers.searchScales(
        search,
        language,
        parseInt(limit)
      );
    }
    // Get all scales (paginated)
    else {
      const result = await FirestoreHelpers.getAllScales(parseInt(limit));
      scales = result.scales;
    }

    // Build summary with multilingual names
    const scalesSummary = scales.map(scale => ({
      id: scale.id,
      code_name: scale.code_name,
      name: scale.name?.[language] || scale.name?.en || 'N/A',
      name_multilingual: scale.name,
      description: scale.description,
      category: scale.category || [],
      variables_count: scale.variables?.length || 0,
      created_at: scale.created_at,
      updated_at: scale.updated_at
    }));

    // Get unique categories from all scales
    const allCategories = new Set();
    scales.forEach(scale => {
      if (scale.category) {
        scale.category.forEach(cat => allCategories.add(cat));
      }
    });

    return res.status(200).json({
      success: true,
      scales: scalesSummary,
      metadata: {
        count: scales.length,
        limit: parseInt(limit),
        filters: {
          category: category || null,
          search: search || null,
          language
        },
        available_categories: [...allCategories].sort()
      }
    });

  } catch (error) {
    console.error('Error listing scales:', error);
    return res.status(500).json({
      error: 'Failed to list scales: ' + error.message
    });
  }
}
