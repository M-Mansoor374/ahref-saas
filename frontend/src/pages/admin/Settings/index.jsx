// Super Admin Settings page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import adminService from '../../../services/adminService';

/**
 * Super Admin Settings Component
 * 
 * Comprehensive settings panel for Super Admin users.
 * Manages general settings, usage limits, security, and displays system info.
 */
const AdminSettings = () => {
  const { user, role, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    platformName: '',
    defaultBrandingText: '',
  });
  const [generalErrors, setGeneralErrors] = useState({});

  // Usage & Limits Settings
  const [usageSettings, setUsageSettings] = useState({
    defaultUserKeywordLimit: '',
    defaultResellerKeywordLimit: '',
  });
  const [usageErrors, setUsageErrors] = useState({});

  // Security & Access Settings
  const [securitySettings, setSecuritySettings] = useState({
    ipRestrictionEnabled: false,
    cookieSessionUpdatesEnabled: false,
  });

  // System Info (Read-only)
  const [systemInfo, setSystemInfo] = useState({
    adminRole: '',
    environment: '',
    lastUpdated: null,
  });


  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load settings on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadSettings = async () => {
      setLoading(true);
      try {
        const result = await adminService.getSettings();
        
        if (isMounted && result.success && result.data) {
          const settings = result.data;
          setGeneralSettings(settings.general || { platformName: '', defaultBrandingText: '' });
          setUsageSettings(settings.usage || { defaultUserKeywordLimit: '', defaultResellerKeywordLimit: '' });
          setSecuritySettings(settings.security || { ipRestrictionEnabled: false, cookieSessionUpdatesEnabled: false });
          setSystemInfo(settings.system || { adminRole: '', environment: '', lastUpdated: null });
        } else {
          // Use empty defaults if API fails
          setGeneralSettings({ platformName: '', defaultBrandingText: '' });
          setUsageSettings({ defaultUserKeywordLimit: '', defaultResellerKeywordLimit: '' });
          setSecuritySettings({ ipRestrictionEnabled: false, cookieSessionUpdatesEnabled: false });
          setSystemInfo({ adminRole: '', environment: '', lastUpdated: null });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load settings:', error);
          // Use empty defaults on error
          setGeneralSettings({ platformName: '', defaultBrandingText: '' });
          setUsageSettings({ defaultUserKeywordLimit: '', defaultResellerKeywordLimit: '' });
          setSecuritySettings({ ipRestrictionEnabled: false, cookieSessionUpdatesEnabled: false });
          setSystemInfo({ adminRole: '', environment: '', lastUpdated: null });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Validate general settings
  const validateGeneralSettings = () => {
    const errors = {};

    if (!generalSettings.platformName.trim()) {
      errors.platformName = 'Platform name is required';
    }

    if (!generalSettings.defaultBrandingText.trim()) {
      errors.defaultBrandingText = 'Default branding text is required';
    }

    setGeneralErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate usage settings
  const validateUsageSettings = () => {
    const errors = {};

    const userLimit = parseInt(usageSettings.defaultUserKeywordLimit);
    const resellerLimit = parseInt(usageSettings.defaultResellerKeywordLimit);

    if (!usageSettings.defaultUserKeywordLimit.trim()) {
      errors.defaultUserKeywordLimit = 'Default user keyword limit is required';
    } else if (isNaN(userLimit) || userLimit < 1) {
      errors.defaultUserKeywordLimit = 'Must be a number greater than 0';
    }

    if (!usageSettings.defaultResellerKeywordLimit.trim()) {
      errors.defaultResellerKeywordLimit = 'Default reseller keyword limit is required';
    } else if (isNaN(resellerLimit) || resellerLimit < 1) {
      errors.defaultResellerKeywordLimit = 'Must be a number greater than 0';
    } else if (resellerLimit < userLimit) {
      errors.defaultResellerKeywordLimit = 'Reseller limit should be greater than or equal to user limit';
    }

    setUsageErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle general settings input change
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
    if (generalErrors[name]) {
      setGeneralErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle usage settings input change
  const handleUsageChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setUsageSettings((prev) => ({ ...prev, [name]: value }));
      if (usageErrors[name]) {
        setUsageErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  // Handle security toggle
  const handleSecurityToggle = (setting) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Save general settings
  const handleSaveGeneral = async () => {
    if (!validateGeneralSettings()) {
      return;
    }

    try {
      setSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update system info
      setSystemInfo((prev) => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));

      showNotification('General settings saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save general settings', 'error');
      console.error('Save general settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save usage settings
  const handleSaveUsage = async () => {
    if (!validateUsageSettings()) {
      return;
    }

    try {
      setSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update system info
      setSystemInfo((prev) => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));

      showNotification('Usage & limits settings saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save usage settings', 'error');
      console.error('Save usage settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save security settings
  const handleSaveSecurity = async () => {
    try {
      setSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update system info
      setSystemInfo((prev) => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
      }));

      showNotification('Security & access settings saved successfully', 'success');
    } catch (error) {
      showNotification('Failed to save security settings', 'error');
      console.error('Save security settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Wait for auth to load before checking role
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#11998e',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Check if user is Super Admin (normalize role for comparison)
  // Check role from multiple sources: useAuth hook, user object, and localStorage
  const userRole = role || user?.role || localStorage.getItem('userRole') || '';
  const normalizedRole = userRole?.toLowerCase() || '';
  
  if (normalizedRole !== 'super_admin') {
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
            This page is only accessible to Super Admin users.
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
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Page Title */}
        <div
          style={{
            marginBottom: '24px',
          }}
        >
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
            Manage platform settings and configuration
          </p>
        </div>

        {/* Notification */}
        {notification.show && (
          <div
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              borderRadius: '4px',
              backgroundColor: notification.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: notification.type === 'success' ? '#2e7d32' : '#c62828',
              border: `1px solid ${notification.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 8px',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* General Settings */}
        <Card title="General Settings">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading settings...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                type="text"
                name="platformName"
                label="Platform Name"
                value={generalSettings.platformName}
                onChange={handleGeneralChange}
                placeholder="Enter platform name"
                required
                error={generalErrors.platformName}
                disabled={saving}
              />

              <Input
                type="text"
                name="defaultBrandingText"
                label="Default Branding Text"
                value={generalSettings.defaultBrandingText}
                onChange={handleGeneralChange}
                placeholder="e.g., Service by XYZ"
                required
                error={generalErrors.defaultBrandingText}
                disabled={saving}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={handleSaveGeneral}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Usage & Limits Settings */}
        <Card title="Usage & Limits Settings">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading settings...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Input
                type="text"
                name="defaultUserKeywordLimit"
                label="Default Keyword Limit for New Users"
                value={usageSettings.defaultUserKeywordLimit}
                onChange={handleUsageChange}
                placeholder="e.g., 1000"
                required
                error={usageErrors.defaultUserKeywordLimit}
                disabled={saving}
              />

              <Input
                type="text"
                name="defaultResellerKeywordLimit"
                label="Default Keyword Limit for Resellers"
                value={usageSettings.defaultResellerKeywordLimit}
                onChange={handleUsageChange}
                placeholder="e.g., 10000"
                required
                error={usageErrors.defaultResellerKeywordLimit}
                disabled={saving}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={handleSaveUsage}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Security & Access Settings */}
        <Card title="Security & Access Settings">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading settings...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* IP Restriction Toggle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  borderRadius: '4px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#333', marginBottom: '4px' }}>
                    IP Restriction
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Enable/disable IP restriction globally
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: securitySettings.ipRestrictionEnabled ? '#2e7d32' : '#999',
                      fontWeight: 500,
                    }}
                  >
                    Status: {securitySettings.ipRestrictionEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '26px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={securitySettings.ipRestrictionEnabled}
                    onChange={() => handleSecurityToggle('ipRestrictionEnabled')}
                    disabled={saving}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: securitySettings.ipRestrictionEnabled
                        ? '#1976d2'
                        : '#ccc',
                      borderRadius: '26px',
                      transition: 'background-color 0.3s',
                      pointerEvents: saving ? 'none' : 'auto',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        transition: 'transform 0.3s',
                        transform: securitySettings.ipRestrictionEnabled
                          ? 'translateX(24px)'
                          : 'translateX(0)',
                      }}
                    />
                  </span>
                </label>
              </div>

              {/* Cookie Session Updates Toggle */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#fafafa',
                  borderRadius: '4px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#333', marginBottom: '4px' }}>
                    Cookie-Based Session Updates
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Enable/disable cookie-based session updates
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: securitySettings.cookieSessionUpdatesEnabled ? '#2e7d32' : '#999',
                      fontWeight: 500,
                    }}
                  >
                    Status: {securitySettings.cookieSessionUpdatesEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <label
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '50px',
                    height: '26px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={securitySettings.cookieSessionUpdatesEnabled}
                    onChange={() => handleSecurityToggle('cookieSessionUpdatesEnabled')}
                    disabled={saving}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: securitySettings.cookieSessionUpdatesEnabled
                        ? '#1976d2'
                        : '#ccc',
                      borderRadius: '26px',
                      transition: 'background-color 0.3s',
                      pointerEvents: saving ? 'none' : 'auto',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        content: '""',
                        height: '20px',
                        width: '20px',
                        left: '3px',
                        bottom: '3px',
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        transition: 'transform 0.3s',
                        transform: securitySettings.cookieSessionUpdatesEnabled
                          ? 'translateX(24px)'
                          : 'translateX(0)',
                      }}
                    />
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={handleSaveSecurity}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* System Info */}
        <Card title="System Information">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              Loading system info...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
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
                  Current Admin Role
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {systemInfo.adminRole}
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
                  Environment
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {systemInfo.environment}
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
                  Last Updated
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatDate(systemInfo.lastUpdated)}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
