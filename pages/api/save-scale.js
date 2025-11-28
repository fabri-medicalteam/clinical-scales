import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName, content } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({ error: 'fileName and content are required' });
    }

    // Sanitize filename
    const sanitizedFileName = fileName.replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    const filePath = path.join(process.cwd(), 'scales', `${sanitizedFileName}.py`);

    // Save file to repository
    fs.writeFileSync(filePath, content, 'utf8');

    return res.status(200).json({
      success: true,
      message: 'Scale saved successfully',
      filePath: `scales/${sanitizedFileName}.py`
    });
  } catch (error) {
    console.error('Error saving scale:', error);
    return res.status(500).json({ error: 'Failed to save scale: ' + error.message });
  }
}
