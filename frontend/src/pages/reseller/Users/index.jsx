import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/common/Card';
import Table from '../../../components/common/Table';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';

const ResellerUsers = () => {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({ name: '', email: '', startDate: '', expiryDate: '' });
  const [formErrors, setFormErrors] = useState({});
  const [extendDays, setExtendDays] = useState('30');
  const [userLimits, setUserLimits] = useState({ totalAllowedUsers: 100, activeUsers: 47, remainingUserSlots: 53 });

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', startDate: '2024-01-15', expiryDate: '2024-12-15', used: 250, remaining: 750 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active', startDate: '2024-02-01', expiryDate: '2024-11-01', used: 1500, remaining: 500 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Expired', startDate: '2023-06-01', expiryDate: '2024-05-31', used: 500, remaining: 0 },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUsers);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatUsage = (used, remaining) => {
    const total = used + remaining;
    const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
    return `${used} / ${total} (${percentage}%)`;
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

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
    if (formData.startDate && formData.expiryDate && new Date(formData.startDate) >= new Date(formData.expiryDate)) {
      errors.expiryDate = 'Expiry date must be after start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    if (userLimits.remainingUserSlots <= 0) {
      showNotification('User limit reached. Cannot add more users.', 'error');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      id: users.length + 1,
      ...formData,
      status: 'Active',
      used: 0,
      remaining: 1000,
    };
    setUsers([...users, newUser]);
    setUserLimits(prev => ({ ...prev, activeUsers: prev.activeUsers + 1, remainingUserSlots: prev.remainingUserSlots - 1 }));
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', startDate: '', expiryDate: '' });
    setFormErrors({});
    setLoading(false);
    showNotification('User created successfully', 'success');
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setUserLimits(prev => ({ ...prev, activeUsers: prev.activeUsers - 1, remainingUserSlots: prev.remainingUserSlots + 1 }));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    setLoading(false);
    showNotification('User deleted successfully', 'success');
  };

  const handleToggleStatus = async (user) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Expired' : 'Active' } : u));
    setUserLimits(prev => ({
      ...prev,
      activeUsers: user.status === 'Active' ? prev.activeUsers - 1 : prev.activeUsers + 1,
      remainingUserSlots: user.status === 'Active' ? prev.remainingUserSlots + 1 : prev.remainingUserSlots - 1,
    }));
    setLoading(false);
    showNotification(`User ${user.status === 'Active' ? 'deactivated' : 'activated'} successfully`, 'success');
  };

  const handleExtendExpiry = async () => {
    if (!extendDays || parseInt(extendDays) <= 0) {
      showNotification('Please enter valid number of days', 'error');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const newExpiry = new Date(selectedUser.expiryDate);
    newExpiry.setDate(newExpiry.getDate() + parseInt(extendDays));
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, expiryDate: newExpiry.toISOString().split('T')[0] } : u));
    setIsExtendModalOpen(false);
    setSelectedUser(null);
    setExtendDays('30');
    setLoading(false);
    showNotification('Expiry date extended successfully', 'success');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (status) => getStatusBadge(status)
    },
    { key: 'startDate', label: 'Start Date', render: (date) => formatDate(date) },
    { key: 'expiryDate', label: 'Expiry Date', render: (date) => formatDate(date) },
    { 
      key: 'usage', 
      label: 'Usage',
      render: (_, row) => {
        const usage = formatUsage(row.used, row.remaining);
        const percentage = row.used + row.remaining > 0 ? Math.round((row.used / (row.used + row.remaining)) * 100) : 0;
        const isHigh = percentage >= 80;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: isHigh ? '#f57c00' : '#666' }}>{usage}</span>
            {isHigh && <span title="Usage limit approaching">⚠️</span>}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button size="small" variant="outline" onClick={() => { setSelectedUser(row); setIsViewModalOpen(true); }}>View</Button>
          <Button size="small" variant="outline" onClick={() => { setSelectedUser(row); setIsExtendModalOpen(true); }}>Extend</Button>
          <Button size="small" variant="outline" onClick={() => handleToggleStatus(row)}>
            {row.status === 'Active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="small" variant="danger" onClick={() => { setSelectedUser(row); setIsDeleteModalOpen(true); }}>Delete</Button>
        </div>
      )
    },
  ];

  if (role !== 'RESELLER' && role !== 'reseller' && role !== 'reseller_admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Card style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h2 style={{ color: '#c62828', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#666' }}>This page is only accessible to Reseller Admin users.</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' }}>Users</h1>
            <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>Manage users under your account</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} disabled={userLimits.remainingUserSlots <= 0}>
            Add User
          </Button>
        </div>

        {notification.show && (
          <div style={{ padding: '12px 20px', marginBottom: '20px', borderRadius: '4px', backgroundColor: notification.type === 'success' ? '#e8f5e9' : '#ffebee', color: notification.type === 'success' ? '#2e7d32' : '#c62828', border: `1px solid ${notification.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'success' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '18px', padding: '0 8px' }}>×</button>
          </div>
        )}

        {userLimits.remainingUserSlots <= 2 && userLimits.remainingUserSlots > 0 && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#fff3e0', border: '1px solid #ffcc80' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f57c00' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div><strong>Low User Slots:</strong> Only {userLimits.remainingUserSlots} slot{userLimits.remainingUserSlots !== 1 ? 's' : ''} remaining.</div>
            </div>
          </Card>
        )}

        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Allowed Users</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{userLimits.totalAllowedUsers}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Active Users</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{userLimits.activeUsers}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Remaining Slots</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: userLimits.remainingUserSlots === 0 ? '#c62828' : '#1976d2' }}>{userLimits.remainingUserSlots}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Input type="text" name="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." style={{ marginBottom: 0 }} />
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: '16px' }}>No users found.</p>
              {searchTerm && <Button variant="outline" onClick={() => setSearchTerm('')}>Clear Search</Button>}
            </div>
          ) : (
            <>
              <Table columns={columns} data={paginatedUsers} />
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                  <Button variant="outline" size="small" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                  <span style={{ color: '#666' }}>Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="small" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                </div>
              )}
            </>
          )}
        </Card>

        <Modal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setFormData({ name: '', email: '', startDate: '', expiryDate: '' }); setFormErrors({}); }} title="Add New User" footer={
          <>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setFormData({ name: '', email: '', startDate: '', expiryDate: '' }); setFormErrors({}); }}>Cancel</Button>
            <Button variant="primary" onClick={handleAddUser}>Create User</Button>
          </>
        }>
          <Input name="name" label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} required />
          <Input type="email" name="email" label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} error={formErrors.email} required />
          <Input type="date" name="startDate" label="Start Date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} error={formErrors.startDate} required />
          <Input type="date" name="expiryDate" label="Expiry Date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} error={formErrors.expiryDate} required />
        </Modal>

        <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedUser(null); }} title="User Details" footer={<Button variant="outline" onClick={() => { setIsViewModalOpen(false); setSelectedUser(null); }}>Close</Button>}>
          {selectedUser && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Status:</strong> {getStatusBadge(selectedUser.status)}</div>
              <div><strong>Start Date:</strong> {formatDate(selectedUser.startDate)}</div>
              <div><strong>Expiry Date:</strong> {formatDate(selectedUser.expiryDate)}</div>
              <div><strong>Usage:</strong> {formatUsage(selectedUser.used, selectedUser.remaining)}</div>
            </div>
          )}
        </Modal>

        <Modal isOpen={isExtendModalOpen} onClose={() => { setIsExtendModalOpen(false); setSelectedUser(null); setExtendDays('30'); }} title="Extend Expiry Date" footer={
          <>
            <Button variant="outline" onClick={() => { setIsExtendModalOpen(false); setSelectedUser(null); setExtendDays('30'); }}>Cancel</Button>
            <Button variant="primary" onClick={handleExtendExpiry}>Extend</Button>
          </>
        }>
          {selectedUser && (
            <>
              <div style={{ marginBottom: '16px' }}>Current expiry: {formatDate(selectedUser.expiryDate)}</div>
              <Input type="number" name="extendDays" label="Extend by (days)" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} min="1" required />
            </>
          )}
        </Modal>

        <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }} title="Delete User" footer={
          <>
            <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
          </>
        }>
          {selectedUser && <p>Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.</p>}
        </Modal>
      </main>
    </div>
  );
};

export default ResellerUsers;
