// API route to securely expose environment variables to the client
// This file will be deployed to Vercel as a serverless function

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return the environment variables
  // Only expose specific variables that are needed by the client
  res.status(200).json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
  });
}
