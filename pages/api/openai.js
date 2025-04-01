// pages/api/openai.js
// API route to proxy requests to OpenAI API

export default async function handler(req, res) {
  // Set CORS headers (adjust origin in production if needed)
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Action');

  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  // Determine the target OpenAI endpoint based on a header or body parameter
  // Using a custom header 'X-Action' for simplicity here
  const action = req.headers['x-action']; 
  const body = req.body;

  let targetUrl = '';
  let requestOptions = {};

  try {
    switch (action) {
      case 'chat':
        targetUrl = 'https://api.openai.com/v1/chat/completions';
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(body) // Forward the client's request body
        };
        break;
      case 'speech':
        targetUrl = 'https://api.openai.com/v1/audio/speech';
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            // OpenAI expects 'Accept' for audio, but we handle the blob on client
          },
          body: JSON.stringify(body) 
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid action specified.' });
    }

    const openaiResponse = await fetch(targetUrl, requestOptions);

    // Check if the response is OK
    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text(); // Read error body as text
      // Forward OpenAI's error status and message
      return res.status(openaiResponse.status).json({ 
        error: `OpenAI API Error: ${openaiResponse.statusText}`, 
        details: errorBody 
      });
    }

    // Handle different response types
    if (action === 'speech') {
      // Stream the audio data back
      res.setHeader('Content-Type', 'audio/mpeg');
      openaiResponse.body.pipe(res);
      // Don't call res.end() here, piping handles it.
    } else {
      // Forward the JSON response for chat
      const data = await openaiResponse.json();
      res.status(200).json(data);
    }

  } catch (error) {
    console.error("Error in OpenAI proxy:", error);
    res.status(500).json({ error: 'Internal Server Error proxying to OpenAI.', details: error.message });
  }
}
