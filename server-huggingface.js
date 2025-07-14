const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Hugging Face API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!process.env.HUGGINGFACE_API_KEY) {
      return res.status(500).json({ 
        error: 'Hugging Face API key not configured' 
      });
    }

    // Get the last user message
    const userMessage = messages[messages.length - 1]?.content || '';
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        inputs: userMessage,
        parameters: {
          max_length: 500,
          temperature: 0.7,
          do_sample: true
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Hugging Face API error');
    }

    const botReply = data[0]?.generated_text || "I'm pondering that... 🧘‍♀️";
    res.json({ message: botReply });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SoulSync server running on port ${PORT}`);
});
