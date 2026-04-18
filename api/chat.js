export const config = {
  runtime: 'edge',
};

const GROK_VOICES = ['eve', 'ara', 'rex', 'sal', 'leo'];

const OPENAI_TO_GROK_MODEL = {
  'gpt-4.1': 'grok-4-fast-non-reasoning',
  'gpt-4.1-mini': 'grok-4-fast-non-reasoning',
};

export default async function handler(req) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      provider = 'openai',
      model,
      messages,
      max_tokens,
      temperature,
      voice,
      input,
      response_format,
      instructions,
      language,
    } = await req.json();

    const useGrok = provider === 'grok';
    const apiKey = useGrok ? process.env.GROK_API_KEY : process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `${useGrok ? 'GROK_API_KEY' : 'OPENAI_API_KEY'} not configured` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isTTS = !!input;

    let url;
    let requestBody;
    if (useGrok) {
      if (isTTS) {
        url = 'https://api.x.ai/v1/tts';
        requestBody = {
          text: input,
          voice_id: GROK_VOICES.includes(voice) ? voice : 'eve',
          language: language || 'auto',
          output_format: { codec: 'mp3' },
        };
      } else {
        url = 'https://api.x.ai/v1/chat/completions';
        requestBody = {
          model: OPENAI_TO_GROK_MODEL[model] || model || 'grok-4-fast-non-reasoning',
          messages,
          max_tokens,
          temperature,
        };
      }
    } else {
      if (isTTS) {
        url = 'https://api.openai.com/v1/audio/speech';
        requestBody = {
          model,
          voice,
          input,
          response_format,
          ...(instructions ? { instructions } : {}),
        };
      } else {
        url = 'https://api.openai.com/v1/chat/completions';
        requestBody = { model, messages, max_tokens, temperature };
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (isTTS) {
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
