// Super Admin Users Management page
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import adminService from '../../../services/adminService';

/**
 * Super Admin Users Management Component
 * 
 * Comprehensive user management panel for Super Admin.
 * Allows viewing, adding, editing, suspending, and deleting users.
 */
const AdminUsers = () => {
  const { user, role, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [availableIPs, setAvailableIPs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    keywordLimit: '',
    startDate: '',
    expiryDate: '',
    assignedIP: '',
  });
  const [formErrors, setFormErrors] = useState({});


  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load users and IPs on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load users
        const usersResult = await adminService.getUsers({ page: 1, limit: 100 });
        
        if (isMounted && usersResult.success && usersResult.data) {
          const usersData = usersResult.data.users || usersResult.data || [];
          const formattedUsers = usersData.map((user) => ({
            id: user._id || user.id,
            name: user.name || user.email?.split('@')[0] || 'Unknown',
            email: user.email,
            role: user.role,
            keywordLimit: user.subscription?.keywordLimit || user.keywordLimit || 0,
            usedKeywords: user.subscription?.usedKeywords || user.usedKeywords || 0,
            remainingKeywords: user.subscription?.remainingKeywords || (user.keywordLimit - (user.usedKeywords || 0)),
            status: user.status === 'active' ? 'Active' : user.subscription?.isExpired ? 'Expired' : 'Inactive',
            startDate: user.subscription?.startDate || user.startDate || new Date().toISOString(),
            expiryDate: user.subscription?.expiryDate || user.expireDate || user.expiryDate,
            assignedIP: user.assignedIP || null,
            createdAt: user.createdAt || new Date().toISOString(),
          }));
          
          setUsers(formattedUsers);
        }

        // Load IPs for dropdown
        try {
          const ipsResult = await adminService.getIPs();
          if (isMounted && ipsResult.success && ipsResult.data) {
            const ipsData = ipsResult.data.ipAddresses || ipsResult.data || [];
            const formattedIPs = ipsData.map((ip) => ({
              id: ip._id || ip.id,
              ipAddress: ip.ipAddress,
            }));
            setAvailableIPs(formattedIPs);
          }
        } catch (ipError) {
          console.warn('Failed to load IPs:', ipError);
          setAvailableIPs([]);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load users:', error);
          showNotification(error.message || 'Failed to load users', 'error');
          setUsers([]);
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
  }, []);

  // Filter and search users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else {
      // Check if email already exists (excluding current edit)
      const existingUser = users.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase() && (!isEditMode || u.id !== editingUser?.id)
      );
      if (existingUser) {
        errors.email = 'This email is already registered';
      }
    }

    if (!formData.keywordLimit.trim()) {
      errors.keywordLimit = 'Keyword limit is required';
    } else {
      const limit = parseInt(formData.keywordLimit);
      if (isNaN(limit) || limit < 1) {
        errors.keywordLimit = 'Must be a number greater than 0';
      }
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (formData.startDate && new Date(formData.expiryDate) <= new Date(formData.startDate)) {
      errors.expiryDate = 'Expiry date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle add new user
  const handleAddUser = () => {
    setIsEditMode(false);
    setEditingUser(null);
    setViewingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'user',
      keywordLimit: '',
      startDate: '',
      expiryDate: '',
      assignedIP: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle view user
  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsEditMode(false);
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setIsEditMode(true);
    setEditingUser(user);
    setViewingUser(null);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      keywordLimit: user.keywordLimit.toString(),
      startDate: user.startDate ? new Date(user.startDate).toISOString().split('T')[0] : '',
      expiryDate: user.expiryDate ? new Date(user.expiryDate).toISOString().split('T')[0] : '',
      assignedIP: user.assignedIP || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle save user (add or update)
  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      if (isEditMode) {
        // Update existing user - update keyword limit and expiry date
        if (formData.keywordLimit !== editingUser.keywordLimit.toString()) {
          await adminService.setUserKeywordLimit(editingUser.id, parseInt(formData.keywordLimit));
        }
        
        if (formData.expiryDate !== editingUser.expiryDate?.split('T')[0]) {
          await adminService.setUserExpiryDate(editingUser.id, new Date(formData.expiryDate).toISOString());
        }

        // Reload users to get updated data
        const result = await adminService.getUsers({ page: 1, limit: 100 });
        if (result.success && result.data) {
          const usersData = result.data.users || result.data || [];
          const formattedUsers = usersData.map((user) => ({
            id: user._id || user.id,
            name: user.name || user.email?.split('@')[0] || 'Unknown',
            email: user.email,
            role: user.role,
            keywordLimit: user.subscription?.keywordLimit || user.keywordLimit || 0,
            usedKeywords: user.subscription?.usedKeywords || user.usedKeywords || 0,
            remainingKeywords: user.subscription?.remainingKeywords || (user.keywordLimit - (user.usedKeywords || 0)),
            status: user.status === 'active' ? 'Active' : user.subscription?.isExpired ? 'Expired' : 'Inactive',
            startDate: user.subscription?.startDate || user.startDate || new Date().toISOString(),
            expiryDate: user.subscription?.expiryDate || user.expireDate || user.expiryDate,
            assignedIP: user.assignedIP || null,
            createdAt: user.createdAt || new Date().toISOString(),
          }));
          setUsers(formattedUsers);
        }
        
        showNotification('User updated successfully', 'success');
      } else {
        // Add new user
        const password = `Temp${Math.random().toString(36).slice(-8)}!`;
        const result = await adminService.addUser({
          name: formData.name,
          email: formData.email,
          password: password,
          role: formData.role,
          keywordLimit: parseInt(formData.keywordLimit),
          startDate: new Date(formData.startDate).toISOString(),
          expiryDate: new Date(formData.expiryDate).toISOString(),
        });

        if (result.success) {
          // Reload users
          const usersResult = await adminService.getUsers({ page: 1, limit: 100 });
          if (usersResult.success && usersResult.data) {
            const usersData = usersResult.data.users || usersResult.data || [];
            const formattedUsers = usersData.map((user) => ({
              id: user._id || user.id,
              name: user.name || user.email?.split('@')[0] || 'Unknown',
              email: user.email,
              role: user.role,
              keywordLimit: user.subscription?.keywordLimit || user.keywordLimit || 0,
              usedKeywords: user.subscription?.usedKeywords || user.usedKeywords || 0,
              remainingKeywords: user.subscription?.remainingKeywords || (user.keywordLimit - (user.usedKeywords || 0)),
              status: user.status === 'active' ? 'Active' : user.subscription?.isExpired ? 'Expired' : 'Inactive',
              startDate: user.subscription?.startDate || user.startDate || new Date().toISOString(),
              expiryDate: user.subscription?.expiryDate || user.expireDate || user.expiryDate,
              assignedIP: user.assignedIP || null,
              createdAt: user.createdAt || new Date().toISOString(),
            }));
            setUsers(formattedUsers);
          }
          showNotification('User added successfully', 'success');
        }
      }

      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'user',
        keywordLimit: '',
        startDate: '',
        expiryDate: '',
        assignedIP: '',
      });
      setFormErrors({});
    } catch (error) {
      showNotification(error.message || 'Failed to save user', 'error');
      console.error('Save user error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle suspend user
  const handleSuspendUser = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.status === 'Suspended' ? 'activate' : 'suspend'} ${user.name}?`)) {
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id
            ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' }
            : u
        )
      );
      showNotification(
        `User ${user.status === 'Suspended' ? 'activated' : 'suspended'} successfully`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to update user status', 'error');
      console.error('Suspend user error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
      showNotification('User deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete user', 'error');
      console.error('Delete user error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format number
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Calculate usage percentage
  const calculateUsagePercentage = (used, limit) => {
    if (limit === 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { bg: '#e8f5e9', color: '#2e7d32' },
      Expired: { bg: '#ffebee', color: '#c62828' },
      Suspended: { bg: '#fff3e0', color: '#f57c00' },
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

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'User Name',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 500, color: '#333' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span style={{ textTransform: 'capitalize', fontWeight: 500, color: '#333' }}>
          {value === 'reseller' ? 'Reseller Admin' : 'User'}
        </span>
      ),
    },
    {
      key: 'keywordLimit',
      label: 'Keyword Limit',
      align: 'right',
      render: (value) => formatNumber(value),
    },
    {
      key: 'usedKeywords',
      label: 'Keywords Used',
      align: 'right',
      render: (value, row) => (
        <div>
          <div>{formatNumber(value)}</div>
          <div
            style={{
              fontSize: '11px',
              color: '#999',
              marginTop: '2px',
            }}
          >
            {calculateUsagePercentage(value, row.keywordLimit)}%
          </div>
        </div>
      ),
    },
    {
      key: 'remainingKeywords',
      label: 'Keywords Remaining',
      align: 'right',
      render: (value) => (
        <span style={{ color: value === 0 ? '#c62828' : '#666', fontWeight: 500 }}>
          {formatNumber(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (value, row) => {
        const isExpired = value && new Date(value) < new Date();
        return (
          <div>
            <div style={{ color: isExpired ? '#c62828' : '#666' }}>
              {formatDate(value)}
            </div>
            {isExpired && (
              <div style={{ fontSize: '11px', color: '#c62828', marginTop: '2px' }}>
                Expired
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleViewUser(row)}
            disabled={loading}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleEditUser(row)}
            disabled={loading}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'Suspended' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => handleSuspendUser(row)}
            disabled={loading}
          >
            {row.status === 'Suspended' ? 'Activate' : 'Suspend'}
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteUser(row)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
    <div style={{ width: '100%', minHeight: '100%' }}>
      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Page Title */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#333',
                margin: '0 0 8px 0',
              }}
            >
              Users Management
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Manage all users in the system
            </p>
          </div>
          <Button variant="primary" size="medium" onClick={handleAddUser} disabled={loading}>
            Add New User
          </Button>
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

        {/* Search and Filters */}
        <Card>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <Input
              type="text"
              name="search"
              label="Search Users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
            />

            <div>
              <label
                htmlFor="roleFilter"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Filter by Role
              </label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="reseller">Reseller Admin</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="statusFilter"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card title={`Users (${filteredUsers.length})`}>
          {loading && users.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              No users found matching your criteria.
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedUsers} striped hover />

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of{' '}
                    {filteredUsers.length} users
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        color: '#666',
                        fontSize: '14px',
                      }}
                    >
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      {/* Add/Edit/View User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setViewingUser(null);
          setEditingUser(null);
          setFormData({
            name: '',
            email: '',
            role: 'user',
            keywordLimit: '',
            startDate: '',
            expiryDate: '',
            assignedIP: '',
          });
          setFormErrors({});
        }}
        title={
          viewingUser
            ? `View User: ${viewingUser.name}`
            : isEditMode
            ? 'Edit User'
            : 'Add New User'
        }
        size="large"
        footer={
          viewingUser ? (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setViewingUser(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setViewingUser(null);
                  handleEditUser(viewingUser);
                }}
              >
                Edit User
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    name: '',
                    email: '',
                    role: 'user',
                    keywordLimit: '',
                    startDate: '',
                    expiryDate: '',
                    assignedIP: '',
                  });
                  setFormErrors({});
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveUser} disabled={saving}>
                {saving ? 'Saving...' : isEditMode ? 'Update User' : 'Add User'}
              </Button>
            </div>
          )
        }
      >
        {viewingUser ? (
          // View Mode
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  Name
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {viewingUser.name}
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
                  Email
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {viewingUser.email}
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
                  Role
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {viewingUser.role === 'reseller' ? 'Reseller Admin' : 'User'}
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
                  Status
                </div>
                <div>{getStatusBadge(viewingUser.status)}</div>
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
                  Keyword Limit
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatNumber(viewingUser.keywordLimit)}
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
                  Keywords Used
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatNumber(viewingUser.usedKeywords)} (
                  {calculateUsagePercentage(viewingUser.usedKeywords, viewingUser.keywordLimit)}%)
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
                  Keywords Remaining
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: viewingUser.remainingKeywords === 0 ? '#c62828' : '#333',
                  }}
                >
                  {formatNumber(viewingUser.remainingKeywords)}
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
                  Assigned IP
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {viewingUser.assignedIP || 'None'}
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
                  Start Date
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#333' }}>
                  {formatDate(viewingUser.startDate)}
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
                  Expiry Date
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color:
                      viewingUser.expiryDate && new Date(viewingUser.expiryDate) < new Date()
                        ? '#c62828'
                        : '#333',
                  }}
                >
                  {formatDate(viewingUser.expiryDate)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Add/Edit Mode
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              type="text"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter user name"
              required
              error={formErrors.name}
              disabled={saving || isEditMode}
            />

            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
              error={formErrors.email}
              disabled={saving || isEditMode}
            />

            <div>
              <label
                htmlFor="role"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Role <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={saving || isEditMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  border: `1px solid ${formErrors.role ? '#d32f2f' : '#ccc'}`,
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: saving || isEditMode ? '#f5f5f5' : '#ffffff',
                  color: saving || isEditMode ? '#999' : '#333',
                  cursor: saving || isEditMode ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="user">User</option>
                <option value="reseller">Reseller Admin</option>
              </select>
              {formErrors.role && (
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#d32f2f',
                  }}
                >
                  {formErrors.role}
                </div>
              )}
            </div>

            <Input
              type="text"
              name="keywordLimit"
              label="Keyword Limit"
              value={formData.keywordLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  handleInputChange(e);
                }
              }}
              placeholder="e.g., 1000"
              required
              error={formErrors.keywordLimit}
              disabled={saving}
            />

            <Input
              type="date"
              name="startDate"
              label="Start Date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              error={formErrors.startDate}
              disabled={saving}
            />

            <Input
              type="date"
              name="expiryDate"
              label="Expiry Date"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
              error={formErrors.expiryDate}
              disabled={saving}
            />

            <div>
              <label
                htmlFor="assignedIP"
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                }}
              >
                Assign Static IP (Optional)
              </label>
              <select
                id="assignedIP"
                name="assignedIP"
                value={formData.assignedIP}
                onChange={handleInputChange}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  border: `1px solid ${formErrors.assignedIP ? '#d32f2f' : '#ccc'}`,
                  borderRadius: '4px',
                  outline: 'none',
                  backgroundColor: saving ? '#f5f5f5' : '#ffffff',
                  color: saving ? '#999' : '#333',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="">-- No IP Assigned --</option>
                {availableIPs.map((ip) => (
                  <option key={ip.id} value={ip.ipAddress}>
                    {ip.ipAddress}
                  </option>
                ))}
              </select>
              {formErrors.assignedIP && (
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#d32f2f',
                  }}
                >
                  {formErrors.assignedIP}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;
