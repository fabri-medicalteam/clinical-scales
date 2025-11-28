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
    const filePath = `scales/${sanitizedFileName}.py`;

    // Check if running in production (Vercel) or development (local)
    const isProduction = process.env.VERCEL === '1';

    if (isProduction) {
      // Use GitHub API to save file in production
      const githubToken = process.env.GITHUB_TOKEN;
      const githubOwner = process.env.GITHUB_OWNER || 'fabri-medicalteam';
      const githubRepo = process.env.GITHUB_REPO || 'clinical-scales';

      if (!githubToken) {
        return res.status(500).json({
          error: 'GitHub token not configured. Please set GITHUB_TOKEN environment variable in Vercel.',
          isProduction: true
        });
      }

      // Encode content to base64
      const contentBase64 = Buffer.from(content).toString('base64');

      // Check if file exists to get SHA (required for updates)
      let sha = null;
      try {
        const checkResponse = await fetch(
          `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`,
          {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );
        if (checkResponse.ok) {
          const data = await checkResponse.json();
          sha = data.sha;
        }
      } catch (err) {
        // File doesn't exist, that's ok
      }

      // Create or update file via GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Add/Update scale: ${sanitizedFileName}.py`,
            content: contentBase64,
            sha: sha, // Include SHA if updating existing file
            branch: 'main'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();

      return res.status(200).json({
        success: true,
        message: 'Scale saved successfully via GitHub API',
        filePath: filePath,
        htmlUrl: data.content.html_url,
        isProduction: true
      });

    } else {
      // Local development: save to filesystem
      const fullPath = path.join(process.cwd(), filePath);

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(fullPath, content, 'utf8');

      return res.status(200).json({
        success: true,
        message: 'Scale saved successfully to local filesystem',
        filePath: filePath,
        isProduction: false
      });
    }

  } catch (error) {
    console.error('Error saving scale:', error);
    return res.status(500).json({
      error: 'Failed to save scale: ' + error.message,
      details: error.stack
    });
  }
}
