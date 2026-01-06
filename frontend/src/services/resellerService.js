import api from './api';

const getUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get(`/reseller/users?${queryParams}`);
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch users';
    throw new Error(errorMessage);
  }
};

const addUser = async (userData) => {
  try {
    const { name, email, startDate, expiryDate } = userData;

    if (!name || !email || !startDate || !expiryDate) {
      throw new Error('Name, email, start date, and expiry date are required');
    }

    const response = await api.post('/reseller/users', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      startDate,
      expiryDate,
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to create user';
    throw new Error(errorMessage);
  }
};

const updateUserExpiry = async (userId, expiryDate) => {
  try {
    if (!userId || !expiryDate) {
      throw new Error('User ID and expiry date are required');
    }

    const response = await api.put(`/reseller/users/${userId}/expiry-date`, {
      expiryDate,
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update user expiry date';
    throw new Error(errorMessage);
  }
};

const getUserLimits = async () => {
  try {
    const response = await api.get('/reseller/users/limit');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch user limits';
    throw new Error(errorMessage);
  }
};

const deleteUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await api.delete(`/reseller/users/${userId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete user';
    throw new Error(errorMessage);
  }
};

const toggleUserStatus = async (userId, status) => {
  try {
    if (!userId || !status) {
      throw new Error('User ID and status are required');
    }

    const response = await api.patch(`/reseller/users/${userId}/status`, {
      status,
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update user status';
    throw new Error(errorMessage);
  }
};

export default {
  getUsers,
  addUser,
  updateUserExpiry,
  getUserLimits,
  deleteUser,
  toggleUserStatus,
};
