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
  
  // For security, we don't return any API key information to the client
  // All OpenAI API calls will be made server-side
  res.status(200).json({
    apiKeyConfigured: !!apiKey
  });
}
