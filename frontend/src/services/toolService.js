import api from './api';

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

const searchKeywords = async (query, params = {}) => {
  try {
    if (!query || !query.trim()) {
      throw new Error('Search query is required');
    }

    const { country = 'us', database = 'live', limit = 100 } = params;

    const response = await api.post('/api/keywords/search', {
      query: query.trim(),
      country,
      database,
      limit: parseInt(limit, 10),
    });

    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to search keywords';
    throw new Error(errorMessage);
  }
};

const getKeywordMetrics = async (keyword) => {
  try {
    if (!keyword || !keyword.trim()) {
      throw new Error('Keyword is required');
    }

    const response = await api.get(`/api/keywords/metrics?keyword=${encodeURIComponent(keyword.trim())}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to get keyword metrics';
    throw new Error(errorMessage);
  }
};

const getBacklinks = async (domain, params = {}) => {
  try {
    if (!domain || !domain.trim()) {
      throw new Error('Domain is required');
    }

    const { page = 1, limit = 100 } = params;
    const queryParams = new URLSearchParams({
      domain: domain.trim(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`/api/backlinks?${queryParams}`);
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to get backlinks';
    throw new Error(errorMessage);
  }
};

const getDomainRank = async (domain) => {
  try {
    if (!domain || !domain.trim()) {
      throw new Error('Domain is required');
    }

    const response = await api.get(`/api/domain/rank?domain=${encodeURIComponent(domain.trim())}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to get domain rank';
    throw new Error(errorMessage);
  }
};

const getCompetitorAnalysis = async (domain, params = {}) => {
  try {
    if (!domain || !domain.trim()) {
      throw new Error('Domain is required');
    }

    const { limit = 10 } = params;
    const queryParams = new URLSearchParams({
      domain: domain.trim(),
      limit: limit.toString(),
    });

    const response = await api.get(`/api/competitors?${queryParams}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Failed to get competitor analysis';
    throw new Error(errorMessage);
  }
};

export default {
  accessTool,
  searchKeywords,
  getKeywordMetrics,
  getBacklinks,
  getDomainRank,
  getCompetitorAnalysis,
};
