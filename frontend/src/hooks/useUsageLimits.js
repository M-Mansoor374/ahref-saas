// useUsageLimits hook
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useUsageLimits Custom Hook
 * 
 * Tracks keyword usage (used and remaining) and provides functions to
 * increment and reset usage counts. Automatically calculates remaining
 * keywords based on limit and used count.
 * 
 * @param {Object} options - Hook options
 * @param {number} options.initialLimit - Initial keyword limit (optional, default: 1000)
 * @param {number} options.initialUsed - Initial used keywords (optional, default: 0)
 * @param {boolean} options.isUnlimited - Whether subscription is unlimited (optional, default: false)
 * @param {Function} options.fetchFunction - Function to fetch usage data from API (optional)
 * @param {Object} options.userContext - UserContext hook result (optional, for integration)
 * @returns {Object} Usage limits state and helper functions
 */
const useUsageLimits = ({
  initialLimit = 1000,
  initialUsed = 0,
  isUnlimited = false,
  fetchFunction = null,
  userContext = null,
} = {}) => {
  // Use user context if provided, otherwise use local state
  const [localLimit, setLocalLimit] = useState(initialLimit);
  const [localUsed, setLocalUsed] = useState(initialUsed);
  const [localIsUnlimited, setLocalIsUnlimited] = useState(isUnlimited);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine if we're using user context or local state
  const useContext = userContext !== null;

  // Get values from context or local state
  const usageLimit = useContext
    ? userContext.usageLimit || initialLimit
    : localLimit;
  const usageUsed = useContext ? userContext.usageUsed || 0 : localUsed;
  const unlimited = useContext
    ? userContext.isUnlimited || false
    : localIsUnlimited;

  /**
   * Calculate remaining keywords
   * usageLeft = limit - usageUsed (or Infinity if unlimited)
   */
  const usageLeft = useMemo(() => {
    if (unlimited) {
      return Infinity;
    }
    return Math.max(0, usageLimit - usageUsed);
  }, [usageLimit, usageUsed, unlimited]);

  /**
   * Initialize usage data from fetch function
   */
  useEffect(() => {
    if (fetchFunction && !useContext) {
      const loadUsageData = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const data = await fetchFunction();

          if (data) {
            setLocalLimit(data.keywordLimit || data.limit || initialLimit);
            setLocalUsed(data.usedKeywords || data.used || initialUsed);
            setLocalIsUnlimited(
              data.isUnlimited !== undefined
                ? data.isUnlimited
                : data.keywordLimit === -1 || data.limit === -1
            );
          }
        } catch (err) {
          console.error('Error fetching usage data:', err);
          setError(err.message || 'Failed to fetch usage data');
        } finally {
          setIsLoading(false);
        }
      };

      loadUsageData();
    }
  }, [fetchFunction, useContext, initialLimit, initialUsed]);

  /**
   * Initialize from user context if provided
   */
  useEffect(() => {
    if (useContext && userContext.usageLimit !== undefined) {
      // Context values are already being used via the computed values above
      // No need to set local state
    }
  }, [useContext, userContext]);

  /**
   * Increment usage count
   * 
   * @param {number} count - Number of keywords to increment (default: 1)
   * @returns {boolean} True if increment was successful, false if limit exceeded
   */
  const incrementUsage = useCallback(
    (count = 1) => {
      if (useContext && userContext.incrementUsage) {
        // Use context's incrementUsage function
        return userContext.incrementUsage(count);
      }

      // Use local state
      setLocalUsed((prevUsed) => {
        const newUsed = prevUsed + count;

        // Check if increment would exceed limit (unless unlimited)
        if (!unlimited && newUsed > usageLimit) {
          console.warn(
            `Cannot increment usage: would exceed limit (${newUsed} > ${usageLimit})`
          );
          return prevUsed; // Don't increment
        }

        return newUsed;
      });

      return true;
    },
    [useContext, userContext, unlimited, usageLimit]
  );

  /**
   * Reset usage count
   * Sets used keywords back to 0 (for new subscription or admin action)
   * 
   * @param {number} newLimit - Optional new keyword limit (if resetting limit too)
   */
  const resetUsage = useCallback(
    (newLimit = null) => {
      if (useContext && userContext.resetUsage) {
        // Use context's resetUsage function
        return userContext.resetUsage(newLimit);
      }

      // Use local state
      if (newLimit !== null) {
        setLocalLimit(newLimit);
        setLocalIsUnlimited(newLimit === -1 || newLimit === Infinity);
      }
      setLocalUsed(0);
    },
    [useContext, userContext]
  );

  /**
   * Update usage limits manually
   * 
   * @param {Object} limits - Limits object
   * @param {number} limits.limit - New keyword limit
   * @param {number} limits.used - New used keywords
   * @param {boolean} limits.isUnlimited - Whether unlimited
   */
  const updateLimits = useCallback(
    (limits) => {
      if (useContext && userContext.updateUsageLimits) {
        // Use context's updateUsageLimits function
        return userContext.updateUsageLimits(limits);
      }

      // Use local state
      if (limits.limit !== undefined) {
        setLocalLimit(limits.limit);
      }
      if (limits.used !== undefined) {
        setLocalUsed(limits.used);
      }
      if (limits.isUnlimited !== undefined) {
        setLocalIsUnlimited(limits.isUnlimited);
      }
    },
    [useContext, userContext]
  );

  /**
   * Refresh usage data from fetch function
   */
  const refresh = useCallback(async () => {
    if (fetchFunction && !useContext) {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchFunction();

        if (data) {
          setLocalLimit(data.keywordLimit || data.limit || usageLimit);
          setLocalUsed(data.usedKeywords || data.used || usageUsed);
          setLocalIsUnlimited(
            data.isUnlimited !== undefined
              ? data.isUnlimited
              : data.keywordLimit === -1 || data.limit === -1
          );
        }
      } catch (err) {
        console.error('Error refreshing usage data:', err);
        setError(err.message || 'Failed to refresh usage data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [fetchFunction, useContext, usageLimit, usageUsed]);

  // Calculate usage percentage (for progress bars)
  const usagePercentage = useMemo(() => {
    if (unlimited || usageLimit === 0) {
      return 0;
    }
    return Math.min(100, (usageUsed / usageLimit) * 100);
  }, [usageUsed, usageLimit, unlimited]);

  // Check if usage limit is reached
  const isLimitReached = useMemo(() => {
    if (unlimited) {
      return false;
    }
    return usageUsed >= usageLimit;
  }, [usageUsed, usageLimit, unlimited]);

  // Check if usage is near limit (80% or more)
  const isNearLimit = useMemo(() => {
    if (unlimited || usageLimit === 0) {
      return false;
    }
    return usagePercentage >= 80;
  }, [usagePercentage, unlimited, usageLimit]);

  return {
    // State
    usageLimit,
    usageUsed,
    usageLeft,
    isUnlimited: unlimited,
    isLoading,
    error,

    // Computed values
    usagePercentage,
    isLimitReached,
    isNearLimit,

    // Functions
    incrementUsage,
    resetUsage,
    updateLimits,
    refresh,
  };
};

export default useUsageLimits;

/**
 * USAGE EXAMPLES:
 * 
 * 1. Basic usage with initial values:
 * 
 *    import useUsageLimits from '../hooks/useUsageLimits';
 *    
 *    function UsageCard() {
 *      const {
 *        usageUsed,
 *        usageLeft,
 *        usageLimit,
 *        isUnlimited,
 *        incrementUsage,
 *        resetUsage
 *      } = useUsageLimits({
 *        initialLimit: 1000,
 *        initialUsed: 250
 *      });
 *      
 *      return (
 *        <div>
 *          <h3>Usage Statistics</h3>
 *          <p>Used: {usageUsed.toLocaleString()}</p>
 *          <p>Remaining: {isUnlimited ? 'Unlimited' : usageLeft.toLocaleString()}</p>
 *          <p>Limit: {isUnlimited ? 'Unlimited' : usageLimit.toLocaleString()}</p>
 *          
 *          <button onClick={() => incrementUsage(10)}>
 *            Increment (+10)
 *          </button>
 *          <button onClick={resetUsage}>
 *            Reset Usage
 *          </button>
 *        </div>
 *      );
 *    }
 * 
 * 2. Usage with UserContext integration:
 * 
 *    import useUsageLimits from '../hooks/useUsageLimits';
 *    import { useUser } from '../contexts/UserContext';
 *    
 *    function Dashboard() {
 *      const userContext = useUser();
 *      
 *      const {
 *        usageUsed,
 *        usageLeft,
 *        usageLimit,
 *        incrementUsage,
 *        isLimitReached
 *      } = useUsageLimits({
 *        userContext: userContext
 *      });
 *      
 *      return (
 *        <div>
 *          <h2>My Usage</h2>
 *          <p>Used: {usageUsed} / {usageLimit}</p>
 *          <p>Remaining: {usageLeft}</p>
 *          {isLimitReached && (
 *            <p style={{ color: 'red' }}>⚠️ Limit reached!</p>
 *          )}
 *        </div>
 *      );
 *    }
 * 
 * 3. Usage with fetch function (API integration):
 * 
 *    import useUsageLimits from '../hooks/useUsageLimits';
 *    import api from '../services/api';
 *    
 *    function ToolPage() {
 *      const {
 *        usageUsed,
 *        usageLeft,
 *        usageLimit,
 *        isLoading,
 *        error,
 *        incrementUsage,
 *        refresh
 *      } = useUsageLimits({
 *        fetchFunction: async () => {
 *          const response = await api.get('/user/usage-stats');
 *          return response.data.data.current;
 *        }
 *      });
 *      
 *      if (isLoading) return <div>Loading usage...</div>;
 *      if (error) return <div>Error: {error}</div>;
 *      
 *      return (
 *        <div>
 *          <h2>Tool Usage</h2>
 *          <p>Used: {usageUsed}</p>
 *          <p>Remaining: {usageLeft}</p>
 *          <button onClick={() => incrementUsage(1)}>Use 1 Keyword</button>
 *          <button onClick={refresh}>Refresh</button>
 *        </div>
 *      );
 *    }
 * 
 * 4. Usage with progress bar (Dashboard example):
 * 
 *    import useUsageLimits from '../hooks/useUsageLimits';
 *    
 *    function Dashboard() {
 *      const {
 *        usageUsed,
 *        usageLeft,
 *        usageLimit,
 *        usagePercentage,
 *        isNearLimit,
 *        isLimitReached
 *      } = useUsageLimits({
 *        initialLimit: 5000,
 *        initialUsed: 4200
 *      });
 *      
 *      // Determine progress bar color
 *      const progressColor = isLimitReached
 *        ? '#d32f2f' // Red
 *        : isNearLimit
 *        ? '#f57c00' // Orange
 *        : '#2e7d32'; // Green
 *      
 *      return (
 *        <div>
 *          <h2>Usage Statistics</h2>
 *          
 *          <div style={{ marginBottom: '20px' }}>
 *            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
 *              <span>Used: {usageUsed.toLocaleString()}</span>
 *              <span>Remaining: {usageLeft.toLocaleString()}</span>
 *            </div>
 *            
 *            {/* Progress Bar *\/}
 *            <div style={{
 *              width: '100%',
 *              height: '24px',
 *              backgroundColor: '#e0e0e0',
 *              borderRadius: '12px',
 *              overflow: 'hidden',
 *              marginTop: '10px'
 *            }}>
 *              <div style={{
 *                width: `${usagePercentage}%`,
 *                height: '100%',
 *                backgroundColor: progressColor,
 *                transition: 'width 0.3s ease'
 *              }} />
 *            </div>
 *            
 *            <div style={{ 
 *              fontSize: '14px', 
 *              color: '#666',
 *              textAlign: 'right',
 *              marginTop: '4px'
 *            }}>
 *              {usagePercentage.toFixed(1)}% used
 *            </div>
 *          </div>
 *          
 *          {isLimitReached && (
 *            <div style={{
 *              padding: '12px',
 *              backgroundColor: '#ffebee',
 *              borderRadius: '4px',
 *              color: '#c62828'
 *            }}>
 *              ⚠️ You have reached your keyword limit. Please upgrade your subscription.
 *            </div>
 *          )}
 *        </div>
 *      );
 *    }
 * 
 * 5. Usage with unlimited subscription:
 * 
 *    function PremiumDashboard() {
 *      const {
 *        usageUsed,
 *        usageLeft,
 *        isUnlimited,
 *        incrementUsage
 *      } = useUsageLimits({
 *        initialLimit: -1, // -1 indicates unlimited
 *        initialUsed: 5000,
 *        isUnlimited: true
 *      });
 *      
 *      return (
 *        <div>
 *          <h2>Premium Usage</h2>
 *          <p>Used: {usageUsed.toLocaleString()}</p>
 *          <p>Remaining: {isUnlimited ? 'Unlimited' : usageLeft.toLocaleString()}</p>
 *          {/* No limits to worry about *\/}
 *        </div>
 *      );
 *    }
 */
