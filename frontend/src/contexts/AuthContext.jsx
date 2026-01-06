// Authentication context
import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { login as authLogin, logout as authLogout, getCurrentUser as authGetCurrentUser } from '../services/authService';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Manages user authentication, token storage, and session persistence.
 */

// Create the Auth Context
const AuthContext = createContext(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication context to all children.
 * Manages authentication state, token persistence, and authentication methods.
 * 
 * @param {ReactNode} children - Child components that will have access to auth context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  /**
   * Initialize authentication state from localStorage
   * Check if user is already logged in on app load
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get token and user from localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            
            // Set initial state immediately from localStorage to prevent blinking
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);
            
            // Verify token in background (non-blocking)
            // Don't set isLoading to false until verification completes
            try {
              const currentUser = await authGetCurrentUser();
              setUser(currentUser);
              if (currentUser.role) {
                localStorage.setItem('userRole', currentUser.role);
              }
              localStorage.setItem('user', JSON.stringify(currentUser));
              setIsLoading(false);
            } catch (error) {
              // Token is invalid, clear storage
              console.warn('Token validation failed:', error);
              clearAuth();
              setIsLoading(false);
            }
          } catch (parseError) {
            // Failed to parse user data
            console.warn('Failed to parse user data:', parseError);
            clearAuth();
            setIsLoading(false);
          }
        } else {
          // No stored auth data
          clearAuth();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Clear authentication state and localStorage
   */
  const clearAuth = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  };

  /**
   * Login user with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      // Call auth service login
      const result = await authLogin({ email, password });

      if (result.success && result.user && result.token) {
        // Update state atomically to prevent flicker
        setUser(result.user);
        setToken(result.token);
        setIsAuthenticated(true);
        if (result.user.role) {
          localStorage.setItem('userRole', result.user.role);
        }

        return {
          success: true,
          user: result.user,
          token: result.token,
        };
      } else {
        throw new Error('Login failed: Invalid response from server');
      }
    } catch (error) {
      // Clear any partial auth state
      clearAuth();

      // Re-throw error for component to handle
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears authentication state and calls logout API
   * 
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      setIsLoading(true);

      // Call auth service logout (will clear localStorage)
      await authLogout();

      // Clear state
      clearAuth();
    } catch (error) {
      // Even if API call fails, clear local state
      console.warn('Logout error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get current logged-in user
   * Fetches fresh user data from server
   * 
   * @returns {Promise<Object>} Current user data
   */
  const getCurrentUser = async () => {
    try {
      // Fetch fresh user data from server
      const currentUser = await authGetCurrentUser();

      // Update state with fresh data
      setUser(currentUser);
      if (currentUser.role) {
        localStorage.setItem('userRole', currentUser.role);
      }

      return currentUser;
    } catch (error) {
      // If fetch fails, user might be logged out
      console.warn('Failed to get current user:', error);
      clearAuth();
      throw error;
    }
  };

  /**
   * Refresh authentication token
   * Updates token in state and localStorage
   * 
   * @param {string} newToken - New authentication token
   */
  const updateToken = (newToken) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('token', newToken);
    }
  };

  // Context value to provide
  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    token,
    role: user?.role || null,

    // Methods
    login,
    logout,
    getCurrentUser,
    updateToken,

    // Helper methods
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context.
 * Must be used within AuthProvider.
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export the context for advanced use cases
export default AuthContext;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Wrap your app with AuthProvider in App.jsx or index.js:
 * 
 *    import { AuthProvider } from './contexts/AuthContext';
 *    import App from './App';
 *    
 *    function Root() {
 *      return (
 *        <AuthProvider>
 *          <App />
 *        </AuthProvider>
 *      );
 *    }
 * 
 * 2. Use authentication in any component:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    
 *    function MyComponent() {
 *      const { user, isAuthenticated, login, logout, isLoading } = useAuth();
 *      
 *      const handleLogin = async () => {
 *        try {
 *          await login('user@example.com', 'password123');
 *          console.log('Login successful!');
 *        } catch (error) {
 *          console.error('Login failed:', error.message);
 *        }
 *      };
 *      
 *      const handleLogout = async () => {
 *        await logout();
 *      };
 *      
 *      if (isLoading) return <div>Loading...</div>;
 *      
 *      return (
 *        <div>
 *          {isAuthenticated ? (
 *            <div>
 *              <p>Welcome, {user.name}!</p>
 *              <p>Role: {user.role}</p>
 *              <button onClick={handleLogout}>Logout</button>
 *            </div>
 *          ) : (
 *            <button onClick={handleLogin}>Login</button>
 *          )}
 *        </div>
 *      );
 *    }
 * 
 * 3. Protect routes using PrivateRoute (already uses useAuth):
 * 
 *    <PrivateRoute>
 *      <Dashboard />
 *    </PrivateRoute>
 * 
 * 4. Check user role:
 * 
 *    const { user, role } = useAuth();
 *    if (role === 'super_admin') {
 *      // Show admin features
 *    }
 * 
 * 5. Get current user data:
 * 
 *    const { getCurrentUser } = useAuth();
 *    const fetchUser = async () => {
 *      try {
 *        const user = await getCurrentUser();
 *        console.log('Current user:', user);
 *      } catch (error) {
 *        console.error('Failed to get user:', error);
 *      }
 *    };
 */
