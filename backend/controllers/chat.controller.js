const prisma = require('../config/prisma');
const { generateAIResponse } = require('../services/chat.service');
const { toMongo } = require('../utils/formatter');

/**
 * Get all chats for current user
 */
async function getUserChats(req, res, next) {
  try {
    const chats = await prisma.chat.findMany({
      where: { userId: req.user.userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    res.json({ chats: toMongo(chats) });
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

    const chat = await prisma.chat.create({
      data: {
        userId: req.user.userId,
        title: title || 'New Conversation',
      },
    });

    res.status(201).json({ chat: toMongo(chat) });
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

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }, // Oldest first
      take: 100,
    });

    res.json({ chat: toMongo(chat), messages: toMongo(messages) });
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
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content,
      },
    });

    // Get chat history for context
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: 20, // Reduced from 'all' for context window
      select: {
        role: true,
        content: true,
      },
    });

    // Generate AI response
    // Note: AI Service expects [{role, content}, ...], Prisma returns exactly that.
    const aiContent = await generateAIResponse(history);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        content: aiContent,
      },
    });

    // Auto-title chat if it's the first message
    // Prisma check: if title is default?
    let updatedChat = chat;
    if (chat.title === 'New Conversation' && chat.createdAt.getTime() === chat.updatedAt.getTime()) {
      // Rough heuristic, better to check message count, but simple for now
      updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: {
          title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          updatedAt: new Date(),
        },
      });
    } else {
      updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    }

    res.json({
      userMessage: toMongo(userMessage),
      assistantMessage: toMongo(assistantMessage),
      chat: toMongo(updatedChat),
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

    // Verify ownership via where clause on update? 
    // Prisma update where id=chatId AND userId won't work easily on unique ID.
    // Must find first.
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { title },
    });

    res.json({ chat: toMongo(updatedChat) });
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

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });
    // Cascade delete configured in Schema, so messages auto-delete.

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
