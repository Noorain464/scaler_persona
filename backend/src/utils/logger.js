/**
 * Centralized logging utilities
 */

const logInfo = (message, data = {}) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, Object.keys(data).length ? data : '');
};

const logError = (message, error) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
};

const logWarn = (message, data = {}) => {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, Object.keys(data).length ? data : '');
};

module.exports = {
  logInfo,
  logError,
  logWarn
};
