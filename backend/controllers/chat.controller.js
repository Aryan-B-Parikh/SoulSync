/**
 * Chat Controller
 * Handles chat creation, listing, and messaging
 */

const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const { generateAIResponse } = require('../services/chat.service');

/**
 * Get all chats for current user
 */
async function getUserChats(req, res, next) {
  try {
    const chats = await Chat.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({ chats });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new chat
 */
async function createChat(req, res, next) {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      userId: req.user.userId,
      title: title || 'New Conversation',
    });

    res.status(201).json({ chat });
  } catch (error) {
    next(error);
  }
}

/**
 * Get chat by ID with messages
 */
async function getChatById(req, res, next) {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user.userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ chat, messages });
  } catch (error) {
    next(error);
  }
}

/**
 * Send message to chat
 */
async function sendMessage(req, res, next) {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    // Verify chat ownership
    const chat = await Chat.findOne({ _id: chatId, userId: req.user.userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Save user message
    const userMessage = await Message.create({
      chatId,
      role: 'user',
      content,
    });

    // Get chat history
    const history = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(20)
      .select('role content -_id');

    // Generate AI response
    const aiContent = await generateAIResponse(history);

    // Save assistant message
    const assistantMessage = await Message.create({
      chatId,
      role: 'assistant',
      content: aiContent,
    });

    // Auto-title chat if it's the first message
    if (chat.title === 'New Conversation') {
      chat.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      await chat.save();
    } else {
      // Update chat timestamp
      chat.updatedAt = new Date();
      await chat.save();
    }

    res.json({
      userMessage,
      assistantMessage,
      chat,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update chat title
 */
async function updateChat(req, res, next) {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user.userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.title = title;
    await chat.save();

    res.json({ chat });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a chat
 */
async function deleteChat(req, res, next) {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId: req.user.userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Delete all messages
    await Message.deleteMany({ chatId });

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserChats,
  createChat,
  getChatById,
  sendMessage,
  updateChat,
  deleteChat,
};
