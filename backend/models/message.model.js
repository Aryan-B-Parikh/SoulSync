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
  feedback: {
    type: String,
    enum: ['up', 'down', null],
    default: null,
  },
  feedbackAt: {
    type: Date,
    default: null,
  },
  sentiment: {
    score: {
      type: Number,
      default: 0,
    },
    comparative: {
      type: Number,
      default: 0,
    },
    mood: {
      type: String,
      enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
      default: 'neutral',
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Add index for time-based queries
  },
});

// Compound index for efficient chat history queries
messageSchema.index({ chatId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
