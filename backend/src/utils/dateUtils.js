const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const parseDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  const parsed = new Date(dateInput);
  return isValidDate(parsed) ? parsed : null;
};

const formatDate = (date, format = 'ISO') => {
  const parsed = parseDate(date);
  if (!parsed) return null;

  switch (format) {
    case 'ISO':
      return parsed.toISOString();
    case 'date':
      return parsed.toDateString();
    case 'datetime':
      return parsed.toLocaleString();
    case 'dateonly':
      return parsed.toLocaleDateString();
    default:
      return parsed.toISOString();
  }
};

const isDateAfter = (date1, date2) => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  if (!d1 || !d2) return false;
  return d1 > d2;
};

const isDateBefore = (date1, date2) => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  if (!d1 || !d2) return false;
  return d1 < d2;
};

const isDateBetween = (date, startDate, endDate) => {
  const d = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!d || !start || !end) return false;
  return d >= start && d <= end;
};

const addDays = (date, days) => {
  const parsed = parseDate(date);
  if (!parsed) return null;
  const result = new Date(parsed);
  result.setDate(result.getDate() + days);
  return result;
};

const addMonths = (date, months) => {
  const parsed = parseDate(date);
  if (!parsed) return null;
  const result = new Date(parsed);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date, years) => {
  const parsed = parseDate(date);
  if (!parsed) return null;
  const result = new Date(parsed);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

const getDaysDifference = (date1, date2) => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  if (!d1 || !d2) return null;
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getDaysUntil = (futureDate) => {
  const future = parseDate(futureDate);
  if (!future) return null;
  const now = new Date();
  const diffTime = future - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isExpired = (expiryDate) => {
  const expiry = parseDate(expiryDate);
  if (!expiry) return false;
  return new Date() > expiry;
};

const isExpiringSoon = (expiryDate, daysThreshold = 30) => {
  const expiry = parseDate(expiryDate);
  if (!expiry) return false;
  const daysUntil = getDaysUntil(expiry);
  return daysUntil !== null && daysUntil > 0 && daysUntil <= daysThreshold;
};

const isActive = (startDate, expiryDate) => {
  const start = parseDate(startDate);
  const expiry = parseDate(expiryDate);
  if (!start || !expiry) return false;
  const now = new Date();
  return now >= start && now <= expiry;
};

const getStartOfDay = (date) => {
  const parsed = parseDate(date) || new Date();
  const result = new Date(parsed);
  result.setHours(0, 0, 0, 0);
  return result;
};

const getEndOfDay = (date) => {
  const parsed = parseDate(date) || new Date();
  const result = new Date(parsed);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getCurrentDate = () => {
  return new Date();
};

const getCurrentTimestamp = () => {
  return Date.now();
};

const validateDateRange = (startDate, expiryDate) => {
  const start = parseDate(startDate);
  const expiry = parseDate(expiryDate);
  
  if (!start || !expiry) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (expiry <= start) {
    return { valid: false, error: 'Expiry date must be after start date' };
  }
  
  return { valid: true };
};

module.exports = {
  isValidDate,
  parseDate,
  formatDate,
  isDateAfter,
  isDateBefore,
  isDateBetween,
  addDays,
  addMonths,
  addYears,
  getDaysDifference,
  getDaysUntil,
  isExpired,
  isExpiringSoon,
  isActive,
  getStartOfDay,
  getEndOfDay,
  getCurrentDate,
  getCurrentTimestamp,
  validateDateRange,
};
