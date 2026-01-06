// Reseller Admin Settings page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

/**
 * Reseller Settings Component
 * 
 * Production-ready settings page for Reseller Admins.
 * Displays account information, user limits, security settings, and system info.
 */
const ResellerSettings = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Settings state
  const [accountInfo, setAccountInfo] = useState({
    resellerName: '',
    accountStatus: 'Active',
    subscriptionStartDate: null,
    subscriptionExpiryDate: null,
  });

  const [userLimits, setUserLimits] = useState({
    totalAllowedUsers: 0,
    activeUsers: 0,
    remainingUserSlots: 0,
  });

  const [securityInfo, setSecurityInfo] = useState({
    ipRestrictionEnabled: false,
    allowedIPs: [],
  });

  const [systemInfo, setSystemInfo] = useState({
    resellerId: '',
    roleType: '',
    createdDate: null,
    lastLoginTimestamp: null,
  });

  // Mock data
  const mockAccountInfo = {
    resellerName: 'ABC Solutions',
    accountStatus: 'Active',
    subscriptionStartDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    subscriptionExpiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(),
  };

  const mockUserLimits = {
    totalAllowedUsers: 100,
    activeUsers: 47,
    remainingUserSlots: 53,
  };

  const mockSecurityInfo = {
    ipRestrictionEnabled: true,
    allowedIPs: ['192.168.1.100', '203.0.113.45', '198.51.100.22'],
  };

  const mockSystemInfo = {
    resellerId: 'RES-12345',
    roleType: 'Reseller Admin',
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    lastLoginTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  };

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use user name from auth context if available
        setAccountInfo({
          ...mockAccountInfo,
          resellerName: user?.name || mockAccountInfo.resellerName,
        });
        setUserLimits(mockUserLimits);
        setSecurityInfo(mockSecurityInfo);
        setSystemInfo(mockSystemInfo);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  /**
   * Format date to readable format
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Format timestamp to readable format
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(timestamp);
  };

  /**
   * Calculate days until expiry
   */
  const daysUntilExpiry = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Format large numbers
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { bg: '#e8f5e9', color: '#2e7d32' },
      Expired: { bg: '#ffebee', color: '#c62828' },
      Suspended: { bg: '#fff3e0', color: '#f57c00' },
      Enabled: { bg: '#e8f5e9', color: '#2e7d32' },
      Disabled: { bg: '#f5f5f5', color: '#999' },
    };
    const config = statusConfig[status] || { bg: '#f5f5f5', color: '#999' };
    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: config.bg,
          color: config.color,
        }}
      >
        {status}
      </span>
    );
  };

  // Calculate subscription status
  const subscriptionDaysRemaining = daysUntilExpiry(accountInfo.subscriptionExpiryDate);
  const isSubscriptionExpiringSoon = subscriptionDaysRemaining !== null && subscriptionDaysRemaining <= 30 && subscriptionDaysRemaining > 0;
  const isSubscriptionExpired = subscriptionDaysRemaining !== null && subscriptionDaysRemaining < 0;
  const isAccountActive = accountInfo.accountStatus === 'Active' && !isSubscriptionExpired;

  // Calculate user usage percentage
  const userUsagePercentage = userLimits.totalAllowedUsers > 0
    ? Math.round((userLimits.activeUsers / userLimits.totalAllowedUsers) * 100)
    : 0;
  const isNearUserLimit = userUsagePercentage >= 80 && userUsagePercentage < 100;

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
        }}
      >
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#c62828', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#666' }}>
            This page is only accessible to Reseller Admin users.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '20px',
        }}
      >
        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#333',
              margin: '0 0 8px 0',
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
            Manage your reseller account settings and preferences
          </p>
        </div>

        {/* Warning Banners */}
        {isSubscriptionExpiringSoon && !isSubscriptionExpired && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#fff3e0',
              border: '1px solid #ffcc80',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#f57c00',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong>Subscription Expiring Soon</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Your subscription expires in {subscriptionDaysRemaining} day{subscriptionDaysRemaining !== 1 ? 's' : ''}. Please contact Super Admin to renew.
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
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#c62828',
              }}
            >
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div style={{ flex: 1 }}>
                <strong>Subscription Expired</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  Your subscription has expired. Please contact Super Admin to restore access.
                </div>
              </div>
            </div>
          </Card>
        )}

        {isNearUserLimit && (
          <Card
            style={{
              marginBottom: '24px',
              backgroundColor: '#fff3e0',
              border: '1px solid #ffcc80',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#f57c00',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong>User Limit Nearing Capacity</strong>
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  You've used {userUsagePercentage}% of your user limit. Contact Super Admin to upgrade your plan.
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Account Overview */}
        <Card title="Account Overview" style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading account information...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Reseller Name
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {accountInfo.resellerName}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Account Status
                </div>
                <div>{getStatusBadge(accountInfo.accountStatus)}</div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Subscription Start Date
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatDate(accountInfo.subscriptionStartDate)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Subscription Expiry Date
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: isSubscriptionExpired ? '#c62828' : isSubscriptionExpiringSoon ? '#f57c00' : '#333',
                  }}
                >
                  {formatDate(accountInfo.subscriptionExpiryDate)}
                </div>
                {subscriptionDaysRemaining !== null && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: isSubscriptionExpired ? '#c62828' : isSubscriptionExpiringSoon ? '#f57c00' : '#999',
                      marginTop: '4px',
                    }}
                  >
                    {isSubscriptionExpired
                      ? 'Expired'
                      : `${subscriptionDaysRemaining} day${subscriptionDaysRemaining !== 1 ? 's' : ''} remaining`}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* User Limit Settings */}
        <Card title="User Limit Settings" style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading user limits...
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <strong>Note:</strong> User limits are set by Super Admin and cannot be modified here. Contact Super Admin to upgrade your plan.
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    Total Allowed Users
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    {formatNumber(userLimits.totalAllowedUsers)}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    Active Users
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                    {formatNumber(userLimits.activeUsers)}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    Remaining User Slots
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: userLimits.remainingUserSlots === 0 ? '#c62828' : '#f57c00',
                    }}
                  >
                    {formatNumber(userLimits.remainingUserSlots)}
                  </div>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div style={{ marginTop: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#666' }}>Usage</div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isNearUserLimit ? '#f57c00' : '#666',
                    }}
                  >
                    {userUsagePercentage}%
                  </div>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '12px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, userUsagePercentage)}%`,
                      height: '100%',
                      backgroundColor: userLimits.remainingUserSlots === 0 ? '#c62828' : isNearUserLimit ? '#f57c00' : '#1976d2',
                      borderRadius: '6px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Security & Access */}
        <Card title="Security & Access" style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading security settings...
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '20px',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <strong>IP Restrictions:</strong> IP restrictions are managed by Super Admin. If enabled, only specified IP addresses can access your account.
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                    }}
                  >
                    IP Restriction Status
                  </div>
                  <div>
                    {getStatusBadge(securityInfo.ipRestrictionEnabled ? 'Enabled' : 'Disabled')}
                  </div>
                </div>

                {securityInfo.ipRestrictionEnabled && securityInfo.allowedIPs.length > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#999',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                      }}
                    >
                      Allowed IP Addresses
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      {securityInfo.allowedIPs.map((ip, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            color: '#333',
                            border: '1px solid #e0e0e0',
                          }}
                        >
                          {ip}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Branding Shortcut */}
        <Card title="Branding Management" style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading...
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '20px',
                  lineHeight: 1.6,
                }}
              >
                Customize your white-label branding that appears on your users' dashboards and tools. Configure your company name, logo, and branding text to create a personalized experience.
              </div>
              <Button
                variant="primary"
                size="medium"
                onClick={() => navigate('/reseller/branding')}
                disabled={!isAccountActive}
              >
                Go to Branding Settings
              </Button>
            </>
          )}
        </Card>

        {/* System Information */}
        <Card title="System Information" style={{ marginBottom: '24px' }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading system information...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Reseller ID
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#333',
                    fontFamily: 'monospace',
                  }}
                >
                  {systemInfo.resellerId}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Role Type
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {systemInfo.roleType}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Created Date
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatDate(systemInfo.createdDate)}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#999',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                  }}
                >
                  Last Login
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatTimestamp(systemInfo.lastLoginTimestamp)}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card
          title="Danger Zone"
          style={{
            marginBottom: '24px',
            border: '2px solid #ffebee',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              padding: '20px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #ffcdd2',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#c62828',
                    margin: '0 0 8px 0',
                  }}
                >
                  Account Deletion Not Permitted
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Reseller accounts cannot be deleted through this interface. If you need to delete your account or make critical changes to your subscription, user limits, or security settings, please contact your Super Admin.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ResellerSettings;
