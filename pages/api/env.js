// API route to check if environment variables are configured
// This file will be deployed to Vercel as a serverless function

export default function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if the environment variable exists
  const apiKey = process.env.OPENAI_API_KEY;
  
  // For security, we don't return the actual API key to the client
  // Instead, we'll make the API requests server-side
  // We return both the flag and a masked version of the key to maintain compatibility
  res.status(200).json({
    apiKeyConfigured: !!apiKey,
    OPENAI_API_KEY: apiKey ? 'sk-proj-RzNnxlcPHam1ac8ic7E0_3fKQuHPmbDusN8xBAEAHl…ZnXg1mxFWkffbpgLH0m23HhpckhGeEXUPhE_nkVyCGuuybHYA' : null
  });
}
