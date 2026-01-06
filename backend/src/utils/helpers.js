const createResponse = (success, message, data = null, statusCode = 200) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return { response, statusCode };
};

const successResponse = (message, data = null, statusCode = 200) => {
  return createResponse(true, message, data, statusCode);
};

const errorResponse = (message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return { response, statusCode };
};

const paginate = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

const sanitizeObject = (obj, allowedFields) => {
  if (!obj || typeof obj !== 'object') return {};
  if (!Array.isArray(allowedFields)) return {};

  const sanitized = {};
  allowedFields.forEach((field) => {
    if (obj.hasOwnProperty(field)) {
      sanitized[field] = obj[field];
    }
  });
  return sanitized;
};

const removeFields = (obj, fieldsToRemove) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (!Array.isArray(fieldsToRemove)) return obj;

  const result = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete result[field];
  });
  return result;
};

const capitalizeFirst = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const camelToSnake = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const snakeToCamel = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomNumber = (min = 1000, max = 9999) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const truncateString = (str, maxLength = 50, suffix = '...') => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const isValidObjectId = (id) => {
  if (!id) return false;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id.toString());
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach((key) => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = result[key];
  }
  return result !== undefined ? result : defaultValue;
};

module.exports = {
  createResponse,
  successResponse,
  errorResponse,
  paginate,
  createPaginationMeta,
  sanitizeObject,
  removeFields,
  capitalizeFirst,
  camelToSnake,
  snakeToCamel,
  generateRandomString,
  generateRandomNumber,
  truncateString,
  isValidEmail,
  isValidObjectId,
  asyncHandler,
  delay,
  deepClone,
  isEmpty,
  getNestedValue,
};
