// User data context
import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

/**
 * User Context
 * 
 * Provides user-specific state and methods throughout the application.
 * Manages user data, usage limits, and usage tracking.
 */

// Create the User Context
const UserContext = createContext(undefined);

/**
 * UserProvider Component
 * 
 * Wraps the application and provides user context to all children.
 * Manages user data, usage tracking, and usage limits.
 * 
 * @param {ReactNode} children - Child components that will have access to user context
 * @param {Object} initialUserData - Initial user data (optional)
 */
export const UserProvider = ({ children, initialUserData = null }) => {
  // Mock user data structure
  const defaultMockUserData = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    usageLimits: {
      keywordLimit: 1000,
      usedKeywords: 0,
      remainingKeywords: 1000,
      isUnlimited: false,
    },
    activeStatus: true,
  };

  const [userData, setUserDataState] = useState(
    initialUserData || defaultMockUserData
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Initialize user data from localStorage (if available)
   * Ready for backend integration
   */
  useEffect(() => {
    const initializeUserData = () => {
      // Check if user data exists in localStorage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserDataState(parsedData);
        } catch (error) {
          console.warn('Failed to parse stored user data:', error);
        }
      }
    };

    initializeUserData();
  }, []);

  /**
   * Update user data
   * 
   * @param {Object} data - User data object or partial update
   * @param {string} data.id - User ID
   * @param {string} data.name - User name
   * @param {string} data.email - User email
   * @param {string} data.role - User role
   * @param {Object} data.usageLimits - Usage limits object
   * @param {boolean} data.activeStatus - Active status
   */
  const setUserData = (data) => {
    setUserDataState((prevData) => {
      const updatedData = {
        ...prevData,
        ...data,
        // Merge usageLimits if provided
        usageLimits: data.usageLimits
          ? { ...prevData.usageLimits, ...data.usageLimits }
          : prevData.usageLimits,
      };

      // Calculate remaining keywords
      if (updatedData.usageLimits && updatedData.usageLimits.keywordLimit !== undefined) {
        const { keywordLimit, usedKeywords, isUnlimited } = updatedData.usageLimits;
        updatedData.usageLimits.remainingKeywords = isUnlimited
          ? Infinity
          : Math.max(0, keywordLimit - (usedKeywords || 0));
      }

      // Save to localStorage (optional, for persistence)
      try {
        localStorage.setItem('userData', JSON.stringify(updatedData));
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error);
      }

      return updatedData;
    });
  };

  /**
   * Increment usage count
   * 
   * @param {number} count - Number of keywords to increment (default: 1)
   * @returns {boolean} True if increment was successful, false if limit exceeded
   */
  const incrementUsage = (count = 1) => {
    return setUserDataState((prevData) => {
      if (!prevData.usageLimits) {
        console.warn('Usage limits not defined');
        return prevData;
      }

      const { keywordLimit, usedKeywords = 0, isUnlimited } = prevData.usageLimits;

      // Check if increment would exceed limit (unless unlimited)
      if (!isUnlimited && usedKeywords + count > keywordLimit) {
        console.warn(
          `Cannot increment usage: would exceed limit (${usedKeywords + count} > ${keywordLimit})`
        );
        return prevData;
      }

      const newUsedKeywords = usedKeywords + count;
      const newRemainingKeywords = isUnlimited
        ? Infinity
        : Math.max(0, keywordLimit - newUsedKeywords);

      const updatedData = {
        ...prevData,
        usageLimits: {
          ...prevData.usageLimits,
          usedKeywords: newUsedKeywords,
          remainingKeywords: newRemainingKeywords,
        },
      };

      // Save to localStorage
      try {
        localStorage.setItem('userData', JSON.stringify(updatedData));
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error);
      }

      return updatedData;
    });
  };

  /**
   * Reset usage count
   * Sets used keywords back to 0 (for new subscription or admin action)
   * 
   * @param {number} newLimit - Optional new keyword limit (if resetting limit too)
   */
  const resetUsage = (newLimit = null) => {
    setUserDataState((prevData) => {
      const keywordLimit =
        newLimit !== null
          ? newLimit
          : prevData.usageLimits?.keywordLimit || 1000;

      const updatedData = {
        ...prevData,
        usageLimits: {
          ...prevData.usageLimits,
          keywordLimit,
          usedKeywords: 0,
          remainingKeywords: keywordLimit,
          isUnlimited: keywordLimit === -1 || keywordLimit === Infinity,
        },
      };

      // Save to localStorage
      try {
        localStorage.setItem('userData', JSON.stringify(updatedData));
      } catch (error) {
        console.warn('Failed to save user data to localStorage:', error);
      }

      return updatedData;
    });
  };

  /**
   * Fetch user data from backend API
   * Ready for future backend integration
   * 
   * @param {Function} fetchFunction - Async function to fetch user data from API
   * @returns {Promise<void>}
   */
  const fetchUserData = async (fetchFunction) => {
    if (!fetchFunction) {
      console.warn('fetchUserData: No fetch function provided');
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchFunction();
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update usage limits
   * 
   * @param {Object} limits - Usage limits object
   * @param {number} limits.keywordLimit - Total keyword limit
   * @param {number} limits.usedKeywords - Used keywords
   * @param {boolean} limits.isUnlimited - Whether unlimited
   */
  const updateUsageLimits = (limits) => {
    setUserData({
      usageLimits: {
        ...userData.usageLimits,
        ...limits,
      },
    });
  };

  // Computed values
  const usageUsed = userData?.usageLimits?.usedKeywords || 0;
  const usageLeft =
    userData?.usageLimits?.isUnlimited
      ? Infinity
      : userData?.usageLimits?.remainingKeywords || 0;
  const usageLimit = userData?.usageLimits?.keywordLimit || 0;
  const isUnlimited = userData?.usageLimits?.isUnlimited || false;

  // Context value to provide
  const value = {
    // State
    userData,
    isLoading,

    // Computed values
    usageUsed,
    usageLeft,
    usageLimit,
    isUnlimited,

    // Methods
    setUserData,
    incrementUsage,
    resetUsage,
    updateUsageLimits,
    fetchUserData,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialUserData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    usageLimits: PropTypes.shape({
      keywordLimit: PropTypes.number,
      usedKeywords: PropTypes.number,
      remainingKeywords: PropTypes.number,
      isUnlimited: PropTypes.bool,
    }),
    activeStatus: PropTypes.bool,
  }),
};

