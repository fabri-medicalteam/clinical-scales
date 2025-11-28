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
    const filePath = `scales/${sanitizedFileName}.py`;

    // Check if running in production (Vercel) or development (local)
    const isProduction = process.env.VERCEL === '1';

    if (isProduction) {
      // Use GitHub API to check file in production
      const githubToken = process.env.GITHUB_TOKEN;
      const githubOwner = process.env.GITHUB_OWNER || 'fabri-medicalteam';
      const githubRepo = process.env.GITHUB_REPO || 'clinical-scales';

      if (!githubToken) {
        // If no token, assume file doesn't exist (fail gracefully)
        return res.status(200).json({
          exists: false,
          fileName: `${sanitizedFileName}.py`,
          filePath: null,
          isProduction: true
        });
      }

      try {
        const response = await fetch(
          `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        const exists = response.ok;

        return res.status(200).json({
          exists,
          fileName: `${sanitizedFileName}.py`,
          filePath: exists ? filePath : null,
          isProduction: true
        });
      } catch (error) {
        // If error, assume doesn't exist
        return res.status(200).json({
          exists: false,
          fileName: `${sanitizedFileName}.py`,
          filePath: null,
          isProduction: true
        });
      }

    } else {
      // Local development: check filesystem
      const fullPath = path.join(process.cwd(), filePath);
      const exists = fs.existsSync(fullPath);

      return res.status(200).json({
        exists,
        fileName: `${sanitizedFileName}.py`,
        filePath: exists ? filePath : null,
        isProduction: false
      });
    }

  } catch (error) {
    console.error('Error checking scale:', error);
    return res.status(500).json({ error: 'Failed to check scale: ' + error.message });
  }
}
