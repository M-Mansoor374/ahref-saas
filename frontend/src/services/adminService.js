import api from './api';

const getResellers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await api.get(`/admin/resellers?${queryParams}`);
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch resellers';
    throw new Error(errorMessage);
  }
};

const addReseller = async (resellerData) => {
  try {
    const { name, email, userLimit, startDate, expiryDate } = resellerData;

    if (!name || !email || !userLimit || !startDate || !expiryDate) {
      throw new Error('Name, email, user limit, start date, and expiry date are required');
    }

    const response = await api.post('/admin/resellers', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      userLimit: parseInt(userLimit, 10),
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
      'Failed to create reseller';
    throw new Error(errorMessage);
  }
};

const getUsers = async (params = {}) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(status && { status }),
    });

    const response = await api.get(`/admin/users/active?${queryParams}`);
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
    const { name, email, role, keywordLimit, startDate, expiryDate, assignedIP } = userData;

    if (!name || !email || !role || !keywordLimit || !startDate || !expiryDate) {
      throw new Error('Name, email, role, keyword limit, start date, and expiry date are required');
    }

    const response = await api.post('/admin/users', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      keywordLimit: parseInt(keywordLimit, 10),
      startDate,
      expiryDate,
      ...(assignedIP && { assignedIP }),
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

const setUserKeywordLimit = async (userId, keywordLimit) => {
  try {
    if (!userId || keywordLimit === undefined) {
      throw new Error('User ID and keyword limit are required');
    }

    const response = await api.put(`/admin/users/${userId}/keyword-limit`, {
      keywordLimit: parseInt(keywordLimit, 10),
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update keyword limit';
    throw new Error(errorMessage);
  }
};

const setUserExpiryDate = async (userId, expiryDate) => {
  try {
    if (!userId || !expiryDate) {
      throw new Error('User ID and expiry date are required');
    }

    const response = await api.put(`/admin/users/${userId}/expiry-date`, {
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
      'Failed to update expiry date';
    throw new Error(errorMessage);
  }
};

const updateAhrefsCookies = async (ownerId, cookies) => {
  try {
    if (!ownerId || !cookies) {
      throw new Error('Owner ID and cookies are required');
    }

    const response = await api.put(`/admin/cookies/${ownerId}`, {
      cookies,
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update Ahrefs cookies';
    throw new Error(errorMessage);
  }
};

const getIPs = async () => {
  try {
    const response = await api.get('/admin/ips');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch IP addresses';
    throw new Error(errorMessage);
  }
};

const addIP = async (ipData) => {
  try {
    const { ipAddress, description, ownerId } = ipData;

    if (!ipAddress) {
      throw new Error('IP address is required');
    }

    const response = await api.post('/admin/ips', {
      ipAddress: ipAddress.trim(),
      ...(description && { description: description.trim() }),
      ...(ownerId && { ownerId }),
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to add IP address';
    throw new Error(errorMessage);
  }
};

const deleteIP = async (ipId) => {
  try {
    if (!ipId) {
      throw new Error('IP ID is required');
    }

    const response = await api.delete(`/admin/ips/${ipId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to delete IP address';
    throw new Error(errorMessage);
  }
};

const getSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to fetch settings';
    throw new Error(errorMessage);
  }
};

const updateSettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/settings', settingsData);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to update settings';
    throw new Error(errorMessage);
  }
};

export default {
  getResellers,
  addReseller,
  getUsers,
  addUser,
  setUserKeywordLimit,
  setUserExpiryDate,
  updateAhrefsCookies,
  getIPs,
  addIP,
  deleteIP,
  getSettings,
  updateSettings,
};
