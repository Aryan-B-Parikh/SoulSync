/**
 * Chat Routes
 * GET /chats - Get all user chats
 * POST /chats - Create new chat
 * GET /chats/:chatId - Get chat with messages
 * POST /chats/:chatId/messages - Send message
 * POST /chats/:chatId/messages/stream - Send message with streaming response
 * DELETE /chats/:chatId - Delete chat
 */

const express = require('express');
const { body, param } = require('express-validator');
const {
  getUserChats,
  createChat,
  getChatById,
  sendMessage,
  updateChat,
  deleteChat,
} = require('../controllers/chat.controller');
const { streamMessage } = require('../controllers/streaming.controller');
const authenticate = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validator');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createChatValidation = [
  body('title').optional().trim().isLength({ max: 100 }),
  handleValidationErrors,
];

const sendMessageValidation = [
  param('chatId').isUUID(),
  body('content').trim().isLength({ min: 1, max: 4000 }),
  handleValidationErrors,
];

const chatIdValidation = [
  param('chatId').isUUID(),
  handleValidationErrors,
];

const updateChatValidation = [
  param('chatId').isUUID(),
  body('title').trim().isLength({ min: 1, max: 60 }),
  handleValidationErrors,
];

// Routes
router.get('/', getUserChats);
router.post('/', createChatValidation, createChat);
router.get('/:chatId', chatIdValidation, getChatById);
router.patch('/:chatId', updateChatValidation, updateChat);
router.post('/:chatId/messages', sendMessageValidation, sendMessage);
router.post('/:chatId/messages/stream', sendMessageValidation, streamMessage); // NEW: Streaming endpoint
router.delete('/:chatId', chatIdValidation, deleteChat);

module.exports = router;
