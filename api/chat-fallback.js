export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Simple responses for testing
    const responses = [
      "Hello there! I'm SoulSync, your AI companion. How can I help you today? 🤖✨",
      "I'm here to listen and understand. What's on your mind? 💭",
      "Thank you for sharing that with me. I find your thoughts quite intriguing. 🌟",
      "I appreciate our conversation. Is there anything else you'd like to explore? 🔮",
      "Your perspective is fascinating. Tell me more about what matters to you. 💫"
    ];

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Simple response logic
    let botReply;
    if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
      botReply = responses[0];
    } else if (lastMessage.toLowerCase().includes('how are you')) {
      botReply = "I'm doing wonderfully, thank you for asking! I'm here and ready to connect with you. How are you feeling today? 💙";
    } else {
      // Random response for other messages
      botReply = responses[Math.floor(Math.random() * responses.length)];
    }

    res.json({ message: botReply });
    
  } catch (error) {
    console.error('Chat fallback API error:', error);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.' 
    });
  }
}
