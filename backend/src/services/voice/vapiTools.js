const { getBusySlots, createInterviewEvent } = require('../booking/calendarService');
const { generateFreeSlots } = require('../booking/slotGenerator');
const { validateBooking } = require('../booking/bookingValidator');
const { retrieveContext } = require('../rag/retriever');

const checkAvailability = async (dateStr) => {
  const targetDate = new Date(dateStr);
  const busySlots = await getBusySlots(targetDate);
  return generateFreeSlots(targetDate, busySlots);
};

const createBooking = async (name, email, start, end) => {
  // Reusing the chat/booking logic completely
  const errorMsg = validateBooking(name, email, start, end);
  if (errorMsg) throw new Error(errorMsg);

  return await createInterviewEvent({ name, email, start, end });
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
