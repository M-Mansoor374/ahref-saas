/**
 * Shared Validation Schemas
 * Validation schemas used on both frontend and backend
 */

/**
 * Email validation regex
 * @constant {RegExp}
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * IP address validation regex (IPv4)
 * @constant {RegExp}
 */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Password validation regex
 * At least 6 characters, can contain letters, numbers, and special characters
 * @constant {RegExp}
 */
const PASSWORD_REGEX = /^.{6,}$/;

/**
 * Validation Rules
 * @constant {Object}
 */
const VALIDATION_RULES = {
  EMAIL_MAX_LENGTH: 254,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  STRING_MAX_LENGTH: 500,
  TEXT_MAX_LENGTH: 5000,
};

/**
 * Validate email address
 * 
 * @param {string} email - Email address to validate
 * @returns {Object} Validation result with isValid and message
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (email.length > VALIDATION_RULES.EMAIL_MAX_LENGTH) {
    return { isValid: false, message: `Email must be less than ${VALIDATION_RULES.EMAIL_MAX_LENGTH} characters` };
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password
 * 
 * @param {string} password - Password to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength] - Minimum length (default: 6)
 * @param {number} [options.maxLength] - Maximum length (default: 128)
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password, options = {}) => {
  const minLength = options.minLength || VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  const maxLength = options.maxLength || VALIDATION_RULES.PASSWORD_MAX_LENGTH;
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters` };
  }
  
  if (password.length > maxLength) {
    return { isValid: false, message: `Password must be less than ${maxLength} characters` };
  }
  
  if (!PASSWORD_REGEX.test(password)) {
    return { isValid: false, message: 'Password does not meet requirements' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate name
 * 
 * @param {string} name - Name to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength] - Minimum length (default: 2)
 * @param {number} [options.maxLength] - Maximum length (default: 100)
 * @param {string} [options.fieldName] - Field name for error message (default: 'Name')
 * @returns {Object} Validation result with isValid and message
 */
const validateName = (name, options = {}) => {
  const minLength = options.minLength || VALIDATION_RULES.NAME_MIN_LENGTH;
  const maxLength = options.maxLength || VALIDATION_RULES.NAME_MAX_LENGTH;
  const fieldName = options.fieldName || 'Name';
  
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (trimmedName.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate IP address (IPv4)
 * 
 * @param {string} ipAddress - IP address to validate
 * @returns {Object} Validation result with isValid and message
 */
const validateIPAddress = (ipAddress) => {
  if (!ipAddress || typeof ipAddress !== 'string') {
    return { isValid: false, message: 'IP address is required' };
  }
  
  const trimmedIP = ipAddress.trim();
  
  if (!IPV4_REGEX.test(trimmedIP)) {
    return { isValid: false, message: 'Please enter a valid IPv4 address' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate date
 * 
 * @param {string|Date} date - Date to validate
 * @param {Object} [options] - Validation options
 * @param {Date} [options.minDate] - Minimum date
 * @param {Date} [options.maxDate] - Maximum date
 * @returns {Object} Validation result with isValid and message
 */
const validateDate = (date, options = {}) => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: 'Please enter a valid date' };
  }
  
  if (options.minDate && dateObj < new Date(options.minDate)) {
    return { isValid: false, message: `Date must be after ${new Date(options.minDate).toLocaleDateString()}` };
  }
  
  if (options.maxDate && dateObj > new Date(options.maxDate)) {
    return { isValid: false, message: `Date must be before ${new Date(options.maxDate).toLocaleDateString()}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate date range
 * 
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Object} Validation result with isValid and message
 */
const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Both start and end dates are required' };
  }
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: 'Please enter valid dates' };
  }
  
  if (end < start) {
    return { isValid: false, message: 'End date must be after start date' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate number
 * 
 * @param {number|string} value - Number to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.min] - Minimum value
 * @param {number} [options.max] - Maximum value
 * @param {boolean} [options.integer] - Must be integer
 * @returns {Object} Validation result with isValid and message
 */
const validateNumber = (value, options = {}) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: 'Number is required' };
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a valid number' };
  }
  
  if (options.integer && !Number.isInteger(num)) {
    return { isValid: false, message: 'Must be an integer' };
  }
  
  if (options.min !== undefined && num < options.min) {
    return { isValid: false, message: `Must be at least ${options.min}` };
  }
  
  if (options.max !== undefined && num > options.max) {
    return { isValid: false, message: `Must be at most ${options.max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * 
 * @param {*} value - Value to validate
 * @param {string} [fieldName] - Field name for error message
 * @returns {Object} Validation result with isValid and message
 */
const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate string length
 * 
 * @param {string} value - String to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength] - Minimum length
 * @param {number} [options.maxLength] - Maximum length
 * @param {string} [options.fieldName] - Field name for error message
 * @returns {Object} Validation result with isValid and message
 */
const validateStringLength = (value, options = {}) => {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: `${options.fieldName || 'Field'} is required` };
  }
  
  const trimmed = value.trim();
  
  if (options.minLength !== undefined && trimmed.length < options.minLength) {
    return { isValid: false, message: `${options.fieldName || 'Field'} must be at least ${options.minLength} characters` };
  }
  
  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    return { isValid: false, message: `${options.fieldName || 'Field'} must be less than ${options.maxLength} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate login credentials
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Object} Validation result with isValid, message, and errors
 */
const validateLoginCredentials = (credentials) => {
  const errors = {};
  let isValid = true;
  
  const emailValidation = validateEmail(credentials.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  const passwordValidation = validatePassword(credentials.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
    isValid = false;
  }
  
  return {
    isValid,
    message: isValid ? '' : 'Please fix the errors below',
    errors,
  };
};

/**
 * Validate user creation data
 * 
 * @param {Object} userData - User data
 * @returns {Object} Validation result with isValid, message, and errors
 */
const validateUserData = (userData) => {
  const errors = {};
  let isValid = true;
  
  const nameValidation = validateName(userData.name, { fieldName: 'Name' });
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
    isValid = false;
  }
  
  const emailValidation = validateEmail(userData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
    isValid = false;
  }
  
  if (userData.password) {
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message;
      isValid = false;
    }
  }
  
  if (userData.keywordLimit !== undefined) {
    const limitValidation = validateNumber(userData.keywordLimit, { min: 0, integer: true });
    if (!limitValidation.isValid) {
      errors.keywordLimit = limitValidation.message;
      isValid = false;
    }
  }
  
  if (userData.assignedIP) {
    const ipValidation = validateIPAddress(userData.assignedIP);
    if (!ipValidation.isValid) {
      errors.assignedIP = ipValidation.message;
      isValid = false;
    }
  }
  
  if (userData.startDate && userData.expiryDate) {
    const dateRangeValidation = validateDateRange(userData.startDate, userData.expiryDate);
    if (!dateRangeValidation.isValid) {
      errors.expiryDate = dateRangeValidation.message;
      isValid = false;
    }
  }
  
  return {
    isValid,
    message: isValid ? '' : 'Please fix the errors below',
    errors,
  };
};

module.exports = {
  EMAIL_REGEX,
  IPV4_REGEX,
  PASSWORD_REGEX,
  VALIDATION_RULES,
  validateEmail,
  validatePassword,
  validateName,
  validateIPAddress,
  validateDate,
  validateDateRange,
  validateNumber,
  validateRequired,
  validateStringLength,
  validateLoginCredentials,
  validateUserData,
};
