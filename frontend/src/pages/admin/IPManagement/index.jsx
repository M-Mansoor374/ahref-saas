// Super Admin IP Management page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import adminService from '../../../services/adminService';

/**
 * IP Management Component
 * 
 * Super Admin page for managing whitelisted static IPs.
 * Allows adding, editing, deleting, and toggling IP status.
 */
const IPManagement = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ips, setIps] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIp, setEditingIp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    ipAddress: '',
    assignedUserId: '',
    expiryDate: '',
  });
  const [formErrors, setFormErrors] = useState({});


  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Load data on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await adminService.getIPs();
        
        if (isMounted && result.success && result.data) {
          const ipsData = result.data.ips || result.data || [];
          const formattedIPs = ipsData.map((ip) => ({
            id: ip._id || ip.id,
            ipAddress: ip.ipAddress || ip.ip,
            description: ip.description || '',
            ownerId: ip.ownerId || null,
            ownerEmail: ip.ownerEmail || ip.owner?.email || '',
            createdAt: ip.createdAt || new Date().toISOString(),
          }));
          setIps(formattedIPs);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load IPs:', error);
          showNotification(error.message || 'Failed to load IP addresses', 'error');
          setIps([]);
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

  // Validate IP address (IPv4 or IPv6)
  const validateIP = (ip) => {
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    // IPv6 regex (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.ipAddress.trim()) {
      errors.ipAddress = 'IP Address is required';
    } else if (!validateIP(formData.ipAddress)) {
      errors.ipAddress = 'Please enter a valid IPv4 or IPv6 address';
    }

    // Check if IP already exists (excluding current edit)
    const existingIp = ips.find(
      (ip) => ip.ipAddress === formData.ipAddress && (!isEditMode || ip.id !== editingIp?.id)
    );
    if (existingIp) {
      errors.ipAddress = 'This IP address is already whitelisted';
    }

    // Expiry date validation (if provided)
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        errors.expiryDate = 'Expiry date cannot be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add new IP
  const handleAddIP = () => {
    setIsEditMode(false);
    setEditingIp(null);
    setFormData({
      ipAddress: '',
      assignedUserId: '',
      expiryDate: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle edit IP
  const handleEditIP = (ip) => {
    setIsEditMode(true);
    setEditingIp(ip);
    setFormData({
      ipAddress: ip.ipAddress,
      assignedUserId: ip.assignedUser?.id?.toString() || '',
      expiryDate: ip.expiryDate
        ? new Date(ip.expiryDate).toISOString().split('T')[0]
        : '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle save IP (add or update)
  const handleSaveIP = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Update existing IP - TODO: Add update endpoint
        showNotification('Update functionality coming soon', 'info');
        setIsModalOpen(false);
      } else {
        // Add new IP
        const result = await adminService.addIP({
          ipAddress: formData.ipAddress,
          description: formData.description || '',
          ownerId: formData.assignedUserId || null,
        });

        if (result.success) {
          showNotification('IP address added successfully', 'success');
          setIsModalOpen(false);
          setFormData({
            ipAddress: '',
            assignedUserId: '',
            expiryDate: '',
          });
          setFormErrors({});
          
          // Reload IPs
          const reloadResult = await adminService.getIPs();
          if (reloadResult.success && reloadResult.data) {
            const ipsData = reloadResult.data.ips || reloadResult.data || [];
            const formattedIPs = ipsData.map((ip) => ({
              id: ip._id || ip.id,
              ipAddress: ip.ipAddress || ip.ip,
              description: ip.description || '',
              ownerId: ip.ownerId || null,
              ownerEmail: ip.ownerEmail || ip.owner?.email || '',
              createdAt: ip.createdAt || new Date().toISOString(),
            }));
            setIps(formattedIPs);
          }
        }
      }
    } catch (error) {
      console.error('Failed to save IP:', error);
      showNotification(error.message || 'Failed to save IP address', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete IP
  const handleDeleteIP = async (ipId) => {
    if (!window.confirm('Are you sure you want to delete this IP address?')) {
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.deleteIP(ipId);

      if (result.success) {
        showNotification('IP address deleted successfully', 'success');
        
        // Reload IPs
        const reloadResult = await adminService.getIPs();
        if (reloadResult.success && reloadResult.data) {
          const ipsData = reloadResult.data.ips || reloadResult.data || [];
          const formattedIPs = ipsData.map((ip) => ({
            id: ip._id || ip.id,
            ipAddress: ip.ipAddress || ip.ip,
            description: ip.description || '',
            ownerId: ip.ownerId || null,
            ownerEmail: ip.ownerEmail || ip.owner?.email || '',
            createdAt: ip.createdAt || new Date().toISOString(),
          }));
          setIps(formattedIPs);
        }
      }
    } catch (error) {
      console.error('Failed to delete IP:', error);
      showNotification(error.message || 'Failed to delete IP address', 'error');
    } finally {
      setLoading(false);
    }
  };


  // Handle toggle status
  const handleToggleStatus = async (ip) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIps((prevIps) =>
        prevIps.map((item) =>
          item.id === ip.id
            ? { ...item, status: item.status === 'Active' ? 'Inactive' : 'Active' }
            : item
        )
      );
      showNotification(
        `IP address ${ip.status === 'Active' ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
    } catch (error) {
      showNotification('Failed to update IP status', 'error');
      console.error('Toggle status error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Check if IP is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // Pagination
  const totalPages = Math.ceil(ips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIPs = ips.slice(startIndex, endIndex);

  // Table columns
  const columns = [
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value) => (
        <div style={{ fontFamily: 'monospace', fontWeight: 500, color: '#333' }}>{value}</div>
      ),
    },
    {
      key: 'assignedUser',
      label: 'Assigned User',
      render: (value) =>
        value ? (
          <div>
            <div style={{ fontWeight: 500, color: '#333' }}>{value.name}</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{value.email}</div>
          </div>
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>Unassigned</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => {
        const expired = isExpired(row.expiryDate);
        const statusColor =
          value === 'Active' && !expired
            ? '#2e7d32'
            : value === 'Inactive' || expired
            ? '#c62828'
            : '#999';
        const statusBg =
          value === 'Active' && !expired
            ? '#e8f5e9'
            : value === 'Inactive' || expired
            ? '#ffebee'
            : '#f5f5f5';

        return (
          <div>
            <span
              style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: statusBg,
                color: statusColor,
              }}
            >
              {expired && value === 'Active' ? 'Expired' : value}
            </span>
            {expired && value === 'Active' && (
              <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px' }}>
                Expired on {formatDate(row.expiryDate)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (value) => (
        <div style={{ color: value && isExpired(value) ? '#c62828' : '#666' }}>
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="small"
            onClick={() => handleEditIP(row)}
            disabled={loading}
          >
            Edit
          </Button>
          <Button
            variant={row.status === 'Active' ? 'secondary' : 'primary'}
            size="small"
            onClick={() => handleToggleStatus(row)}
            disabled={loading}
          >
            {row.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleDeleteIP(row.id || row._id)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
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
              IP Management
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Manage whitelisted static IP addresses
            </p>
          </div>
          <Button variant="primary" size="medium" onClick={handleAddIP} disabled={loading}>
            Add New IP
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

        {/* IPs Table */}
        <Card title="Whitelisted IP Addresses">
          {loading && ips.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              Loading IP addresses...
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedIPs} striped hover />

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
                    Showing {startIndex + 1} to {Math.min(endIndex, ips.length)} of {ips.length}{' '}
                    IPs
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
      {/* Add/Edit IP Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ ipAddress: '', assignedUserId: '', expiryDate: '' });
          setFormErrors({});
        }}
        title={isEditMode ? 'Edit IP Address' : 'Add New IP Address'}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ ipAddress: '', assignedUserId: '', expiryDate: '' });
                setFormErrors({});
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveIP} disabled={loading}>
              {loading ? 'Saving...' : isEditMode ? 'Update' : 'Add'} IP
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            type="text"
            name="ipAddress"
            label="IP Address"
            value={formData.ipAddress}
            onChange={handleInputChange}
            placeholder="e.g., 192.168.1.100 or 2001:0db8:85a3::8a2e:0370:7334"
            required
            error={formErrors.ipAddress}
            disabled={loading}
          />

          <div>
            <label
              htmlFor="assignedUserId"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
              }}
            >
              Assign to User (Optional)
            </label>
            <select
              id="assignedUserId"
              name="assignedUserId"
              value={formData.assignedUserId}
              onChange={handleInputChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '16px',
                fontFamily: 'inherit',
                border: `1px solid ${formErrors.assignedUserId ? '#d32f2f' : '#ccc'}`,
                borderRadius: '4px',
                outline: 'none',
                backgroundColor: loading ? '#f5f5f5' : '#ffffff',
                color: loading ? '#999' : '#333',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">-- Select User --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {formErrors.assignedUserId && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#d32f2f',
                }}
              >
                {formErrors.assignedUserId}
              </div>
            )}
          </div>

          <Input
            type="date"
            name="expiryDate"
            label="Expiry Date (Optional)"
            value={formData.expiryDate}
            onChange={handleInputChange}
            error={formErrors.expiryDate}
            disabled={loading}
          />
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default IPManagement;
