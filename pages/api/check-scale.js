import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { scaleName } = req.body;

    if (!scaleName) {
      return res.status(400).json({ error: 'scaleName is required' });
    }

    // Sanitize scale name
    const sanitizedFileName = scaleName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const filePath = path.join(process.cwd(), 'scales', `${sanitizedFileName}.py`);

    // Check if file exists
    const exists = fs.existsSync(filePath);

    return res.status(200).json({
      exists,
      fileName: `${sanitizedFileName}.py`,
      filePath: exists ? `scales/${sanitizedFileName}.py` : null
    });
  } catch (error) {
    console.error('Error checking scale:', error);
    return res.status(500).json({ error: 'Failed to check scale: ' + error.message });
  }
}
