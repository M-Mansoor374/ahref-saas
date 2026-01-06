// Authentication service
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_ROLES } = require('../config/constants');

/**
 * Hash a password using bcrypt
 * 
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
  try {
    if (!password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare plain text password with hashed password
 * 
 * @param {string} password - Plain text password
 * @param {string} passwordHash - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
const comparePassword = async (password, passwordHash) => {
  try {
    if (!password || !passwordHash) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, passwordHash);
    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

/**
 * Generate JWT token for user
 * 
 * @param {Object} payload - Token payload (typically userId)
 * @param {string} expiresIn - Token expiration time (default: '7d')
 * @returns {string} JWT token
 */
const generateJWT = (payload, expiresIn = '7d') => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    if (!payload || !payload.userId) {
      throw new Error('Payload must include userId');
    }

    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email || null,
        role: payload.role || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn,
        issuer: 'mern-saas-app',
      }
    );

    return token;
  } catch (error) {
    throw new Error(`JWT generation failed: ${error.message}`);
  }
};

/**
 * Register a new user
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - Plain text password
 * @param {string} userData.role - User role (optional, defaults to 'user')
 * @param {string} userData.resellerId - Reseller ID (optional)
 * @returns {Promise<Object>} Created user object (without passwordHash)
 */
const registerUser = async (userData) => {
  try {
    const { email, password, role = USER_ROLES.USER, resellerId = null } = userData;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength (optional, but recommended)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = new User({
      name: userData.name || email.split('@')[0],
      email: email.toLowerCase().trim(),
      password: password,
      role,
      resellerId: resellerId || null,
      status: 'active',
    });

    // Save user to MongoDB
    await user.save();

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    // Handle duplicate email error (MongoDB unique index)
    if (error.code === 11000) {
      throw new Error('User with this email already exists');
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      throw new Error(messages.join(', '));
    }
    
    throw error;
  }
};

/**
 * Login user and return JWT token
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - Plain text password
 * @returns {Promise<Object>} User object and JWT token
 */
const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user by email (include password for comparison)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is inactive. Please contact administrator.');
    }

    // Compare password - ensure password field exists
    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data (without password) and token
    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      token,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Verify JWT token and return decoded payload
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyJWT = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Refresh JWT token
 * 
 * @param {string} token - Current JWT token
 * @returns {string} New JWT token
 */
const refreshJWT = async (token) => {
  try {
    // Verify current token
    const decoded = verifyJWT(token);

    // Generate new token with same payload
    const newToken = generateJWT({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return newToken;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  hashPassword,
  comparePassword,
  generateJWT,
  verifyJWT,
  refreshJWT,
};
