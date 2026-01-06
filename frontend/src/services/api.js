// Axios/Fetch configuration
import axios from 'axios';

// Create Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (always check, even if null)
    const token = localStorage.getItem('token');

    // Always set Authorization header if token exists
    // Remove any existing Authorization header first to prevent duplicates
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else {
      // Remove Authorization header if no token
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 errors globally (unauthorized)
 * Redirects to login if token is invalid or expired
 */
api.interceptors.response.use(
  (response) => {
    // If request is successful, return response
    return response;
  },
  (error) => {
    // Handle response errors
    const { response } = error;

    // Handle 401 Unauthorized errors (authentication failure)
    if (response && response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // Redirect to login page
      // Only redirect if we're not already on the login page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden errors (permission denied, not auth failure)
    // Don't clear auth or redirect - let the component handle the error
    // This prevents redirect loops when user has valid token but insufficient permissions
    if (response && response.status === 403) {
      // Don't log as error - 403 is a valid business logic response (e.g., no subscription)
      // Component will handle the error message appropriately
      // Return error to be handled by the calling function
      // Don't clear auth or redirect to prevent loops
    }

    // Handle network errors
    if (!response) {
      console.error('Network error:', error.message);
      // You can show a toast notification here
    }

    // Return error to be handled by the calling function
    return Promise.reject(error);
  }
);

export default api;