/**
 * useUser Hook
 * 
 * Custom hook to access user context.
 * Must be used within UserProvider.
 * 
 * @returns {Object} User context value
 * @throws {Error} If used outside UserProvider
 */
export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};

// Export the context for advanced use cases
export default UserContext;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Wrap your app with UserProvider in App.jsx or index.js:
 * 
 *    import { UserProvider } from './contexts/UserContext';
 *    import { AuthProvider } from './contexts/AuthContext';
 *    import App from './App';
 *    
 *    function Root() {
 *      return (
 *        <AuthProvider>
 *          <UserProvider>
 *            <App />
 *          </UserProvider>
 *        </AuthProvider>
 *      );
 *    }
 * 
 * 2. Use user context in User Dashboard component:
 * 
 *    import { useUser } from '../../contexts/UserContext';
 *    import Card from '../../components/common/Card';
 *    
 *    function UserDashboard() {
 *      const { 
 *        userData, 
 *        usageUsed, 
 *        usageLeft, 
 *        usageLimit, 
 *        isUnlimited,
 *        incrementUsage,
 *        resetUsage 
 *      } = useUser();
 *      
 *      // Calculate usage percentage
 *      const usagePercentage = isUnlimited || usageLimit === 0
 *        ? 0
 *        : (usageUsed / usageLimit) * 100;
 *      
 *      const handleIncrement = () => {
 *        incrementUsage(10); // Increment by 10 keywords
 *      };
 *      
 *      return (
 *        <div>
 *          <Card title="Usage Statistics">
 *            <div>
 *              <p>Name: {userData.name}</p>
 *              <p>Email: {userData.email}</p>
 *              <p>Role: {userData.role}</p>
 *              <p>Status: {userData.activeStatus ? 'Active' : 'Inactive'}</p>
 *            </div>
 *            
 *            <div style={{ marginTop: '20px' }}>
 *              <h3>Keyword Usage</h3>
 *              <p>Used: {usageUsed.toLocaleString()}</p>
 *              <p>Remaining: {isUnlimited ? 'Unlimited' : usageLeft.toLocaleString()}</p>
 *              <p>Limit: {isUnlimited ? 'Unlimited' : usageLimit.toLocaleString()}</p>
 *              
 *              {/* Progress Bar *\/}
 *              {!isUnlimited && (
 *                <div style={{
 *                  width: '100%',
 *                  height: '20px',
 *                  backgroundColor: '#e0e0e0',
 *                  borderRadius: '10px',
 *                  overflow: 'hidden',
 *                  marginTop: '10px'
 *                }}>
 *                  <div style={{
 *                    width: `${Math.min(usagePercentage, 100)}%`,
 *                    height: '100%',
 *                    backgroundColor: usagePercentage >= 90 ? '#d32f2f' : 
 *                                   usagePercentage >= 70 ? '#f57c00' : '#2e7d32',
 *                    transition: 'width 0.3s ease'
 *                  }} />
 *                </div>
 *              )}
 *              
 *              <button onClick={handleIncrement} style={{ marginTop: '10px' }}>
 *                Increment Usage (+10)
 *              </button>
 *            </div>
 *          </Card>
 *        </div>
 *      );
 *    }
 * 
 * 3. Update user data:
 * 
 *    const { setUserData } = useUser();
 *    
 *    // Update entire user data
 *    setUserData({
 *      name: 'Jane Doe',
 *      email: 'jane.doe@example.com',
 *      role: 'reseller',
 *      activeStatus: true
 *    });
 *    
 *    // Update only usage limits
 *    setUserData({
 *      usageLimits: {
 *         keywordLimit: 5000,
 *         usedKeywords: 100,
 *         isUnlimited: false
 *       }
 *     });
 * 
 * 4. Fetch user data from backend:
 * 
 *    import { useUser } from '../contexts/UserContext';
 *    import api from '../services/api';
 *    
 *    function Dashboard() {
 *      const { fetchUserData, userData, isLoading } = useUser();
 *      
 *      useEffect(() => {
 *        fetchUserData(async () => {
 *          const response = await api.get('/user/data');
 *          return response.data.data; // User data object
 *        });
 *      }, []);
 *      
 *      if (isLoading) return <div>Loading user data...</div>;
 *      
 *      return <div>Welcome, {userData.name}!</div>;
 *    }
 * 
 * 5. Reset usage (admin action or new subscription):
 * 
 *    const { resetUsage } = useUser();
 *    
 *    // Reset to 0 with current limit
 *    resetUsage();
 *    
 *    // Reset with new limit
 *    resetUsage(5000); // New limit of 5000 keywords
 */
