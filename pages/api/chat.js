export default async function handler(req, res) {
  try {
    const { model, messages, max_tokens, temperature } = req.body
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return res.status(200).json(data)
    
  } catch (error) {
    console.error('API route error:', error)
    return res.status(500).json({
      error: error.message || 'Internal Server Error'
    })
  }
}
