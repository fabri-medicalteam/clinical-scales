export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: 'Slack error' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
