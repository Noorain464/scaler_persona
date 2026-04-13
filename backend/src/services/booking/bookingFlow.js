const constants = require('../../config/constants');
const { getAvailableSlots, createInterviewEvent } = require('./calendarService');
const { formatDatePart, toZonedIso } = require('./slotGenerator');

const bookingKeywords = [
  'available',
  'availability',
  'free',
  'book',
  'booking',
  'schedule',
  'meeting',
  'interview',
  'slot',
  'calendar',
  'tomorrow',
  'this week'
];

const looksLikeBookingIntent = (message = '') => {
  const text = message.toLowerCase();
  return bookingKeywords.some(word => text.includes(word));
};

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const parseDatePart = (message = '') => {
  const text = message.toLowerCase();
  const explicitDate = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);

  if (explicitDate) return explicitDate[1];
  if (text.includes('day after tomorrow')) return formatDatePart(addDays(2));
  if (text.includes('tomorrow')) return formatDatePart(addDays(1));
  if (text.includes('today')) return formatDatePart(addDays(0));

  return formatDatePart(addDays(1));
};

const parseTime = (message = '') => {
  const twelveHour = message.match(/\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(am|pm)\b/i);

  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2] || 0);
    const meridiem = twelveHour[3].toLowerCase();

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return { hour, minute };
  }

  const twentyFourHour = message.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHour) {
    return {
      hour: Number(twentyFourHour[1]),
      minute: Number(twentyFourHour[2])
    };
  }

  return null;
};

const parseEmail = (message = '') => {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
};

const parseName = (message = '', email) => {
  const nameMatch = message.match(/\b(?:name is|for)\s+([a-z][a-z\s]{1,40})(?:\s+under|\s+at|\s+on|$)/i);
  if (nameMatch) {
    return nameMatch[1].trim().replace(/\s+/g, ' ');
  }

  return email ? email.split('@')[0] : 'Recruiter';
};

const formatDateLabel = (datePart) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: constants.DEFAULT_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(`${datePart}T00:00:00+05:30`));
};

const formatTimeLabel = (isoDate) => {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: constants.DEFAULT_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(isoDate));

  return `${time} IST`;
};

const formatAvailabilityMessage = (datePart, slots) => {
  if (!slots.length) {
    return `I don't have open slots on ${formatDateLabel(datePart)}. Share another date and I'll check it.`;
  }

  return `I'm available on ${formatDateLabel(datePart)}. Pick a slot below and share the email address for the calendar invite.`;
};

const findMatchingSlot = (slots, desiredStart) => {
  const desiredTime = new Date(desiredStart).getTime();
  return slots.find(slot => new Date(slot.start).getTime() === desiredTime);
};

const getAvailabilityResult = async (datePart) => {
  let slots;

  try {
    slots = await getAvailableSlots(datePart);
  } catch (error) {
    if (error.code === 'CALENDAR_NOT_CONFIGURED') {
      return {
        success: false,
        type: 'calendar_setup_required',
        answer: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can show real availability.',
        message: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can show real availability.',
        missingConfig: true
      };
    }

    throw error;
  }

  return {
    success: true,
    type: 'availability',
    answer: formatAvailabilityMessage(datePart, slots),
    message: formatAvailabilityMessage(datePart, slots),
    slots: slots.map(slot => slot.start),
    slotDetails: slots,
    timezone: constants.DEFAULT_TIME_ZONE
  };
};

const handleBookingFlow = async (message = '') => {
  const datePart = parseDatePart(message);
  const parsedTime = parseTime(message);
  const email = parseEmail(message);
  const wantsToBook = /\b(book|schedule|confirm|reserve)\b/i.test(message);

  if (!wantsToBook || !parsedTime) {
    return getAvailabilityResult(datePart);
  }

  if (!email) {
    return {
      success: true,
      type: 'booking_needs_email',
      answer: "Sure, I can book that. Please share the recruiter's email address for the calendar invite.",
      message: "Sure, I can book that. Please share the recruiter's email address for the calendar invite."
    };
  }

  let availableSlots;

  try {
    availableSlots = await getAvailableSlots(datePart, { maxSlots: Number.POSITIVE_INFINITY });
  } catch (error) {
    if (error.code === 'CALENDAR_NOT_CONFIGURED') {
      return {
        success: false,
        type: 'calendar_setup_required',
        answer: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can book real slots.',
        message: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can book real slots.',
        missingConfig: true
      };
    }

    throw error;
  }
  const desiredStart = toZonedIso(datePart, parsedTime.hour, parsedTime.minute);
  if (new Date(desiredStart) <= new Date()) {
    return {
      success: true,
      type: 'booking_error',
      answer: 'That time has already passed. Please choose one of the available slots.',
      message: 'That time has already passed. Please choose one of the available slots.',
      slots: availableSlots.map(slot => slot.start),
      slotDetails: availableSlots,
      timezone: constants.DEFAULT_TIME_ZONE
    };
  }

  const matchingSlot = findMatchingSlot(availableSlots, desiredStart);

  if (!matchingSlot) {
    return {
      success: true,
      type: 'availability',
      answer: [
        `That slot is not available on ${formatDateLabel(datePart)}.`,
        formatAvailabilityMessage(datePart, availableSlots)
      ].join('\n'),
      message: [
        `That slot is not available on ${formatDateLabel(datePart)}.`,
        formatAvailabilityMessage(datePart, availableSlots)
      ].join('\n'),
      slots: availableSlots.map(slot => slot.start),
      slotDetails: availableSlots,
      timezone: constants.DEFAULT_TIME_ZONE
    };
  }

  let event;

  try {
    event = await createInterviewEvent({
      name: parseName(message, email),
      email,
      start: matchingSlot.start,
      end: matchingSlot.end
    });
  } catch (error) {
    if (error.code === 'CALENDAR_NOT_CONFIGURED') {
      return {
        success: false,
        type: 'calendar_setup_required',
        answer: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can book real slots.',
        message: 'Calendar booking is not connected yet. Add GOOGLE_REFRESH_TOKEN in backend/.env, restart the backend, and I can book real slots.',
        missingConfig: true
      };
    }

    throw error;
  }

  const answer = [
    "Perfect - you're all set.",
    '',
    `${formatDateLabel(datePart)}`,
    `${formatTimeLabel(matchingSlot.start)}`,
    '',
    "You'll receive a calendar invite shortly.",
    'Looking forward to speaking with you!'
  ].join('\n');

  return {
    success: true,
    type: 'booking_confirmation',
    answer,
    message: answer,
    eventId: event.id,
    eventStatus: event.status,
    eventLink: event.link,
    meetLink: event.meetLink,
    eventDetails: event
  };
};

module.exports = {
  looksLikeBookingIntent,
  handleBookingFlow,
  parseDatePart,
  parseTime
};
