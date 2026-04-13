/**
 * Common App Helper Functions
 */

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const parseJsonSafe = (jsonStr, fallback = null) => {
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    return fallback;
  }
};

module.exports = {
  delay,
  parseJsonSafe
};
