export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test basic functionality
    const response = {
      status: 'API is working!',
      method: req.method,
      timestamp: new Date().toISOString(),
      hasGroqKey: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'unknown',
      // Don't expose the actual key, just check if it exists
      keyLength: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({ 
      error: 'Test API failed',
      message: error.message 
    });
  }
}
