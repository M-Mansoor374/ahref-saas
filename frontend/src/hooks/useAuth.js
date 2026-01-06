// useAuth hook
import { useContext, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * useAuth Hook
 * 
 * Professional React custom hook for authentication management.
 * Integrates with AuthContext to provide authentication state and methods
 * throughout the application.
 * 
 * This hook provides access to:
 * - User authentication state (user, isAuthenticated, token, role)
 * - Authentication methods (login, logout, getCurrentUser)
 * - Loading states and error handling
 * 
 * Must be used within an AuthProvider component.
 * 
 * @returns {Object} Authentication context value with the following properties:
 * @returns {Object|null} user - Current user object (name, email, role, token)
 * @returns {boolean} isAuthenticated - Boolean indicating if user is logged in
 * @returns {boolean} isLoading - Loading state for async operations
 * @returns {string|null} token - Authentication token
 * @returns {string|null} role - User role (super_admin, reseller, user)
 * @returns {Function} login - Function to log in a user (email, password)
 * @returns {Function} logout - Function to log out the user and clear token
 * @returns {Function} getCurrentUser - Function to fetch current user data
 * @returns {Function} refreshAuth - Function to refresh authentication status
 * @returns {Function} updateToken - Function to update authentication token
 * @returns {Function} clearAuth - Function to clear authentication state
 * 
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * // Basic usage in a component
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   // Use authentication state and methods
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Add refreshAuth as a convenience alias for getCurrentUser
  // This provides a clearer API for refreshing authentication state
  const refreshAuth = useCallback(async () => {
    try {
      if (context.getCurrentUser) {
        const user = await context.getCurrentUser();
        return user;
      }
      throw new Error('getCurrentUser is not available in auth context');
    } catch (error) {
      console.error('Error refreshing authentication:', error);
      throw error;
    }
  }, [context]);

  // Return context with refreshAuth added
  return {
    ...context,
    refreshAuth,
  };
};

export default useAuth;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage - Get authentication state:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    
 *    function Dashboard() {
 *      const { user, isAuthenticated, isLoading } = useAuth();
 *      
 *      if (isLoading) {
 *        return <div>Loading...</div>;
 *      }
 *      
 *      if (!isAuthenticated) {
 *        return <div>Please log in</div>;
 *      }
 *      
 *      return (
 *        <div>
 *          <h1>Welcome, {user.name}!</h1>
 *          <p>Email: {user.email}</p>
 *          <p>Role: {user.role}</p>
 *        </div>
 *      );
 *    }
 * 
 * 2. Login functionality:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    import { useState } from 'react';
 *    
 *    function LoginPage() {
 *      const { login, isLoading } = useAuth();
 *      const [email, setEmail] = useState('');
 *      const [password, setPassword] = useState('');
 *      const [error, setError] = useState('');
 *      
 *      const handleLogin = async (e) => {
 *        e.preventDefault();
 *        setError('');
 *        
 *        try {
 *          await login(email, password);
 *          // User will be redirected based on role
 *        } catch (err) {
 *          setError(err.message || 'Login failed');
 *        }
 *      };
 *      
 *      return (
 *        <form onSubmit={handleLogin}>
 *          <input
 *            type="email"
 *            value={email}
 *            onChange={(e) => setEmail(e.target.value)}
 *            placeholder="Email"
 *          />
 *          <input
 *            type="password"
 *            value={password}
 *            onChange={(e) => setPassword(e.target.value)}
 *            placeholder="Password"
 *          />
 *          {error && <div>{error}</div>}
 *          <button type="submit" disabled={isLoading}>
 *            {isLoading ? 'Logging in...' : 'Login'}
 *          </button>
 *        </form>
 *      );
 *    }
 * 
 * 3. Logout functionality:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    import { useNavigate } from 'react-router-dom';
 *    
 *    function Header() {
 *      const { user, logout, isLoading } = useAuth();
 *      const navigate = useNavigate();
 *      
 *      const handleLogout = async () => {
 *        try {
 *          await logout();
 *          navigate('/login');
 *        } catch (error) {
 *          console.error('Logout error:', error);
 *        }
 *      };
 *      
 *      return (
 *        <header>
 *          <span>Welcome, {user?.name}</span>
 *          <button onClick={handleLogout} disabled={isLoading}>
 *            {isLoading ? 'Logging out...' : 'Logout'}
 *          </button>
 *        </header>
 *      );
 *    }
 * 
 * 4. Refresh authentication status:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    import { useEffect } from 'react';
 *    
 *    function ProtectedPage() {
 *      const { refreshAuth, user, isLoading } = useAuth();
 *      
 *      useEffect(() => {
 *         // Refresh user data on component mount
 *         const refreshUserData = async () => {
 *           try {
 *             await refreshAuth();
 *             console.log('Authentication refreshed');
 *           } catch (error) {
 *             console.error('Failed to refresh authentication:', error);
 *           }
 *         };
 *         
 *         refreshUserData();
 *       }, [refreshAuth]);
 *       
 *       if (isLoading) {
 *         return <div>Loading...</div>;
 *       }
 *       
 *       return (
 *         <div>
 *           <h1>Protected Content</h1>
 *           <p>User: {user?.name}</p>
 *         </div>
 *       );
 *     }
 * 
 * 5. Role-based access control:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    
 *    function AdminPanel() {
 *      const { user, role, isAuthenticated } = useAuth();
 *      
 *      if (!isAuthenticated) {
 *         return <div>Please log in</div>;
 *       }
 *       
 *       if (role !== 'super_admin') {
 *         return <div>Access denied. Admin only.</div>;
 *       }
 *       
 *       return (
 *         <div>
 *           <h1>Admin Panel</h1>
 *           <p>Welcome, {user.name}</p>
 *         </div>
 *       );
 *     }
 * 
 * 6. Integration with React Router (Protected Route):
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    import { Navigate } from 'react-router-dom';
 *    
 *    function PrivateRoute({ children }) {
 *      const { isAuthenticated, isLoading } = useAuth();
 *      
 *      if (isLoading) {
 *         return <div>Loading...</div>;
 *       }
 *       
 *       if (!isAuthenticated) {
 *         return <Navigate to="/login" replace />;
 *       }
 *       
 *       return children;
 *     }
 * 
 * 7. Check authentication before API calls:
 * 
 *    import { useAuth } from '../hooks/useAuth';
 *    import { useEffect } from 'react';
 *    
 *    function DataFetcher() {
 *      const { isAuthenticated, token, refreshAuth } = useAuth();
 *      const [data, setData] = useState(null);
 *      
 *      useEffect(() => {
 *         const fetchData = async () => {
 *           if (!isAuthenticated || !token) {
 *             // Refresh auth if token seems invalid
 *             try {
 *               await refreshAuth();
 *             } catch (error) {
 *               console.error('Auth refresh failed:', error);
 *               return;
 *             }
 *           }
 *           
 *           // Proceed with API call
 *           // ... fetch data using token
 *         };
 *         
 *         fetchData();
 *       }, [isAuthenticated, token, refreshAuth]);
 *       
 *       return <div>{data ? <DataDisplay data={data} /> : 'Loading...'}</div>;
 *     }
 * 
 * NOTE: 
 * - The authentication token is automatically persisted in localStorage
 * - The hook automatically initializes authentication state on app load
 * - All authentication methods handle errors gracefully
 * - The refreshAuth function is a convenience wrapper around getCurrentUser
 */
