const { google } = require('googleapis');
const env = require('../../config/env');
const constants = require('../../config/constants');
const { generateCandidateSlots, formatDatePart, toZonedIso } = require('./slotGenerator');

// Initialization of OAuth2
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

// We rely on a long-lived refresh token saved securely
oauth2Client.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const generateGoogleAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
};

const getTokensFromCode = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const ensureCalendarConfigured = () => {
  const missing = [];

  if (!env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!env.GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI');
  if (!env.GOOGLE_REFRESH_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN');

  if (missing.length > 0) {
    const error = new Error(`Google Calendar is not connected. Missing: ${missing.join(', ')}`);
    error.code = 'CALENDAR_NOT_CONFIGURED';
    throw error;
  }
};

const getDayBounds = (date) => {
  const datePart = typeof date === 'string' ? date : formatDatePart(date);

  return {
    timeMin: toZonedIso(datePart, 0, 0),
    timeMax: toZonedIso(datePart, 23, 59)
  };
};

const getBusySlots = async (dateOrTimeMin, maybeTimeMax) => {
  const hasExplicitRange = typeof maybeTimeMax === 'string';
  const { timeMin, timeMax } = hasExplicitRange
    ? { timeMin: dateOrTimeMin, timeMax: maybeTimeMax }
    : getDayBounds(dateOrTimeMin);

  console.log(`[Calendar Service] Getting busy slots from ${timeMin} to ${timeMax}`);

  try {
    ensureCalendarConfigured();

    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin,
        timeMax,
        timeZone: constants.DEFAULT_TIME_ZONE,
        items: [{ id: 'primary' }],
      },
    });

    const primaryBusy = res.data.calendars.primary.busy || [];
    return primaryBusy.map(b => ({
      start: b.start,
      end: b.end
    }));
  } catch (error) {
    console.error('[Calendar Service] Error fetching busy free/busy block:', error);
    throw error;
  }
};

const getAvailableSlots = async (date, options = {}) => {
  const busy = await getBusySlots(date);
  return generateCandidateSlots({ date, busy, ...options });
};

/**
 * Create an event in Google Calendar
 * @param {Object} data - { name, email, start, end }
 * @returns {Object} Event confirmation details
 */
const createInterviewEvent = async (data) => {
  console.log(`[Calendar Service] Booking event for ${data.name} on ${data.start}`);
  
  const event = {
    summary: `Interview with ${data.name}`,
    description: `Interview scheduled via Syeda Noorain's portfolio.\n\nAttendee: ${data.email}`,
    start: {
      dateTime: data.start,
      timeZone: constants.DEFAULT_TIME_ZONE,
    },
    end: {
      dateTime: data.end,
      timeZone: constants.DEFAULT_TIME_ZONE,
    },
    attendees: data.email ? [{ email: data.email }] : [],
    reminders: {
      useDefault: true,
    },
    conferenceData: {
      createRequest: {
        requestId: `req-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  try {
    ensureCalendarConfigured();

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1, 
      sendUpdates: 'all',
    });

    return {
      id: res.data.id,
      status: res.data.status,
      summary: res.data.summary,
      link: res.data.htmlLink,
      meetLink: res.data.hangoutLink,
      organizer: res.data.organizer,
      creator: res.data.creator,
      start: data.start,
      end: data.end
    };
  } catch (error) {
    console.error('[Calendar Service] Error creating event:', error);
    const calendarError = new Error(error.message || 'Failed to create calendar event.');
    calendarError.code = error.code || error.response?.status || 'CALENDAR_EVENT_CREATE_FAILED';
    calendarError.details = error.errors || error.response?.data || null;
    throw calendarError;
  }
};

module.exports = {
  getBusySlots,
  getAvailableSlots,
  createInterviewEvent,
  ensureCalendarConfigured,
  generateGoogleAuthUrl,
  getTokensFromCode
};
