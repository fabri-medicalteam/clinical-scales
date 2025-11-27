export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  // Check if webhook URL exists
  if (!webhookUrl) {
    console.error('SLACK_WEBHOOK_URL not configured');
    return res.status(500).json({ error: 'Slack webhook not configured' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();
    
    if (response.ok && text === 'ok') {
      return res.status(200).json({ success: true });
    } else {
      console.error('Slack error:', response.status, text);
      return res.status(400).json({ error: text || 'Slack error' });
    }
  } catch (error) {
    console.error('Slack fetch error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
