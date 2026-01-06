// Ahrefs-like tool interface page
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const Tool = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toolData, setToolData] = useState(null);
  const [usage, setUsage] = useState({
    keywordLimit: 0,
    usedKeywords: 0,
    remainingKeywords: 0,
    isUnlimited: false,
  });
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    loadToolAccess();
  }, []);

  /**
   * Load tool access from backend
   * Validates subscription and usage limits
   */
  const loadToolAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request tool access (validates subscription and limits)
      const response = await api.post('/user/tool/access');
      const { data } = response.data;

      // Set tool data
      setToolData(data);

      // Set usage information
      if (data.subscription) {
        setUsage({
          keywordLimit: data.subscription.keywordLimit,
          usedKeywords: data.subscription.usedKeywords,
          remainingKeywords: data.subscription.remainingKeywords,
          isUnlimited: data.subscription.isUnlimited,
        });
      }

      // Set branding
      if (data.branding) {
        setBranding(data.branding);
      }
    } catch (err) {
      // Handle 403 (business logic error like no subscription) differently from other errors
      if (err.response?.status === 403) {
        // 403 is a valid business response, not a critical error
        // Only log as warning, not error
        console.warn('Tool access denied:', err.response?.data?.message || 'Access forbidden');
      } else {
        // Log other errors as errors
        console.error('Error loading tool access:', err);
      }
      setError(
        err.response?.data?.message || 'Failed to load tool. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh usage stats
   */
  const refreshUsage = async () => {
    try {
      const response = await api.get('/user/usage-stats');
      const { data } = response.data;

      if (data.current) {
        setUsage({
          keywordLimit: data.current.keywordLimit,
          usedKeywords: data.current.usedKeywords,
          remainingKeywords: data.current.remainingKeywords,
          isUnlimited: data.current.isUnlimited,
        });
      }
    } catch (err) {
      console.error('Error refreshing usage:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading tool...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px'
      }}>
        <div style={{ 
          color: '#d32f2f', 
          marginBottom: '20px',
          fontSize: '18px'
        }}>
          {error}
        </div>
        <button 
          onClick={loadToolAccess}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate usage percentage
  const usagePercentage = usage.isUnlimited 
    ? 0 
    : usage.keywordLimit > 0 
      ? (usage.usedKeywords / usage.keywordLimit) * 100 
      : 0;

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>SEO Tool</h1>
          <button 
            onClick={refreshUsage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Usage
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        maxWidth: '1200px', 
        margin: '0 auto', 
        width: '100%',
        padding: '0 20px 20px'
      }}>
        {/* Usage Stats Card */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
            Usage Statistics
          </h2>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>Keywords Used:</span>
              <strong>{usage.usedKeywords.toLocaleString()}</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span>Keywords Remaining:</span>
              <strong style={{ 
                color: usage.remainingKeywords > 0 ? '#2e7d32' : '#d32f2f' 
              }}>
                {usage.isUnlimited ? 'Unlimited' : usage.remainingKeywords.toLocaleString()}
              </strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <span>Total Limit:</span>
              <strong>{usage.isUnlimited ? 'Unlimited' : usage.keywordLimit.toLocaleString()}</strong>
            </div>

            {/* Usage Progress Bar */}
            {!usage.isUnlimited && (
              <div>
                <div style={{
                  width: '100%',
                  height: '24px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: `${Math.min(usagePercentage, 100)}%`,
                    height: '100%',
                    backgroundColor: usagePercentage >= 90 ? '#d32f2f' : 
                                     usagePercentage >= 70 ? '#f57c00' : '#2e7d32',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#666',
                  textAlign: 'right'
                }}>
                  {usagePercentage.toFixed(1)}% used
                </div>
              </div>
            )}
          </div>

          {usage.remainingKeywords <= 0 && !usage.isUnlimited && (
            <div style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              color: '#c62828',
              marginTop: '16px'
            }}>
              ⚠️ You have reached your keyword limit. Please upgrade your subscription.
            </div>
          )}
        </div>

        {/* Tool Interface Placeholder */}
        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '400px'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px' }}>
            Tool Interface
          </h2>
          <p style={{ color: '#666' }}>
            Your Ahrefs-like tool interface will be displayed here.
            This is where users can input keywords, analyze data, and perform SEO research.
          </p>
          {/* Add your tool components here */}
        </div>
      </main>

      {/* Branding Footer */}
      {branding && (
        <footer style={{
          backgroundColor: '#fff',
          padding: '20px',
          marginTop: '40px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            color: '#666',
            fontSize: '14px'
          }}>
            {branding}
          </div>
        </footer>
      )}
    </div>
  );
};

export default Tool;
