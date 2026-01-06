// CORS configuration
const cors = require('cors');
const env = require('./env');

/**
 * CORS Configuration Options
 * 
 * This configuration allows cross-origin requests from the frontend application
 * while maintaining security best practices.
 */
const corsOptions = {
  /**
   * Origin Configuration
   * 
   * In production: Only allow requests from the specified FRONTEND_URL
   * In development: Allow requests from FRONTEND_URL or localhost (for flexibility)
   * 
   * You can also pass a function to dynamically determine allowed origins:
   * origin: (origin, callback) => { ... }
   */
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    // This is useful for server-to-server communication
    if (!origin) {
      return callback(null, true);
    }

    // Get allowed origins from environment
    const allowedOrigins = [
      env.FRONTEND_URL,
      // Allow localhost in development for flexibility
      ...(env.NODE_ENV === 'development' 
        ? ['http://localhost:3000', 'http://127.0.0.1:3000'] 
        : []
      ),
    ].filter(Boolean); // Remove any undefined/null values

    // Check if the request origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, log a warning but still allow (for flexibility)
      if (env.NODE_ENV === 'development') {
        console.warn(`⚠️  CORS: Request from unlisted origin: ${origin}`);
        callback(null, true);
      } else {
        // In production, reject unlisted origins
        callback(new Error('Not allowed by CORS'));
      }
    }
  },

  /**
   * Credentials Configuration
   * 
   * When set to true, allows cookies and authorization headers
   * to be sent cross-origin. This is essential for JWT authentication
   * and session management.
   * 
   * Note: When credentials is true, origin cannot be '*'
   */
  credentials: true,

  /**
   * Allowed HTTP Methods
   * 
   * Specifies which HTTP methods are allowed in cross-origin requests.
   * These are the standard RESTful methods used in the API.
   */
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  /**
   * Allowed Headers
   * 
   * Specifies which headers can be used in cross-origin requests.
   * 
   * - Content-Type: Required for JSON/Form data
   * - Authorization: Required for JWT token authentication
   * - X-Requested-With: Common header for AJAX requests
   * - Accept: Specifies response content types
   */
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],

  /**
   * Exposed Headers
   * 
   * Headers that the browser is allowed to access in the response.
   * Useful for custom headers or pagination metadata.
   */
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Total-Count', // Example: for pagination
  ],

  /**
   * Preflight Options
   * 
   * maxAge: How long (in seconds) the browser should cache the preflight
   * response. This reduces the number of OPTIONS requests.
   * 
   * 86400 seconds = 24 hours
   */
  maxAge: 86400, // 24 hours

  /**
   * Options Success Status
   * 
   * Some legacy browsers (IE11, various SmartTVs) choke on 204.
   * Use 200 for better compatibility.
   */
  optionsSuccessStatus: 200,
};

/**
 * Create and export the CORS middleware
 * 
 * This middleware will be used in server.js to handle all CORS requests.
 * 
 * Usage:
 *   const corsMiddleware = require('./config/cors');
 *   app.use(corsMiddleware);
 */
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
