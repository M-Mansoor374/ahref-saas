// Enhanced Reseller Admin Dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useBranding } from '../../../contexts/BrandingContext';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import dashboardService from '../../../services/dashboardService';
import resellerService from '../../../services/resellerService';

/**
 * Enhanced Reseller Dashboard Component
 * 
 * Beautiful, modern dashboard with real API integration
 * Displays overview statistics, user management, and quick actions
 */
const ResellerDashboard = () => {
  const { user, role } = useAuth();
  const { brandingText } = useBranding();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    maxUsers: 0,
    remainingUserSlots: 0,
    isUnlimited: false,
    subscriptionExpiryDate: null,
    accountStatus: 'Active',
    brandingConfigured: false,
    expiredSubscriptions: 0,
    activeSubscriptions: 0,
  });

  // Recent users state
  const [recentUsers, setRecentUsers] = useState([]);

  /**
   * Load dashboard data from API
   */
  const loadDashboardData = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch dashboard data
      const dashboardResponse = await dashboardService.getDashboardData(role);
      const dashboardData = dashboardResponse.data;

      // Extract statistics
      const userStats = dashboardData.statistics?.users || {};
      const subscriptionStats = dashboardData.statistics?.subscriptions || {};

      // Calculate values
      const maxUsers = userStats.maxUsers === 'Unlimited' ? -1 : (userStats.maxUsers || 0);
      const remaining = userStats.remaining === 'Unlimited' ? -1 : (userStats.remaining || 0);
      const totalUsers = userStats.total || 0;
      const activeUsers = userStats.active || 0;

      // Get user's subscription expiry (if available)
      let subscriptionExpiryDate = null;
      if (user?.expiryDate) {
        subscriptionExpiryDate = user.expiryDate;
      }

      // Check branding status
      const brandingConfigured = !!(dashboardData.branding || brandingText);

      // Set stats
      setStats({
        totalUsers,
        activeUsers,
        maxUsers: maxUsers === -1 ? 999999 : maxUsers,
        remainingUserSlots: remaining === -1 ? 999999 : remaining,
        isUnlimited: maxUsers === -1 || remaining === -1,
        subscriptionExpiryDate,
        accountStatus: user?.status === 'active' ? 'Active' : 'Inactive',
        brandingConfigured,
        expiredSubscriptions: subscriptionStats.expired || 0,
        activeSubscriptions: subscriptionStats.active || 0,
      });

      // Set recent users
      if (dashboardData.recentUsers && Array.isArray(dashboardData.recentUsers)) {
        setRecentUsers(
          dashboardData.recentUsers.map((u) => ({
            id: u.id || u._id,
            name: u.name || u.email?.split('@')[0] || 'User',
            email: u.email || 'N/A',
            status: u.isActive ? 'Active' : u.subscription?.isExpired ? 'Expired' : 'Inactive',
            startDate: u.subscription?.startDate || null,
            expiryDate: u.subscription?.expiryDate || null,
          }))
        );
      } else {
        setRecentUsers([]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, brandingText]);

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  /**
   * Calculate days until expiry
   */
  const daysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  /**
   * Format large numbers
   */
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  /**
   * Calculate usage percentage
   */
  const calculateUsagePercentage = (used, limit) => {
    if (!limit || limit === 0) return 0;
    if (limit >= 999999) return 0; // Unlimited
    return Math.min(100, Math.round((used / limit) * 100));
  };

  /**
   * Get status badge with beautiful styling
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { bg: '#e8f5e9', color: '#2e7d32', icon: '✓' },
      Inactive: { bg: '#ffebee', color: '#c62828', icon: '✗' },
      Expired: { bg: '#fff3e0', color: '#f57c00', icon: '⚠' },
      Suspended: { bg: '#f3e5f5', color: '#7b1fa2', icon: '⏸' },
    };
    const config = statusConfig[status] || { bg: '#f5f5f5', color: '#999', icon: '•' };
    return (
      <span
        style={{
          padding: '6px 14px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 600,
          backgroundColor: config.bg,
          color: config.color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <span>{config.icon}</span>
        {status}
      </span>
    );
  };

  // Calculate derived values
  const subscriptionDaysRemaining = daysUntilExpiry(stats.subscriptionExpiryDate);
  const isSubscriptionExpiringSoon = subscriptionDaysRemaining !== null && subscriptionDaysRemaining <= 30 && subscriptionDaysRemaining > 0;
  const isSubscriptionExpired = subscriptionDaysRemaining !== null && subscriptionDaysRemaining < 0;
  const isAccountActive = stats.accountStatus === 'Active' && !isSubscriptionExpired;

  // Calculate user usage percentage
  const userUsagePercentage = calculateUsagePercentage(stats.totalUsers, stats.maxUsers);
  const isNearUserLimit = userUsagePercentage >= 80 && userUsagePercentage < 100;
  const isUserLimitReached = userUsagePercentage >= 100;

  // Table columns for recent users
  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (value) => {
        const days = daysUntilExpiry(value);
        const isExpired = days !== null && days < 0;
        const isExpiringSoon = days !== null && days <= 30 && days > 0;
        return (
          <div>
            <div style={{ color: isExpired ? '#c62828' : isExpiringSoon ? '#f57c00' : '#666', fontSize: '14px' }}>
              {formatDate(value)}
            </div>
            {days !== null && (
              <div
                style={{
                  fontSize: '11px',
                  color: isExpired ? '#c62828' : isExpiringSoon ? '#f57c00' : '#999',
                  marginTop: '4px',
                }}
              >
                {isExpired ? 'Expired' : `${days} day${days !== 1 ? 's' : ''} left`}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  // Check if user is Reseller Admin
  if (role !== 'RESELLER' && role !== 'reseller' && role !== 'reseller_admin') {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
          <h2 style={{ color: '#c62828', marginBottom: '16px', fontSize: '24px' }}>Access Denied</h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            This page is only accessible to Reseller Admin users.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          />
          <div style={{ color: '#666', fontSize: '16px' }}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          padding: '24px',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Reseller Dashboard
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Welcome back, <strong>{user?.name || user?.email || 'Reseller Admin'}</strong>! Here's your account overview.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {getStatusBadge(stats.accountStatus)}
            {isSubscriptionExpired && (
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🚨</span>
                Subscription Expired
              </span>
            )}
            <Button
              variant="outline"
              size="small"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              style={{ minWidth: '100px' }}
            >
              {refreshing ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#ffebee',
              border: '1px solid #ffcdd2',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c62828' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <strong>Error loading dashboard</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>{error}</div>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => loadDashboardData()}
                  style={{ marginTop: '12px' }}
                >
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts & Warnings */}
        {isSubscriptionExpiringSoon && !isSubscriptionExpired && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#fff3e0',
              border: '1px solid #ffcc80',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(245, 124, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#f57c00' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                  Subscription Expiring Soon
                </strong>
                <div style={{ fontSize: '14px' }}>
                  Your subscription expires in <strong>{subscriptionDaysRemaining} day{subscriptionDaysRemaining !== 1 ? 's' : ''}</strong>. Please renew to avoid service interruption.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isSubscriptionExpired && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#ffebee',
              border: '1px solid #ffcdd2',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(198, 40, 40, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#c62828' }}>
              <span style={{ fontSize: '28px' }}>🚨</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                  Subscription Expired
                </strong>
                <div style={{ fontSize: '14px' }}>
                  Your subscription has expired. Please renew immediately to restore access.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isNearUserLimit && !isUserLimitReached && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#fff3e0',
              border: '1px solid #ffcc80',
              padding: '20px',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#f57c00' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                  User Limit Nearing Capacity
                </strong>
                <div style={{ fontSize: '14px' }}>
                  You've used <strong>{userUsagePercentage}%</strong> of your user limit ({formatNumber(stats.totalUsers)} of {stats.isUnlimited ? 'Unlimited' : formatNumber(stats.maxUsers)} users). Consider upgrading your plan.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isUserLimitReached && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#ffebee',
              border: '1px solid #ffcdd2',
              padding: '20px',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#c62828' }}>
              <span style={{ fontSize: '28px' }}>🚨</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                  User Limit Reached
                </strong>
                <div style={{ fontSize: '14px' }}>
                  You've reached your maximum user limit ({formatNumber(stats.maxUsers)} users). Upgrade your plan to add more users.
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Overview Cards - Enhanced Design */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {/* Total Users Card */}
          <Card
            style={{
              padding: '28px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Total Users
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: 1,
              }}
            >
              {formatNumber(stats.totalUsers)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              of {stats.isUnlimited ? 'Unlimited' : formatNumber(stats.maxUsers)} allowed
            </div>
          </Card>

          {/* Active Users Card */}
          <Card
            style={{
              padding: '28px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(17, 153, 142, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Active Users
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: 1,
              }}
            >
              {formatNumber(stats.activeUsers)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              {stats.totalUsers > 0
                ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active`
                : 'No users yet'}
            </div>
          </Card>

          {/* Remaining User Slots Card */}
          <Card
            style={{
              padding: '28px',
              background: stats.remainingUserSlots === 0 || isUserLimitReached
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: stats.remainingUserSlots === 0 || isUserLimitReached
                ? '0 4px 20px rgba(245, 87, 108, 0.3)'
                : '0 4px 20px rgba(250, 112, 154, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Remaining Slots
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: 1,
              }}
            >
              {stats.isUnlimited ? '∞' : formatNumber(stats.remainingUserSlots)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              {stats.remainingUserSlots === 0 ? 'Limit reached' : 'Available slots'}
            </div>
          </Card>

          {/* Subscription Expiry Card */}
          <Card
            style={{
              padding: '28px',
              background: isSubscriptionExpired
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : isSubscriptionExpiringSoon
                ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: isSubscriptionExpired
                ? '0 4px 20px rgba(245, 87, 108, 0.3)'
                : isSubscriptionExpiringSoon
                ? '0 4px 20px rgba(250, 112, 154, 0.3)'
                : '0 4px 20px rgba(79, 172, 254, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Subscription Expiry
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: 1.2,
              }}
            >
              {formatDate(stats.subscriptionExpiryDate)}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              {subscriptionDaysRemaining !== null
                ? isSubscriptionExpired
                  ? 'Expired'
                  : `${subscriptionDaysRemaining} day${subscriptionDaysRemaining !== 1 ? 's' : ''} remaining`
                : 'N/A'}
            </div>
          </Card>

          {/* Branding Status Card */}
          <Card
            style={{
              padding: '28px',
              background: stats.brandingConfigured
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                : 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
              color: 'white',
              borderRadius: '16px',
              boxShadow: stats.brandingConfigured
                ? '0 4px 20px rgba(17, 153, 142, 0.3)'
                : '0 4px 20px rgba(44, 62, 80, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '12px',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Branding Status
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '8px',
                lineHeight: 1,
              }}
            >
              {stats.brandingConfigured ? '✓' : '—'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>
              {stats.brandingConfigured ? 'Configured' : 'Not Configured'}
            </div>
          </Card>
        </div>

        {/* Usage Overview - Enhanced */}
        <Card
          title="User Usage Overview"
          style={{
            marginBottom: '32px',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>
                  Users Used
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#333',
                  }}
                >
                  {formatNumber(stats.totalUsers)} / {stats.isUnlimited ? 'Unlimited' : formatNumber(stats.maxUsers)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '6px', fontWeight: 500 }}>
                  Usage Percentage
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: isUserLimitReached
                      ? '#c62828'
                      : isNearUserLimit
                      ? '#f57c00'
                      : '#2e7d32',
                  }}
                >
                  {userUsagePercentage}%
                </div>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '32px',
                backgroundColor: '#e8eaf6',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, userUsagePercentage)}%`,
                  height: '100%',
                  background: isUserLimitReached
                    ? 'linear-gradient(90deg, #f5576c 0%, #f093fb 100%)'
                    : isNearUserLimit
                    ? 'linear-gradient(90deg, #fee140 0%, #fa709a 100%)'
                    : 'linear-gradient(90deg, #38ef7d 0%, #11998e 100%)',
                  borderRadius: '16px',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              />
              {userUsagePercentage > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${Math.min(100, userUsagePercentage)}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    border: '2px solid',
                    borderColor: isUserLimitReached
                      ? '#f5576c'
                      : isNearUserLimit
                      ? '#fa709a'
                      : '#11998e',
                  }}
                />
              )}
            </div>

            <div
              style={{
                fontSize: '13px',
                color: '#999',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {stats.remainingUserSlots > 0 && !stats.isUnlimited
                ? `${formatNumber(stats.remainingUserSlots)} user slot${stats.remainingUserSlots !== 1 ? 's' : ''} remaining`
                : stats.isUnlimited
                ? 'Unlimited user slots available'
                : 'User limit reached'}
            </div>
          </div>
        </Card>

        {/* Quick Actions - Enhanced */}
        <Card
          title="Quick Actions"
          style={{
            marginBottom: '32px',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            <Button
              variant="primary"
              size="medium"
              onClick={() => navigate('/reseller/users')}
              disabled={!isAccountActive || isUserLimitReached}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '12px',
                boxShadow: !isAccountActive || isUserLimitReached ? 'none' : '0 4px 12px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              ➕ Add New User
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={() => navigate('/reseller/users')}
              disabled={!isAccountActive}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              👥 Manage Users
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={() => navigate('/reseller/branding')}
              disabled={!isAccountActive}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              🎨 Branding Settings
            </Button>
            <Button
              variant="outline"
              size="medium"
              onClick={() => navigate('/reseller/settings')}
              disabled={!isAccountActive}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '12px',
              }}
            >
              ⚙️ Subscription Details
            </Button>
          </div>
        </Card>

        {/* Recent Users Table - Enhanced */}
        <Card
          title="Recent Users"
          style={{
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {recentUsers.length === 0 ? (
            <div
              style={{
                padding: '60px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                No users found
              </div>
              <div style={{ fontSize: '14px' }}>Get started by adding your first user.</div>
              <Button
                variant="primary"
                size="medium"
                onClick={() => navigate('/reseller/users')}
                disabled={!isAccountActive || isUserLimitReached}
                style={{ marginTop: '20px' }}
              >
                Add First User
              </Button>
            </div>
          ) : (
            <Table columns={userColumns} data={recentUsers} striped hover />
          )}
        </Card>
      </main>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ResellerDashboard;
