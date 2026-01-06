// Environment variables validation
require('dotenv').config();

/**
 * Required environment variables
 * These must be set for the application to run
 */
const REQUIRED_VARS = ['PORT', 'MONGO_URI', 'JWT_SECRET'];

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required variable is missing
 */
const validateEnv = () => {
  const missing = [];

  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please set these variables in your .env file or environment.`
    );
  }
};

// Validate environment variables on module load
validateEnv();

/**
 * Environment configuration object
 * Exposes all environment variables with defaults where appropriate
 */
const env = {
  // Server Configuration
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,

  // Authentication Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Additional Configuration
  API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`,
};

module.exports = env;
