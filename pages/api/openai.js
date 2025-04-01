// pages/api/openai.js
// API route to proxy requests to OpenAI API
import { Writable } from 'stream'; // Import Writable for piping

export default async function handler(req, res) {
  console.log(`[Proxy] Received request: ${req.method} ${req.url}`); // Log incoming request

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

  console.log(`[Proxy] Action: ${action}`); // Log the action
  // console.log(`[Proxy] Request Body:`, body); // Avoid logging potentially large/sensitive body unless necessary

  let targetUrl = '';
  let requestOptions = {};

  try {
    console.log(`[Proxy] API Key Present: ${!!apiKey}`); // Confirm API key exists

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
        console.log(`[Proxy] Preparing chat request to ${targetUrl}`);
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
        console.log(`[Proxy] Preparing speech request to ${targetUrl}`);
        break;
      default:
        console.error(`[Proxy] Invalid action: ${action}`);
        return res.status(400).json({ error: 'Invalid action specified.' });
    }

    console.log(`[Proxy] Fetching from OpenAI: ${targetUrl}`);
    const openaiResponse = await fetch(targetUrl, requestOptions);
    console.log(`[Proxy] OpenAI Response Status: ${openaiResponse.status}`); // Log OpenAI status

    // Check if the response is OK
    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text(); // Read error body as text
      console.error(`[Proxy] OpenAI API Error (${openaiResponse.status}): ${errorBody}`); // Log the error details
      // Forward OpenAI's error status and message
      return res.status(openaiResponse.status).json({
        error: `OpenAI API Error: ${openaiResponse.statusText}`,
        details: errorBody
      });
    }

    // Handle different response types
    if (action === 'speech') {
      console.log(`[Proxy] Streaming audio response back to client.`);
      // Stream the audio data back
      res.setHeader('Content-Type', 'audio/mpeg');
      // Ensure openaiResponse.body is correctly piped
      if (openaiResponse.body instanceof ReadableStream) {
        // For environments using Web Streams (like newer Node versions or Edge Runtime)
        const reader = openaiResponse.body.getReader();
        const nodeStream = new Writable({
          write(chunk, encoding, callback) {
            res.write(chunk, encoding, callback);
          },
          final(callback) {
            res.end(callback);
          }
        });
        
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              nodeStream.end();
              return;
            }
            // Write the chunk to the response stream
            const canContinue = nodeStream.write(value);
            if (canContinue) {
              pump();
            } else {
              // Handle backpressure
              nodeStream.once('drain', pump);
            }
          }).catch(err => {
            console.error('[Proxy] Error reading stream from OpenAI:', err);
            nodeStream.destroy(err); // Use destroy instead of end on error
          });
        }
        pump();

      } else if (openaiResponse.body && typeof openaiResponse.body.pipe === 'function') {
         // For environments using Node.js streams
         openaiResponse.body.pipe(res);
      } else {
         console.error('[Proxy] Cannot pipe response body of type:', typeof openaiResponse.body);
         res.status(500).json({ error: 'Failed to stream audio response.' });
      }
      // Don't call res.end() here, piping handles it.
    } else {
      // Forward the JSON response for chat
      const data = await openaiResponse.json();
      console.log(`[Proxy] Forwarding JSON response back to client.`);
      res.status(200).json(data);
    }

  } catch (error) {
    console.error("[Proxy] Internal Server Error:", error); // Log the full error
    res.status(500).json({ error: 'Internal Server Error proxying to OpenAI.', details: error.message });
  }
}
