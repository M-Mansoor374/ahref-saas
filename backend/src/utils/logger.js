const fs = require('fs');
const path = require('path');

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_COLORS = {
  ERROR: '\x1b[31m',
  WARN: '\x1b[33m',
  INFO: '\x1b[36m',
  DEBUG: '\x1b[35m',
  RESET: '\x1b[0m',
};

const LOG_DIR = path.join(__dirname, '../../logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024;
const MAX_LOG_FILES = 5;

const ensureLogDirectory = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const getLogFileName = (level) => {
  const date = new Date().toISOString().split('T')[0];
  return path.join(LOG_DIR, `${level.toLowerCase()}-${date}.log`);
};

const rotateLogFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const stats = fs.statSync(filePath);
  if (stats.size < MAX_LOG_SIZE) return;

  for (let i = MAX_LOG_FILES - 1; i >= 1; i--) {
    const oldFile = `${filePath}.${i}`;
    const newFile = `${filePath}.${i + 1}`;
    if (fs.existsSync(oldFile)) {
      fs.renameSync(oldFile, newFile);
    }
  }

  if (fs.existsSync(filePath)) {
    fs.renameSync(filePath, `${filePath}.1`);
  }
};

const writeToFile = (level, message, data = null) => {
  try {
    ensureLogDirectory();
    const logFile = getLogFileName(level);
    rotateLogFile(logFile);

    const timestamp = new Date().toISOString();
    let logEntry = `[${timestamp}] [${level}] ${message}`;

    if (data) {
      logEntry += `\n${JSON.stringify(data, null, 2)}`;
    }

    logEntry += '\n';

    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
};

const formatMessage = (message, ...args) => {
  if (args.length === 0) return message;
  return `${message} ${args.map((arg) => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg, null, 2);
    }
    return String(arg);
  }).join(' ')}`;
};

const getCurrentLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  return LOG_LEVELS[envLevel] !== undefined ? LOG_LEVELS[envLevel] : LOG_LEVELS.INFO;
};

const shouldLog = (level) => {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] <= currentLevel;
};

const log = (level, message, ...args) => {
  if (!shouldLog(level)) return;

  const color = LOG_COLORS[level] || '';
  const reset = LOG_COLORS.RESET;
  const formattedMessage = formatMessage(message, ...args);

  const timestamp = new Date().toISOString();
  const consoleMessage = `${color}[${timestamp}] [${level}]${reset} ${formattedMessage}`;

  console.log(consoleMessage);

  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true') {
    writeToFile(level, formattedMessage, args.length > 0 ? args : null);
  }
};

const logger = {
  error: (message, ...args) => {
    log('ERROR', message, ...args);
  },

  warn: (message, ...args) => {
    log('WARN', message, ...args);
  },

  info: (message, ...args) => {
    log('INFO', message, ...args);
  },

  debug: (message, ...args) => {
    log('DEBUG', message, ...args);
  },

  request: (req, res, responseTime = null) => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    let message = `${method} ${url} ${status}`;
    if (responseTime !== null) {
      message += ` - ${responseTime}ms`;
    }
    message += ` - ${ip} - ${userAgent}`;

    if (status >= 500) {
      logger.error(message);
    } else if (status >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  },

  errorWithStack: (error, context = '') => {
    const message = context ? `${context}: ${error.message}` : error.message;
    logger.error(message);
    if (error.stack) {
      logger.debug('Stack trace:', error.stack);
    }
    if (error.response) {
      logger.debug('Response data:', error.response.data);
    }
  },

  database: (operation, collection, data = null) => {
    const message = `DB ${operation} on ${collection}`;
    if (data) {
      logger.debug(message, data);
    } else {
      logger.debug(message);
    }
  },
};

module.exports = logger;
