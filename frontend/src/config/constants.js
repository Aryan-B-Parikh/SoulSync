/**
 * Application-wide constants and configuration
 */

export const AI_CONFIG = {
  SYSTEM_PROMPT: "You're SoulSync, a sophisticated AI confidante — wise, thoughtful, calm, and caring. Respond with empathy, depth, and poetic insight. Keep responses thoughtful but concise.",
  MODEL: 'llama-3.3-70b-versatile',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
};

const DEFAULT_API_BASE_URL = '/api';

function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.REACT_APP_API_URL?.trim();

  if (!configuredBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, '');
}

export const API_CONFIG = {
  // Default to a relative API path so CRA proxying works in development and
  // same-origin deployments work without a separate frontend env override.
  BASE_URL: resolveApiBaseUrl(),
  ENDPOINTS: {
    CHAT: '/chat',
    CHAT_FALLBACK: '/chat-fallback',
  },
  TIMEOUT: 30000, // 30 seconds
};

export const UI_CONFIG = {
  MAX_MESSAGE_LENGTH: 2000,
  TYPING_DELAY: 1000,
  ANIMATION_DURATION: 300,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Apologies, darling. I seem to have lost my connection. Could you try again? 🤖💭",
  API_ERROR: "Something went awry in the cosmos. Let's try that once more. ✨",
  VALIDATION_ERROR: "Please share your thoughts with me, dear soul. 💭",
  RATE_LIMIT_ERROR: "Let's take a moment to breathe. Please try again shortly. 🌙",
};

export const FEATURE_CARDS = [
  {
    icon: "🧠",
    title: "Cognitive Depth",
    description: "Powered by advanced AI, SoulSync holds space for your inner world.",
  },
  {
    icon: "🎨",
    title: "Artful Design",
    description: "Minimal, elegant, with purposeful animations that inspire.",
  },
  {
    icon: "🔒",
    title: "Privacy First",
    description: "Your moments remain sacred, always secure and private.",
  },
];
