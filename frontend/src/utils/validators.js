export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password, minLength = 8) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < minLength) return false;
  return true;
};

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim().length === 0) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

export const validateNumber = (value, min = null, max = null) => {
  if (value === null || value === undefined) return false;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validateInteger = (value, min = null, max = null) => {
  if (value === null || value === undefined) return false;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num) || !Number.isInteger(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
};

export const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateIP = (ip) => {
  if (!ip || typeof ip !== 'string') return false;
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const validateDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

export const validateLength = (value, min = null, max = null) => {
  if (value === null || value === undefined) return false;
  const length = typeof value === 'string' ? value.length : (Array.isArray(value) ? value.length : 0);
  if (min !== null && length < min) return false;
  if (max !== null && length > max) return false;
  return true;
};

export const validateAlphaNumeric = (value) => {
  if (!value || typeof value !== 'string') return false;
  const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
  return alphaNumericRegex.test(value);
};

export const validateHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateNumber,
  validateInteger,
  validateURL,
  validateIP,
  validateDate,
  validateDateRange,
  validateLength,
  validateAlphaNumeric,
  validateHexColor,
  validatePhone,
};
