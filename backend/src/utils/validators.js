const mongoose = require('mongoose');

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }

  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long (max 254 characters)' };
  }

  return { valid: true, value: trimmed };
};

const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    maxLength = 128,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false,
  } = options;

  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required and must be a string' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long` };
  }

  if (password.length > maxLength) {
    return { valid: false, error: `Password must be at most ${maxLength} characters long` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

const validateObjectId = (id, fieldName = 'ID') => {
  if (!id) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const idString = id.toString();
  if (!mongoose.Types.ObjectId.isValid(idString)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  return { valid: true, value: idString };
};

const validateDate = (date, options = {}) => {
  const { required = true, minDate = null, maxDate = null, fieldName = 'Date' } = options;

  if (!date && !required) {
    return { valid: true, value: null };
  }

  if (!date && required) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  if (minDate) {
    const min = minDate instanceof Date ? minDate : new Date(minDate);
    if (parsedDate < min) {
      return { valid: false, error: `${fieldName} must be after ${min.toISOString()}` };
    }
  }

  if (maxDate) {
    const max = maxDate instanceof Date ? maxDate : new Date(maxDate);
    if (parsedDate > max) {
      return { valid: false, error: `${fieldName} must be before ${max.toISOString()}` };
    }
  }

  return { valid: true, value: parsedDate };
};

const validateString = (value, options = {}) => {
  const {
    required = true,
    minLength = 0,
    maxLength = Infinity,
    fieldName = 'Field',
    trim = true,
  } = options;

  if (!value && !required) {
    return { valid: true, value: null };
  }

  if (!value && required) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const processed = trim ? value.trim() : value;

  if (required && processed.length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  if (processed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }

  if (processed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters long` };
  }

  return { valid: true, value: processed };
};

const validateNumber = (value, options = {}) => {
  const {
    required = true,
    min = -Infinity,
    max = Infinity,
    integer = false,
    fieldName = 'Number',
  } = options;

  if ((value === null || value === undefined) && !required) {
    return { valid: true, value: null };
  }

  if ((value === null || value === undefined) && required) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const num = typeof value === 'string' ? parseFloat(value) : Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, value: integer ? Math.floor(num) : num };
};

const validateURL = (url, options = {}) => {
  const { required = true, fieldName = 'URL' } = options;

  if (!url && !required) {
    return { valid: true, value: null };
  }

  if (!url && required) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof url !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  try {
    const urlObj = new URL(url);
    return { valid: true, value: urlObj.href };
  } catch (error) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
};

const validateIPAddress = (ip, options = {}) => {
  const { required = true, fieldName = 'IP Address' } = options;

  if (!ip && !required) {
    return { valid: true, value: null };
  }

  if (!ip && required) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof ip !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }

  return { valid: true, value: ip };
};

const validateRole = (role, allowedRoles = []) => {
  if (!role || typeof role !== 'string') {
    return { valid: false, error: 'Role is required and must be a string' };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return { valid: false, error: `Role must be one of: ${allowedRoles.join(', ')}` };
  }

  return { valid: true, value: role };
};

const validateEnum = (value, allowedValues = [], fieldName = 'Field') => {
  if (!allowedValues || allowedValues.length === 0) {
    return { valid: false, error: 'No allowed values specified' };
  }

  if (!allowedValues.includes(value)) {
    return { valid: false, error: `${fieldName} must be one of: ${allowedValues.join(', ')}` };
  }

  return { valid: true, value };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateObjectId,
  validateDate,
  validateString,
  validateNumber,
  validateURL,
  validateIPAddress,
  validateRole,
  validateEnum,
};
