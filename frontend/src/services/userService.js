import api from './api';

const getDashboardData = async () => {
  try {
    const response = await api.get('/user/dashboard');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
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

const accessTool = async () => {
  try {
    const response = await api.post('/user/tool/access');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to access tool';
    throw new Error(errorMessage);
  }
};

const getProfile = async () => {
  try {
    const response = await api.get('/user/profile');
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to load profile';
    throw new Error(errorMessage);
  }
};

export default {
  getDashboardData,
  getUsageStats,
  accessTool,
  getProfile,
};
