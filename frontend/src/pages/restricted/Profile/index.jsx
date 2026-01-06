import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import useRestrictions from '../../../hooks/useRestrictions';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

const Profile = () => {
  const auth = useAuth();
  const { user, role } = auth;
  const navigate = useNavigate();
  const { canAccess, redirectToDashboard, getDashboardPath } = useRestrictions({ authHook: auth, page: 'profile' });
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: '',
    accountStatus: '',
    createdDate: null,
    lastLogin: null,
  });

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockData = {
        name: user?.name || 'N/A',
        email: user?.email || 'N/A',
        role: role || 'N/A',
        accountStatus: 'Active',
        createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      };
      
      setProfileData(mockData);
      setLoading(false);
    };

    if (user || role) {
      loadProfile();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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

  const formatRole = (roleStr) => {
    if (!roleStr) return 'N/A';
    return roleStr
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  if (!canAccess && role === 'user') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <Card style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' }}>
                Profile Management Restricted
              </h1>
              <p style={{ fontSize: '16px', color: '#666', margin: '0 0 8px 0', lineHeight: 1.6 }}>
                Profile management is restricted by the system administrator.
              </p>
              <p style={{ fontSize: '14px', color: '#999', margin: 0, lineHeight: 1.6 }}>
                Regular users are not permitted to edit or manage profile information. This restriction helps maintain system security and data integrity.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary" onClick={() => navigate(getDashboardPath(role))}>
                Go to Dashboard
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
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>Profile</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>View your account information</p>
        </div>

        <Card>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading profile information...</div>
          ) : (
            <div style={{ display: 'grid', gap: '24px' }}>
              <div style={{ padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: '#666', margin: '0 0 12px 0', lineHeight: 1.6 }}>
                  <strong>Note:</strong> Profile editing is restricted. Contact your system administrator to update your profile information.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Name</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{profileData.name}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Email</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{profileData.email}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Role</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{formatRole(profileData.role)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Account Status</div>
                  <div>{getStatusBadge(profileData.accountStatus)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Created Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{formatDate(profileData.createdDate)}</div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Last Login</div>
                  <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>{formatTimestamp(profileData.lastLogin)}</div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Profile;
