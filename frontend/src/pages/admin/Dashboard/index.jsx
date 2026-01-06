import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import dashboardService from '../../../services/dashboardService';

const AdminDashboard = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalResellers: 0,
    remainingKeywords: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    totalIPs: 0,
    activeIPs: 0,
    systemHealth: 100,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  const mockActivity = [
    { id: 1, user: 'john.doe@example.com', action: 'Keyword Analysis', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'Success' },
    { id: 2, user: 'jane.smith@example.com', action: 'Backlink Check', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'Success' },
    { id: 3, user: 'reseller@example.com', action: 'User Created', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Success' },
    { id: 4, user: 'admin@example.com', action: 'Reseller Added', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'Success' },
    { id: 5, user: 'user@example.com', action: 'Subscription Renewed', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'Success' },
    { id: 6, user: 'test@example.com', action: 'Keyword Analysis', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), status: 'Failed' },
  ];

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const result = await dashboardService.getDashboardData(role || 'super_admin');
        
        if (isMounted && result.success && result.data) {
          const dashboardData = result.data;
          setStats({
            totalUsers: dashboardData.statistics?.users?.total || 150,
            activeUsers: dashboardData.statistics?.users?.active || 120,
            totalResellers: dashboardData.statistics?.resellers?.total || 25,
            remainingKeywords: dashboardData.statistics?.keywords?.remaining || 0,
            newUsersToday: dashboardData.statistics?.users?.newToday || 12,
            newUsersThisWeek: dashboardData.statistics?.users?.newThisWeek || 48,
            totalIPs: dashboardData.statistics?.ips?.total || 45,
            activeIPs: dashboardData.statistics?.ips?.active || 38,
            systemHealth: dashboardData.statistics?.system?.health || 98,
            totalRevenue: dashboardData.statistics?.revenue?.total || 125000,
            monthlyRevenue: dashboardData.statistics?.revenue?.monthly || 15000,
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load dashboard data:', err);
          setError('');
          setStats({
            totalUsers: 150,
            activeUsers: 120,
            totalResellers: 25,
            remainingKeywords: 0,
            newUsersToday: 12,
            newUsersThisWeek: 48,
            totalIPs: 45,
            activeIPs: 38,
            systemHealth: 98,
            totalRevenue: 125000,
            monthlyRevenue: 15000,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [role]);

  const formatTimestamp = (timestamp) => {
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
    return date.toLocaleDateString();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);
  };

  const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const activityColumns = [
    {
      key: 'user',
      label: 'User',
      render: (value) => (
        <span style={{ fontWeight: 500, color: '#333' }}>{value}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
    },
    {
      key: 'timestamp',
      label: 'Time',
      render: (value) => (
        <span style={{ color: '#999', fontSize: '13px' }}>
          {formatTimestamp(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value) => (
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: value === 'Success' ? '#e8f5e9' : '#ffebee',
            color: value === 'Success' ? '#2e7d32' : '#c62828',
          }}
        >
          {value}
        </span>
      ),
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, and manage user accounts',
      icon: '👥',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      path: '/admin/users',
    },
    {
      title: 'Manage Resellers',
      description: 'Create and manage reseller accounts',
      icon: '🏢',
      gradient: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
      path: '/admin/resellers',
    },
    {
      title: 'IP Management',
      description: 'Configure IP whitelisting and restrictions',
      icon: '🌐',
      gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
      path: '/admin/ip-management',
    },
    {
      title: 'Settings',
      description: 'Configure platform settings and preferences',
      icon: '⚙️',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: '/admin/settings',
    },
  ];

  const userActivityPercentage = calculatePercentage(stats.activeUsers, stats.totalUsers);
  const ipUsagePercentage = calculatePercentage(stats.activeIPs, stats.totalIPs);

  return (
    <div style={{ width: '100%', minHeight: '100%', paddingBottom: '40px' }}>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          padding: '50px 30px',
          color: 'white',
          boxShadow: '0 8px 32px rgba(17, 153, 142, 0.3)',
          marginBottom: '40px',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200px', height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(-30%, 30%)' }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 12px 0', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                🎯 Super Admin Dashboard
              </h1>
              <p style={{ fontSize: '20px', margin: 0, opacity: 0.95 }}>
                Welcome back, {user?.name || 'Admin'}! Here's your platform overview.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>System Health</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '4px' }}>
                  {loading ? '...' : `${stats.systemHealth}%`}
                </div>
              </div>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                {stats.systemHealth >= 95 ? '✅' : stats.systemHealth >= 80 ? '⚠️' : '🔴'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Primary Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <Card
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(17, 153, 142, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(17, 153, 142, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(17, 153, 142, 0.3)';
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/admin/users');
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px' }}>👥</div>
              <div style={{ fontSize: '14px', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                +{stats.newUsersToday} today
              </div>
            </div>
            <div style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '8px' }}>
              {loading ? '...' : formatNumber(stats.totalUsers)}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Total Users
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${userActivityPercentage}%`, background: 'white', borderRadius: '2px', transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              {userActivityPercentage}% Active
            </div>
          </Card>

          <Card
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0, 176, 155, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 176, 155, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 176, 155, 0.3)';
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/admin/users');
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <div style={{ fontSize: '14px', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                {userActivityPercentage}%
              </div>
            </div>
            <div style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '8px' }}>
              {loading ? '...' : formatNumber(stats.activeUsers)}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Active Users
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {stats.totalUsers - stats.activeUsers} inactive
            </div>
          </Card>

          <Card
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(86, 171, 47, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(86, 171, 47, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(86, 171, 47, 0.3)';
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/admin/resellers');
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px' }}>🏢</div>
              <div style={{ fontSize: '14px', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                Active
              </div>
            </div>
            <div style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '8px' }}>
              {loading ? '...' : formatNumber(stats.totalResellers)}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Total Resellers
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Managing {stats.totalUsers} users
            </div>
          </Card>

          <Card
            style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 24px rgba(67, 233, 123, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(67, 233, 123, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(67, 233, 123, 0.3)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px' }}>💰</div>
              <div style={{ fontSize: '14px', opacity: 0.9, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px' }}>
                Monthly
              </div>
            </div>
            <div style={{ fontSize: '52px', fontWeight: 'bold', marginBottom: '8px' }}>
              {loading ? '...' : formatCurrency(stats.monthlyRevenue)}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Monthly Revenue
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Total: {formatCurrency(stats.totalRevenue)}
            </div>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <Card style={{ padding: '24px', textAlign: 'center', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {loading ? '...' : formatNumber(stats.newUsersThisWeek)}
            </div>
            <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              New This Week
            </div>
          </Card>

          <Card style={{ padding: '24px', textAlign: 'center', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {loading ? '...' : formatNumber(stats.totalIPs)}
            </div>
            <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total IPs
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {stats.activeIPs} active ({ipUsagePercentage}%)
            </div>
          </Card>

          <Card style={{ padding: '24px', textAlign: 'center', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔑</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {loading ? '...' : formatNumber(stats.remainingKeywords)}
            </div>
            <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Keywords Remaining
            </div>
          </Card>

          <Card style={{ padding: '24px', textAlign: 'center', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              {loading ? '...' : `${stats.systemHealth}%`}
            </div>
            <div style={{ fontSize: '13px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              System Health
            </div>
            <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${stats.systemHealth}%`, background: stats.systemHealth >= 95 ? '#4caf50' : stats.systemHealth >= 80 ? '#ff9800' : '#f44336', borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>⚡</span>
            <span>Quick Actions</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                style={{
                  padding: '32px',
                  background: 'white',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(action.path);
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: action.gradient }} />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '56px', marginRight: '20px', background: action.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', margin: '0 0 6px 0' }}>
                      {action.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.path);
                  }}
                  style={{
                    width: '100%',
                    background: action.gradient,
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    padding: '12px',
                  }}
                >
                  Go to {action.title} →
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>📊</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>Recent Activity</span>
            </div>
          }
          style={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <div>Loading activity...</div>
            </div>
          ) : (
            <Table
              columns={activityColumns}
              data={mockActivity}
              striped
              hover
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
