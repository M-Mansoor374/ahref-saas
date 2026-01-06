// Super Admin Resellers Management page
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import adminService from '../../../services/adminService';

/**
 * Super Admin Resellers Management Component
 * 
 * Allows super admin to view, add, and manage reseller accounts.
 */
const AdminResellers = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resellers, setResellers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userLimit: '',
    startDate: '',
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

  // Load resellers on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadResellers = async () => {
      setLoading(true);
      try {
        const result = await adminService.getResellers({ 
          page: currentPage, 
          limit: itemsPerPage,
          search: searchTerm,
        });
        
        if (isMounted && result.success && result.data) {
          const resellersData = result.data.resellers || result.data || [];
          const formattedResellers = resellersData.map((reseller) => ({
            id: reseller._id || reseller.id,
            name: reseller.name || reseller.email?.split('@')[0] || 'Unknown',
            email: reseller.email,
            userCount: reseller.userCount || 0,
            userLimit: reseller.userLimit || -1,
            status: reseller.isActive ? 'Active' : 'Inactive',
            createdAt: reseller.createdAt || new Date().toISOString(),
          }));
          
          setResellers(formattedResellers);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load resellers:', error);
          showNotification(error.message || 'Failed to load resellers', 'error');
          setResellers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadResellers();
    
    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage, searchTerm]);

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
      errors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.userLimit || parseInt(formData.userLimit) < 0) {
      errors.userLimit = 'User limit must be 0 or greater (-1 for unlimited)';
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

  // Handle save reseller
  const handleSaveReseller = async () => {
    if (!validateForm()) {
      showNotification('Please fix form errors', 'error');
      return;
    }

    setSaving(true);
    try {
      const result = await adminService.addReseller({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        userLimit: parseInt(formData.userLimit, 10),
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
      });

      if (result.success) {
        showNotification('Reseller added successfully', 'success');
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          userLimit: '',
          startDate: '',
          expiryDate: '',
        });
        setFormErrors({});
        // Reload resellers
        const reloadResult = await adminService.getResellers({ 
          page: currentPage, 
          limit: itemsPerPage,
          search: searchTerm,
        });
        if (reloadResult.success && reloadResult.data) {
          const resellersData = reloadResult.data.resellers || reloadResult.data || [];
          const formattedResellers = resellersData.map((reseller) => ({
            id: reseller._id || reseller.id,
            name: reseller.name || reseller.email?.split('@')[0] || 'Unknown',
            email: reseller.email,
            userCount: reseller.userCount || 0,
            userLimit: reseller.userLimit || -1,
            status: reseller.isActive ? 'Active' : 'Inactive',
            createdAt: reseller.createdAt || new Date().toISOString(),
          }));
          setResellers(formattedResellers);
        }
      }
    } catch (error) {
      console.error('Failed to save reseller:', error);
      showNotification(error.message || 'Failed to save reseller', 'error');
    } finally {
      setSaving(false);
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
    if (num === -1) return 'Unlimited';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      label: 'Name',
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
      key: 'userCount',
      label: 'Users',
      align: 'center',
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{formatNumber(value)}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            of {formatNumber(row.userLimit)}
          </div>
        </div>
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
            backgroundColor: value === 'Active' ? '#e8f5e9' : '#ffebee',
            color: value === 'Active' ? '#2e7d32' : '#c62828',
          }}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <span style={{ color: '#666', fontSize: '13px' }}>
          {formatDate(value)}
        </span>
      ),
    },
  ];

  // Pagination
  const totalPages = Math.ceil(resellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResellers = resellers.slice(startIndex, endIndex);

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
              Resellers Management
            </h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
              Manage reseller accounts and their limits
            </p>
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={() => setIsModalOpen(true)}
          >
            Add Reseller
          </Button>
        </div>

        {/* Search Bar */}
        <Card style={{ marginBottom: '20px', padding: '16px' }}>
          <Input
            type="text"
            placeholder="Search resellers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </Card>

        {/* Notification */}
        {notification.show && (
          <div
            style={{
              padding: '12px 20px',
              marginBottom: '20px',
              borderRadius: '4px',
              backgroundColor:
                notification.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: notification.type === 'success' ? '#2e7d32' : '#c62828',
              border: `1px solid ${
                notification.type === 'success' ? '#c8e6c9' : '#ffcdd2'
              }`,
            }}
          >
            {notification.message}
          </div>
        )}

        {/* Resellers Table */}
        <Card title={`Resellers (${resellers.length})`}>
          {loading ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              Loading resellers...
            </div>
          ) : paginatedResellers.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: '#999',
              }}
            >
              No resellers found
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedResellers} striped hover />
              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '20px',
                    paddingTop: '20px',
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      {/* Add Reseller Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            name: '',
            email: '',
            password: '',
            userLimit: '',
            startDate: '',
            expiryDate: '',
          });
          setFormErrors({});
        }}
        title="Add New Reseller"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            error={formErrors.password}
            required
          />

          <Input
            label="User Limit (-1 for unlimited)"
            type="number"
            name="userLimit"
            value={formData.userLimit}
            onChange={handleInputChange}
            error={formErrors.userLimit}
            required
          />

          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            error={formErrors.startDate}
            required
          />

          <Input
            label="Expiry Date"
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            error={formErrors.expiryDate}
            required
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  userLimit: '',
                  startDate: '',
                  expiryDate: '',
                });
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveReseller}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Reseller'}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </div>
  );
};

export default AdminResellers;
