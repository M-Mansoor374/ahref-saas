// Authentication controller
const authService = require('../services/authService');

/**
 * Register controller
 * POST /api/auth/register
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Register user using auth service (defaults to 'user' role)
    const user = await authService.registerUser({
      email,
      password,
      name: name || email.split('@')[0],
      role: 'user',
    });

    // Generate JWT token for immediate login
    const token = authService.generateJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('already exists') || error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Handle validation errors
    if (error.message.includes('Password must be') || error.message.includes('Email')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Handle other errors
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again later.',
    });
  }
};

/**
 * Login controller
 * POST /api/auth/login
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Login user using auth service
    const { user, token } = await authService.loginUser({ email, password });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // Handle authentication errors
    if (
      error.message === 'Invalid email or password' ||
      error.message === 'Account is inactive. Please contact administrator.' ||
      error.message === 'Email and password are required'
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Handle other errors
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Login failed. Please try again later.',
    });
  }
};

/**
 * Logout controller
 * POST /api/auth/logout
 * 
 * Note: Since we're using JWT tokens, logout is primarily client-side
 * (client should delete the token). This endpoint can be used for
 * logging the logout action or invalidating tokens if using a token blacklist.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // Get user from request (set by auth middleware)
    const userId = req.userId || req.user?._id;

    // Log logout activity (optional - you can use ActivityLog here)
    if (userId) {
      // You can log the logout action here if needed
      // await ActivityLog.create({ userId, action: 'logout', ipAddress: req.ip });
    }

    // Return success response
    // Note: With JWT, actual logout is handled client-side by removing the token
    return res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed. Please try again later.',
    });
  }
};

/**
 * Refresh token controller
 * POST /api/auth/refresh
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required',
      });
    }

    // Refresh token using auth service
    const newToken = await authService.refreshJWT(token);

    // Return new token
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    // Handle token errors
    if (
      error.message === 'Invalid token' ||
      error.message === 'Token has expired' ||
      error.message === 'Token verification failed'
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    // Handle other errors
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed. Please try again later.',
    });
  }
};

/**
 * Get current user controller
 * GET /api/auth/me
 * 
 * Returns the current authenticated user's information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get user information',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
};
