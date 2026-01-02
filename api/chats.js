/**
 * Chats API Serverless Function
 * Handles chat management endpoints for Vercel deployment
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB connection cache
let cachedDb = null;

// Chat Schema
const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Conversation' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Message Schema
const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedDb = db;
  return db;
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error('No authorization header');

  const token = authHeader.split(' ')[1];
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();
    const decoded = verifyToken(req);
    const path = req.url.split('?')[0];

    // Get all chats
    if (path === '/api/chats' && req.method === 'GET') {
      const chats = await Chat.find({ userId: decoded.userId }).sort({ updatedAt: -1 });
      return res.json({ chats });
    }

    // Create new chat
    if (path === '/api/chats' && req.method === 'POST') {
      const { title } = req.body;
      const chat = await Chat.create({
        userId: decoded.userId,
        title: title || 'New Conversation',
      });
      return res.status(201).json({ chat });
    }

    // Get chat messages
    if (path.match(/^\/api\/chats\/[^\/]+$/) && req.method === 'GET') {
      const chatId = path.split('/').pop();
      const chat = await Chat.findOne({ _id: chatId, userId: decoded.userId });
      
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
      return res.json({ chat, messages });
    }

    // Update chat
    if (path.match(/^\/api\/chats\/[^\/]+$/) && req.method === 'PATCH') {
      const chatId = path.split('/').pop();
      const { title } = req.body;

      const chat = await Chat.findOne({ _id: chatId, userId: decoded.userId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      chat.title = title;
      chat.updatedAt = new Date();
      await chat.save();

      return res.json({ chat });
    }

    // Delete chat
    if (path.match(/^\/api\/chats\/[^\/]+$/) && req.method === 'DELETE') {
      const chatId = path.split('/').pop();
      
      const chat = await Chat.findOne({ _id: chatId, userId: decoded.userId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      await Message.deleteMany({ chatId });
      await Chat.deleteOne({ _id: chatId });

      return res.json({ message: 'Chat deleted successfully' });
    }

    // Send message
    if (path.match(/^\/api\/chats\/[^\/]+\/messages$/) && req.method === 'POST') {
      const chatId = path.split('/')[3];
      const { content } = req.body;

      const chat = await Chat.findOne({ _id: chatId, userId: decoded.userId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Save user message
      await Message.create({ chatId, role: 'user', content });

      // Get conversation history
      const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Call Groq API
      const fetch = globalThis.fetch || require('node-fetch');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and caring. Respond with empathy, depth, and poetic insight. Keep responses thoughtful but concise.",
            },
            ...conversationHistory,
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const aiMessage = data.choices[0].message.content;

      // Save AI response
      await Message.create({ chatId, role: 'assistant', content: aiMessage });

      // Auto-generate title if this is the first exchange
      if (messages.length === 0) {
        const titlePrompt = `Generate a short, poetic 3-5 word title for a conversation that starts with: "${content}". Return only the title, nothing else.`;
        
        const titleResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: titlePrompt }],
            max_tokens: 20,
            temperature: 0.8,
          }),
        });

        const titleData = await titleResponse.json();
        const title = titleData.choices[0].message.content.trim().replace(/['"]/g, '');
        
        chat.title = title;
        chat.updatedAt = new Date();
        await chat.save();
      }

      return res.json({ message: aiMessage, chat });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Chats API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
