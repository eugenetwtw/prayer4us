export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { model, messages, max_tokens, temperature, voice, input, response_format, instructions } = req.body;

    const isTTS = model === 'tts-1';

    const openaiBody = isTTS
      ? { model, voice, input, response_format, ...(instructions ? { instructions } : {}) }
      : { model, messages, max_tokens, temperature };

    const response = await fetch(
      `https://api.openai.com/v1/${isTTS ? 'audio/speech' : 'chat/completions'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(openaiBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(response.status).json({ error: errorText });
    }

    if (isTTS) {
      const audioBuffer = await response.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.status(200).send(Buffer.from(audioBuffer));
    } else {
      const data = await response.json();
      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('API route error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
