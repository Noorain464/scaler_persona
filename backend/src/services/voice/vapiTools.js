const { getAvailableSlots, createInterviewEvent } = require('../booking/calendarService');
const { validateBooking } = require('../booking/bookingValidator');
const { retrieveContext } = require('../rag/retriever');

const checkAvailability = async (dateStr) => {
  if (!dateStr) throw new Error('dateStr is required.');
  return getAvailableSlots(dateStr);
};

const createBooking = async (name, email, start, end) => {
  const errorMsg = validateBooking(name, email, start, end);
  if (errorMsg) throw new Error(errorMsg);

  const availableSlots = await getAvailableSlots(start.slice(0, 10), { maxSlots: Number.POSITIVE_INFINITY });
  const slotStillAvailable = availableSlots.some(slot => (
    new Date(slot.start).getTime() === new Date(start).getTime() &&
    new Date(slot.end).getTime() === new Date(end).getTime()
  ));

  if (!slotStillAvailable) {
    throw new Error('That slot is no longer available. Please choose another slot.');
  }

  return createInterviewEvent({ name, email, start, end });
};

const getProfileContext = async (query) => {
  const chunks = await retrieveContext(query);
  return chunks.map(c => c.text).join('\n---\n');
};

const getRepoContext = async (repoName) => {
  const chunks = await retrieveContext(`Information about the repository named ${repoName}`);
  return chunks.map(c => c.text).join('\n---\n');
};

module.exports = {
  checkAvailability,
  createBooking,
  getProfileContext,
  getRepoContext
};
