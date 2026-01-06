import api from './api';

const getDashboardData = async (role) => {
  try {
    const endpoint = '/dashboard';
    const response = await api.get(endpoint);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    // Return error for component to handle
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to load dashboard data';
    throw new Error(errorMessage);
  }
};

const getUsageStats = async () => {
  try {
    const response = await api.get('/user/usage-stats');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to load usage statistics';
    throw new Error(errorMessage);
  }
};

export default {
  getDashboardData,
  getUsageStats,
};
