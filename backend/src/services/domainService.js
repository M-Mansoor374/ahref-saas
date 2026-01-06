const { validateURL } = require('../utils/validators');

const extractDomain = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    let urlString = url.trim();

    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = `https://${urlString}`;
    }

    const urlObj = new URL(urlString);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return null;
  }
};

const validateDomain = (domain) => {
  if (!domain || typeof domain !== 'string') {
    return { valid: false, error: 'Domain is required and must be a string' };
  }

  const trimmed = domain.trim().toLowerCase();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Domain cannot be empty' };
  }

  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;

  if (!domainRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid domain format' };
  }

  if (trimmed.length > 253) {
    return { valid: false, error: 'Domain is too long (max 253 characters)' };
  }

  return { valid: true, value: trimmed };
};

const normalizeDomain = (domain) => {
  const validation = validateDomain(domain);

  if (!validation.valid) {
    return null;
  }

  return validation.value.replace(/^www\./, '');
};

const getDomainInfo = (domain) => {
  const normalized = normalizeDomain(domain);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split('.');
  const tld = parts[parts.length - 1];
  const sld = parts.length > 1 ? parts[parts.length - 2] : null;
  const subdomain = parts.length > 2 ? parts.slice(0, -2).join('.') : null;

  return {
    domain: normalized,
    tld,
    sld,
    subdomain,
    fullDomain: normalized,
  };
};

const isSubdomain = (domain) => {
  const info = getDomainInfo(domain);
  return info && info.subdomain !== null;
};

const getRootDomain = (domain) => {
  const info = getDomainInfo(domain);
  if (!info) return null;

  if (info.sld && info.tld) {
    return `${info.sld}.${info.tld}`;
  }

  return info.domain;
};

module.exports = {
  extractDomain,
  validateDomain,
  normalizeDomain,
  getDomainInfo,
  isSubdomain,
  getRootDomain,
};
