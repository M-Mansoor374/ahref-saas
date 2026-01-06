import api from './api';

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Call login API endpoint
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { data } = response.data;

    // Store authentication data
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role) {
        localStorage.setItem('userRole', data.user.role);
      }
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    // Handle API errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Login failed. Please try again.';

    throw new Error(errorMessage);
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Call logout API endpoint
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
    console.warn('Logout API call failed:', error);
  } finally {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }
};

/**
 * Get current user
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to get current user'
    );
  }
};

/**
 * Register a new user
 * @param {Object} userData - Registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User name (optional)
 * @returns {Promise<Object>} User data and token
 */
export const register = async (userData) => {
  try {
    const { email, password, name } = userData;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Call register API endpoint
    const response = await api.post('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      name: name || email.split('@')[0],
    });

    const { data } = response.data;

    // Store authentication data
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role) {
        localStorage.setItem('userRole', data.user.role);
      }
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    // Handle API errors
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Registration failed. Please try again.';

    throw new Error(errorMessage);
  }
};

/**
 * Refresh authentication token
 * @returns {Promise<string>} New token
 */
export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh');
    const { data } = response.data;

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data.token;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to refresh token'
    );
  }
};
