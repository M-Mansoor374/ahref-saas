import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import useRestrictions from '../../../hooks/useRestrictions';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const Settings = () => {
  const auth = useAuth();
  const { user, role } = auth;
  const navigate = useNavigate();
  const { canAccess, redirectToDashboard, getDashboardPath } = useRestrictions({ authHook: auth, page: 'settings' });
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState({
    accountStatus: '',
    roleType: '',
    subscriptionState: '',
    systemPermissions: [],
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockPermissions = role === 'super_admin' || role === 'SUPER_ADMIN'
        ? ['User Management', 'Reseller Management', 'System Configuration', 'IP Management', 'Branding Control']
        : ['User Management', 'Branding Control', 'Account Settings'];
      
      const mockData = {
        accountStatus: 'Active',
        roleType: role || 'N/A',
        subscriptionState: role === 'super_admin' || role === 'SUPER_ADMIN' ? 'Unlimited' : 'Active',
        systemPermissions: mockPermissions,
      };
      
      setSettingsData(mockData);
      setLoading(false);
    };

    if (user || role) {
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (!canAccess && role === 'user') {
      const timer = setTimeout(() => {
        redirectToDashboard();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [canAccess, role, redirectToDashboard]);

  const formatRole = (roleStr) => {
    if (!roleStr) return 'N/A';
    return roleStr
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getStatusBadge = (status) => {
    const config = status === 'Active' || status === 'Unlimited'
      ? { bg: '#e8f5e9', color: '#2e7d32' }
      : { bg: '#ffebee', color: '#c62828' };
    return (
      <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 500, backgroundColor: config.bg, color: config.color }}>
        {status}
      </span>
    );
  };

  if (!canAccess && role === 'user') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' }}>
                Settings Access Restricted
              </h1>
              <p style={{ fontSize: '16px', color: '#666', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                Access to system settings is restricted by the administrator.
              </p>
              <p style={{ fontSize: '14px', color: '#999', margin: 0, lineHeight: 1.6 }}>
                Regular users are not permitted to access or modify system settings. This restriction helps maintain system security and prevents unauthorized configuration changes.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary" onClick={() => navigate(getDashboardPath(role))}>
                Return to Dashboard
              </Button>
              <p style={{ fontSize: '12px', color: '#999', margin: '8px 0 0 0' }}>
                Redirecting automatically in 5 seconds...
              </p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>Settings</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>View your account and system settings</p>
        </div>

        <Card>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading settings information...</div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: 1.6 }}>
                  <strong>Note:</strong> Settings editing is restricted. Contact your system administrator to modify account or system settings.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Account Status</div>
                  <div>{getStatusBadge(settingsData.accountStatus)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Role Type</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{formatRole(settingsData.roleType)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Subscription State</div>
                  <div>{getStatusBadge(settingsData.subscriptionState)}</div>
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>System Permissions Summary</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {settingsData.systemPermissions.length > 0 ? (
                    settingsData.systemPermissions.map((permission, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#e3f2fd',
                          borderRadius: '4px',
                          fontSize: '14px',
                          color: '#1976d2',
                          border: '1px solid #bbdefb',
                        }}
                      >
                        {permission}
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '14px', color: '#999' }}>No permissions assigned</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Settings;
