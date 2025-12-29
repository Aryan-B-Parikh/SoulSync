/**
 * Chat Routes
 * GET /chats - Get all user chats
 * POST /chats - Create new chat
 * GET /chats/:chatId - Get chat with messages
 * POST /chats/:chatId/messages - Send message
 * DELETE /chats/:chatId - Delete chat
 */

const express = require('express');
const { body, param } = require('express-validator');
const {
  getUserChats,
  createChat,
  getChatById,
  sendMessage,
  deleteChat,
} = require('../controllers/chat.controller');
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
  param('chatId').isMongoId(),
  body('content').trim().isLength({ min: 1, max: 4000 }),
  handleValidationErrors,
];

const chatIdValidation = [
  param('chatId').isMongoId(),
  handleValidationErrors,
];

// Routes
router.get('/', getUserChats);
router.post('/', createChatValidation, createChat);
router.get('/:chatId', chatIdValidation, getChatById);
router.post('/:chatId/messages', sendMessageValidation, sendMessage);
router.delete('/:chatId', chatIdValidation, deleteChat);

module.exports = router;
