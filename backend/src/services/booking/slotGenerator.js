const constants = require('../../config/constants');

const IST_OFFSET = '+05:30';

const parseHourMinute = (value) => {
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
};

const formatDatePart = (date) => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: constants.DEFAULT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const toZonedIso = (datePart, hour, minute = 0) => {
  return `${datePart}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00${IST_OFFSET}`;
};

/**
 * Checks if a proposed block intersects with any busy blocks map.
 */
const isSlotBusy = (slotStart, slotEnd, busySlots) => {
  for (const busy of busySlots) {
    const busyStart = busy.start instanceof Date ? busy.start : new Date(busy.start);
    const busyEnd = busy.end instanceof Date ? busy.end : new Date(busy.end);

    // Overlapping condition: start_target < end_busy && end_target > start_busy
    if (slotStart < busyEnd && slotEnd > busyStart) {
      return true;
    }
  }
  return false;
};

/**
 * Generate free slots for a given date by subtracting busy slots from working hours.
 * @param {Date} date 
 * @param {Array} busySlots 
 * @returns {Array} List of free slots
 */
const generateCandidateSlots = ({
  date,
  busy = [],
  durationMins = constants.DEFAULT_SLOT_DURATION_MINUTES,
  maxSlots = constants.MAX_AVAILABLE_SLOTS
}) => {
  const datePart = typeof date === 'string' ? date : formatDatePart(date);
  const startTime = parseHourMinute(constants.WORKING_HOURS.start);
  const endTime = parseHourMinute(constants.WORKING_HOURS.end);
  let pointerMinutes = startTime.hour * 60 + startTime.minute;
  const endMinutes = endTime.hour * 60 + endTime.minute;

  const availableSlots = [];
  const now = new Date(); // Important to avoid generating past times today

  while (pointerMinutes + durationMins <= endMinutes) {
    const startHour = Math.floor(pointerMinutes / 60);
    const startMinute = pointerMinutes % 60;
    const endSlotMinutes = pointerMinutes + durationMins;
    const endHour = Math.floor(endSlotMinutes / 60);
    const endMinute = endSlotMinutes % 60;
    const startIso = toZonedIso(datePart, startHour, startMinute);
    const endIso = toZonedIso(datePart, endHour, endMinute);
    const slotStart = new Date(startIso);
    const slotEnd = new Date(endIso);

    // Ensure we do not map times intersecting with busy blocks or the past
    if (!isSlotBusy(slotStart, slotEnd, busy) && slotStart > now) {
      availableSlots.push({
        start: startIso,
        end: endIso,
      });
    }

    pointerMinutes += durationMins;
  }

  return availableSlots.slice(0, maxSlots);
};

const generateFreeSlots = (date, busySlots = []) => {
  return generateCandidateSlots({ date, busy: busySlots });
};

module.exports = {
  generateCandidateSlots,
  generateFreeSlots,
  isSlotBusy,
  formatDatePart,
  toZonedIso
};
