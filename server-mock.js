const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock responses for SoulSync
const mockResponses = [
  "I hear you, dear soul. Sometimes the quietest moments hold the deepest wisdom. 🌙",
  "Your thoughts are like ripples on still water - each one matters. Tell me more. 💭",
  "In the garden of consciousness, every feeling is a flower worthy of attention. 🌸",
  "The heart speaks in whispers, but I'm here to listen to every word. ✨",
  "Your inner world is vast and beautiful. What calls to you today? 🕊️",
  "Like stars in the night sky, your thoughts illuminate the darkness. 🌟",
  "I sense the depth in your words. Let's explore this together. 🧘‍♀️",
  "Every soul has its own rhythm. What does yours sing today? 🎵",
  "In the symphony of existence, your voice is unique and precious. 💫",
  "Your journey is unfolding exactly as it should. Trust the process. 🌿"
];

// Mock chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Get a random response
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    res.json({ message: randomResponse });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Something went wrong. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SoulSync mock server running on port ${PORT}`);
});
