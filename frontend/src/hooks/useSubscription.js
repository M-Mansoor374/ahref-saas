// useSubscription hook
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useSubscription Custom Hook
 * 
 * Tracks subscription start date and expiry date, calculates subscription status,
 * and provides helper functions for subscription management.
 * 
 * @param {Object} options - Hook options
 * @param {Object} options.subscriptionData - Subscription data object (optional)
 * @param {Date|string} options.subscriptionData.startDate - Subscription start date
 * @param {Date|string} options.subscriptionData.expiryDate - Subscription expiry date
 * @param {boolean} options.subscriptionData.isExpired - Whether subscription is expired (optional)
 * @param {Function} options.fetchFunction - Function to fetch subscription data (optional)
 * @param {boolean} options.autoRefresh - Whether to auto-refresh subscription status (default: true)
 * @param {number} options.refreshInterval - Refresh interval in milliseconds (default: 60000 = 1 minute)
 * @returns {Object} Subscription state and helper functions
 */
const useSubscription = ({
  subscriptionData = null,
  fetchFunction = null,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute default
} = {}) => {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Parse and validate subscription data
   * 
   * @param {Object} data - Subscription data
   * @returns {Object|null} Parsed subscription data or null if invalid
   */
  const parseSubscriptionData = useCallback((data) => {
    if (!data) return null;

    try {
      const startDate = data.startDate ? new Date(data.startDate) : null;
      const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;

      // Validate dates
      if (!startDate || isNaN(startDate.getTime())) {
        console.warn('Invalid start date:', data.startDate);
        return null;
      }

      if (!expiryDate || isNaN(expiryDate.getTime())) {
        console.warn('Invalid expiry date:', data.expiryDate);
        return null;
      }

      // Validate that expiry is after start
      if (expiryDate <= startDate) {
        console.warn('Expiry date must be after start date');
        return null;
      }

      return {
        startDate,
        expiryDate,
        isExpired: data.isExpired !== undefined ? data.isExpired : false,
      };
    } catch (err) {
      console.error('Error parsing subscription data:', err);
      return null;
    }
  }, []);

  /**
   * Calculate if subscription is currently active
   * 
   * @param {Object} subData - Subscription data
   * @returns {boolean} True if subscription is active
   */
  const calculateIsActive = useCallback((subData) => {
    if (!subData) return false;

    const now = new Date();

    // Check if explicitly marked as expired
    if (subData.isExpired) {
      return false;
    }

    // Check if subscription has started
    if (now < subData.startDate) {
      return false;
    }

    // Check if subscription has expired
    if (now > subData.expiryDate) {
      return false;
    }

    return true;
  }, []);

  /**
   * Calculate remaining days until expiry
   * 
   * @param {Object} subData - Subscription data
   * @returns {number|null} Remaining days or null if invalid
   */
  const calculateRemainingDays = useCallback((subData) => {
    if (!subData || !subData.expiryDate) return null;

    const now = new Date();
    const expiry = new Date(subData.expiryDate);

    // If already expired, return 0
    if (now >= expiry) {
      return 0;
    }

    // Calculate difference in days
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }, []);

  /**
   * Fetch subscription data
   */
  const fetchSubscription = useCallback(async () => {
    if (!fetchFunction) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchFunction();
      const parsed = parseSubscriptionData(data);

      if (parsed) {
        setSubscription(parsed);
      } else {
        setError('Invalid subscription data received');
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.message || 'Failed to fetch subscription data');
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, parseSubscriptionData]);

  /**
   * Initialize subscription data
   */
  useEffect(() => {
    if (subscriptionData) {
      const parsed = parseSubscriptionData(subscriptionData);
      setSubscription(parsed);
      setError(null);
    } else if (fetchFunction) {
      fetchSubscription();
    } else {
      // No data provided, set to null
      setSubscription(null);
    }
  }, [subscriptionData, fetchFunction, parseSubscriptionData, fetchSubscription]);

  /**
   * Auto-refresh subscription status
   */
  useEffect(() => {
    if (!autoRefresh || !subscription) return;

    const interval = setInterval(() => {
      // Recalculate status based on current time
      setSubscription((prev) => {
        if (!prev) return null;

        const now = new Date();
        const isExpired = now > prev.expiryDate;

        return {
          ...prev,
          isExpired,
        };
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, subscription, refreshInterval]);

  /**
   * Check if subscription is active
   * 
   * @returns {boolean} True if subscription is active
   */
  const isSubscriptionActive = useCallback(() => {
    if (!subscription) return false;
    return calculateIsActive(subscription);
  }, [subscription, calculateIsActive]);

  /**
   * Get remaining days until expiry
   * 
   * @returns {number|null} Remaining days or null if invalid
   */
  const getRemainingDays = useCallback(() => {
    if (!subscription) return null;
    return calculateRemainingDays(subscription);
  }, [subscription, calculateRemainingDays]);

  /**
   * Refresh subscription data
   */
  const refresh = useCallback(() => {
    if (fetchFunction) {
      fetchSubscription();
    } else if (subscriptionData) {
      const parsed = parseSubscriptionData(subscriptionData);
      setSubscription(parsed);
    }
  }, [fetchFunction, subscriptionData, parseSubscriptionData, fetchSubscription]);

  // Memoized computed values
  const isActive = useMemo(() => isSubscriptionActive(), [isSubscriptionActive]);
  const remainingDays = useMemo(() => getRemainingDays(), [getRemainingDays]);
  const isExpired = useMemo(() => {
    if (!subscription) return null;
    return subscription.isExpired || new Date() > subscription.expiryDate;
  }, [subscription]);

  const hasStarted = useMemo(() => {
    if (!subscription) return null;
    return new Date() >= subscription.startDate;
  }, [subscription]);

  const hasExpired = useMemo(() => {
    if (!subscription) return null;
    return new Date() > subscription.expiryDate;
  }, [subscription]);

  return {
    // State
    subscription,
    isLoading,
    error,

    // Computed values
    isActive,
    isExpired,
    hasStarted,
    hasExpired,
    remainingDays,

    // Helper functions
    isSubscriptionActive,
    getRemainingDays,
    refresh,
  };
};

export default useSubscription;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage with subscription data:
 * 
 *    import useSubscription from '../hooks/useSubscription';
 *    
 *    function SubscriptionStatus() {
 *      const subscriptionData = {
 *        startDate: '2024-01-01',
 *        expiryDate: '2024-12-31',
 *        isExpired: false
 *      };
 *      
 *      const {
 *        isActive,
 *        remainingDays,
 *        isExpired,
 *        hasStarted
 *      } = useSubscription({ subscriptionData });
 *      
 *      return (
 *        <div>
 *          <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
 *          <p>Remaining Days: {remainingDays !== null ? remainingDays : 'N/A'}</p>
 *          {isExpired && <p>Subscription has expired</p>}
 *          {!hasStarted && <p>Subscription has not started yet</p>}
 *        </div>
 *      );
 *    }
 * 
 * 2. Usage with fetch function:
 * 
 *    import useSubscription from '../hooks/useSubscription';
 *    import api from '../services/api';
 *    
 *    function Dashboard() {
 *      const {
 *        subscription,
 *        isActive,
 *        remainingDays,
 *        isLoading,
 *        error,
 *        refresh
 *      } = useSubscription({
 *        fetchFunction: async () => {
 *          const response = await api.get('/user/subscription');
 *          return response.data.data;
 *        },
 *        autoRefresh: true,
 *        refreshInterval: 60000 // Refresh every minute
 *      });
 *      
 *      if (isLoading) return <div>Loading subscription...</div>;
 *      if (error) return <div>Error: {error}</div>;
 *      
 *      return (
 *        <div>
 *          <h2>Subscription Status</h2>
 *          <p>Active: {isActive ? 'Yes' : 'No'}</p>
 *          <p>Days Remaining: {remainingDays}</p>
 *          <button onClick={refresh}>Refresh</button>
 *        </div>
 *      );
 *    }
 * 
 * 3. Usage with UserContext:
 * 
 *    import useSubscription from '../hooks/useSubscription';
 *    import { useUser } from '../contexts/UserContext';
 *    
 *    function UserDashboard() {
 *      const { userData } = useUser();
 *      
 *      // Get subscription from userData or fetch separately
 *      const subscriptionData = userData?.subscription || null;
 *      
 *      const {
 *        isActive,
 *        remainingDays,
 *        isSubscriptionActive
 *      } = useSubscription({
 *        subscriptionData,
 *        autoRefresh: true
 *      });
 *      
 *      // Use the function directly
 *      const checkStatus = () => {
 *        if (isSubscriptionActive()) {
 *          console.log('Subscription is active!');
 *        } else {
 *          console.log('Subscription is not active');
 *        }
 *      };
 *      
 *      return (
 *        <div>
 *          <h2>My Subscription</h2>
 *          <p>Status: {isActive ? '✅ Active' : '❌ Inactive'}</p>
 *          {remainingDays !== null && (
 *            <p>Expires in: {remainingDays} days</p>
 *          )}
 *          <button onClick={checkStatus}>Check Status</button>
 *        </div>
 *      );
 *    }
 * 
 * 4. Handle missing/invalid data:
 * 
 *    function SubscriptionCard() {
 *      const { subscription, isActive, remainingDays, error } = useSubscription({
 *        subscriptionData: null // No data provided
 *      });
 *      
 *      if (!subscription) {
 *        return <div>No subscription data available</div>;
 *      }
 *      
 *      if (error) {
 *        return <div>Error: {error}</div>;
 *      }
 *      
 *      return (
 *        <div>
 *          <h3>Subscription Details</h3>
 *          <p>Start: {subscription.startDate.toLocaleDateString()}</p>
 *          <p>Expiry: {subscription.expiryDate.toLocaleDateString()}</p>
 *          <p>Active: {isActive ? 'Yes' : 'No'}</p>
 *          {remainingDays !== null && (
 *            <p>Remaining: {remainingDays} days</p>
 *          )}
 *        </div>
 *      );
 *    }
 * 
 * 5. With date strings or Date objects:
 * 
 *    const subscriptionData = {
 *      startDate: new Date('2024-01-01'), // Date object
 *      expiryDate: '2024-12-31', // String (will be parsed)
 *    };
 *    
 *    const { isActive, remainingDays } = useSubscription({ subscriptionData });
 */
