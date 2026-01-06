export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
};

export const setCookie = (name, value, days = 7, options = {}) => {
  if (typeof document === 'undefined') return;
  
  const {
    path = '/',
    domain = null,
    secure = false,
    sameSite = 'Lax',
  } = options;
  
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  
  let cookieString = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  if (secure) {
    cookieString += '; secure';
  }
  
  if (sameSite) {
    cookieString += `; SameSite=${sameSite}`;
  }
  
  document.cookie = cookieString;
};

export const deleteCookie = (name, path = '/', domain = null) => {
  if (typeof document === 'undefined') return;
  
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  document.cookie = cookieString;
};

export const getAllCookies = () => {
  if (typeof document === 'undefined') return {};
  
  const cookies = {};
  const cookieArray = document.cookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    const cookie = cookieArray[i].trim();
    if (cookie) {
      const [name, value] = cookie.split('=');
      cookies[name] = decodeURIComponent(value || '');
    }
  }
  
  return cookies;
};

export const parseCookieString = (cookieString) => {
  if (!cookieString || typeof cookieString !== 'string') return null;
  
  const parts = cookieString.split(';').map(part => part.trim());
  const [nameValue] = parts;
  const [name, value] = nameValue.split('=');
  
  if (!name) return null;
  
  const cookie = {
    name: name.trim(),
    value: value ? decodeURIComponent(value.trim()) : '',
  };
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const [key, val] = part.split('=');
    const lowerKey = key.toLowerCase();
    
    switch (lowerKey) {
      case 'domain':
        cookie.domain = val;
        break;
      case 'path':
        cookie.path = val || '/';
        break;
      case 'expires':
        cookie.expires = new Date(val);
        break;
      case 'max-age':
        cookie.maxAge = parseInt(val, 10);
        if (cookie.maxAge) {
          cookie.expires = new Date(Date.now() + cookie.maxAge * 1000);
        }
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = val;
        break;
      default:
        break;
    }
  }
  
  return cookie;
};

export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

export const clearAllCookies = () => {
  if (typeof document === 'undefined') return;
  
  const cookies = getAllCookies();
  Object.keys(cookies).forEach(name => {
    deleteCookie(name);
  });
};

export default {
  getCookie,
  setCookie,
  deleteCookie,
  getAllCookies,
  parseCookieString,
  hasCookie,
  clearAllCookies,
};
