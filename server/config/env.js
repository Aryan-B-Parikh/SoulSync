/**
 * Environment Configuration Validator
 * Ensures all required environment variables are present
 */

const requiredEnvVars = {
  GROQ_API_KEY: 'Groq API key for AI chat completions',
};

const optionalEnvVars = {
  NODE_ENV: 'Environment (development, production, test)',
  PORT: 'Server port number (default: 5001)',
  HUGGINGFACE_API_KEY: 'HuggingFace API key (optional fallback)',
  RATE_LIMIT_WINDOW: 'Rate limit window in minutes (default: 15)',
  RATE_LIMIT_MAX_REQUESTS: 'Max requests per window (default: 100)',
};

/**
 * Validate environment variables
 * @param {boolean} strict - If true, throw error on missing vars; if false, warn only
 */
function validateEnv(strict = true) {
  const missing = [];
  const warnings = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      missing.push(`${key}: ${description}`);
    }
  });

  // Check optional variables
  Object.entries(optionalEnvVars).forEach(([key, description]) => {
    if (!process.env[key]) {
      warnings.push(`${key}: ${description}`);
    }
  });

  // Log results
  if (warnings.length > 0) {
    console.log('\n⚠️  Optional environment variables not set:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(item => console.error(`  - ${item}`));
    
    if (strict) {
      console.error('\n💡 Copy .env.example to .env and fill in the values.\n');
      process.exit(1);
    }
  } else {
    console.log('\n✅ All required environment variables are set\n');
  }
}

/**
 * Get configuration object with defaults
 */
function getConfig() {
  return {
    groqApiKey: process.env.GROQ_API_KEY,
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY,
    port: parseInt(process.env.PORT) || 5001,
    nodeEnv: process.env.NODE_ENV || 'development',
    rateLimit: {
      windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
    },
  };
}

module.exports = {
  validateEnv,
  getConfig,
};
