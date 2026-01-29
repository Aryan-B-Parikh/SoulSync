/**
 * Message Model
 * Stores individual chat messages
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
    index: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system'],
  },
  content: {
    type: String,
    required: true,
    maxlength: 4000,
  },
  vectorId: {
    type: String,
    default: null,
    index: true,
  },
  isMemory: {
    type: Boolean,
    default: false,
  },
  memoryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient chat history queries
messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
