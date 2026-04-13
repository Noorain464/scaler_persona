const constants = require('../../config/constants');

const getHourInAppTimezone = (date) => {
  const hour = new Intl.DateTimeFormat('en-US', {
    timeZone: constants.DEFAULT_TIME_ZONE,
    hour: '2-digit',
    hour12: false
  }).format(date);

  return Number(hour);
};

/**
 * Validate a booking request for required fields, future time, and working hours
 * @param {string} name 
 * @param {string} email 
 * @param {string|Date} slotStart 
 * @param {string|Date} slotEnd 
 * @returns {string|null} Returns an error message string if invalid, or null if valid
 */
const validateBooking = (name, email, slotStart, slotEnd) => {
  if (!name || name.trim() === '') return 'Name is required.';
  if (!email || email.trim() === '') return 'Email is required.';
  if (!slotStart || !slotEnd) return 'Slot start and end times are required.';

  const start = new Date(slotStart);
  const now = new Date();

  // Check if slot is in the future
  if (start <= now) {
    return 'Slot must be scheduled in the future.';
  }

  // Check if inside working hours
  const hr = getHourInAppTimezone(start);
  const startHr = parseInt(constants.WORKING_HOURS.start.split(':')[0], 10);
  const endHr = parseInt(constants.WORKING_HOURS.end.split(':')[0], 10);

  if (hr < startHr || hr >= endHr) {
    return `Slot must be within working hours (${constants.WORKING_HOURS.start} - ${constants.WORKING_HOURS.end}).`;
  }

  return null;
};

module.exports = {
  validateBooking
};
