import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useBranding } from '../../../contexts/BrandingContext';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const UserDashboard = () => {
  const { user, role } = useAuth();
  const { brandingText } = useBranding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState({
    totalLimit: 1000,
    used: 250,
    remaining: 750,
    subscriptionExpiry: null,
    accountStatus: 'Active',
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = {
        totalLimit: 1000,
        used: 250,
        remaining: 750,
        subscriptionExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        accountStatus: 'Active',
      };
      
      setUsageData(mockData);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  if (role !== 'user' && role !== 'USER') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#c62828', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#666' }}>This page is only accessible to regular users.</p>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const daysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const config = status === 'Active' 
      ? { bg: '#e8f5e9', color: '#2e7d32' }
      : { bg: '#ffebee', color: '#c62828' };
    return (
      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, backgroundColor: config.bg, color: config.color }}>
        {status}
      </span>
    );
  };

  const usagePercentage = usageData.totalLimit > 0 
    ? Math.round((usageData.used / usageData.totalLimit) * 100) 
    : 0;
  const isNearLimit = usagePercentage >= 80 && usagePercentage < 100;
  const isLimitReached = usageData.remaining <= 0;
  const isAccountExpired = usageData.accountStatus === 'Expired';
  const expiryDays = daysUntilExpiry(usageData.subscriptionExpiry);
  const isExpiringSoon = expiryDays !== null && expiryDays <= 30 && expiryDays > 0;
  const isToolDisabled = isAccountExpired || isLimitReached;

  const handleOpenTool = () => {
    navigate('/user/tool');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>Dashboard</h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>
          <div>{getStatusBadge(usageData.accountStatus)}</div>
        </div>

        {isExpiringSoon && !isAccountExpired && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#fff3e0', border: '1px solid #ffcc80' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f57c00' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong>Subscription Expiring Soon</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Your subscription expires in {expiryDays} day{expiryDays !== 1 ? 's' : ''}. Please contact your administrator.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isNearLimit && !isLimitReached && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#fff3e0', border: '1px solid #ffcc80' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f57c00' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong>Usage Limit Approaching</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  You've used {usagePercentage}% of your keyword limit. {usageData.remaining} remaining.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isLimitReached && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#ffebee', border: '1px solid #ffcdd2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c62828' }}>
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div>
                <strong>Usage Limit Reached</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  You have reached your keyword limit. Please contact your administrator to upgrade.
                </div>
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <Card>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Total Limit</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
              {loading ? '...' : formatNumber(usageData.totalLimit)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Keywords</div>
          </Card>

          <Card>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Used</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: isNearLimit ? '#f57c00' : '#333' }}>
              {loading ? '...' : formatNumber(usageData.used)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Keywords</div>
          </Card>

          <Card>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Remaining</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: isLimitReached ? '#c62828' : '#2e7d32' }}>
              {loading ? '...' : formatNumber(usageData.remaining)}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Keywords</div>
          </Card>

          <Card>
            <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Expiry Date</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: isAccountExpired ? '#c62828' : isExpiringSoon ? '#f57c00' : '#333' }}>
              {loading ? '...' : formatDate(usageData.subscriptionExpiry)}
            </div>
            {expiryDays !== null && (
              <div style={{ fontSize: '12px', color: isAccountExpired ? '#c62828' : isExpiringSoon ? '#f57c00' : '#999', marginTop: '4px' }}>
                {isAccountExpired ? 'Expired' : `${expiryDays} day${expiryDays !== 1 ? 's' : ''} remaining`}
              </div>
            )}
          </Card>
        </div>

        <Card style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Usage Progress</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: isNearLimit ? '#f57c00' : isLimitReached ? '#c62828' : '#666' }}>
                {usagePercentage}%
              </div>
            </div>
            <div style={{ width: '100%', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, usagePercentage)}%`, height: '100%', backgroundColor: isLimitReached ? '#c62828' : isNearLimit ? '#f57c00' : '#11998e', borderRadius: '12px', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '8px' }}>
              {usageData.used.toLocaleString()} / {usageData.totalLimit.toLocaleString()} keywords used
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' }}>Tool Access</h2>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 24px 0' }}>
              Access the keyword research tool to analyze and track keywords
            </p>
            <Button 
              variant="primary" 
              size="large" 
              onClick={handleOpenTool}
              disabled={isToolDisabled}
              style={{ minWidth: '200px' }}
            >
              Open Tool
            </Button>
            {isToolDisabled && (
              <p style={{ fontSize: '14px', color: '#999', marginTop: '12px' }}>
                {isAccountExpired ? 'Tool access is disabled due to expired account.' : 'Tool access is disabled. Usage limit reached.'}
              </p>
            )}
          </div>
        </Card>

        {brandingText && (
          <div style={{ textAlign: 'center', marginTop: '32px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
              {brandingText.toLowerCase().includes('service by') ? brandingText : `Service by ${brandingText}`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
