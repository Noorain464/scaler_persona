const { checkAvailability, createBooking, getProfileContext, getRepoContext } = require('../services/voice/vapiTools');
const constants = require('../config/constants');

const formatSlotForVoice = (slot) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: constants.DEFAULT_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(slot.start));
};

const checkAvailabilityController = async (req, res) => {
  try {
    const { dateStr, date } = req.body;
    const targetDate = dateStr || date;
    const slots = await checkAvailability(targetDate);
    const spokenSlots = slots.slice(0, 3).map(formatSlotForVoice);

    res.json({
      success: true,
      slots,
      spokenResponse: spokenSlots.length
        ? `I'm available at ${spokenSlots.join(', ')}. Which one works for you?`
        : `I don't see any open slots for that date. I can suggest another day if you'd like.`
    });
  } catch (error) {
    res.status(error.code === 'CALENDAR_NOT_CONFIGURED' ? 503 : 500).json({
      success: false,
      error: error.message
    });
  }
};

const createBookingController = async (req, res) => {
  try {
    const { name, email, start, end } = req.body;
    const event = await createBooking(name, email, start, end);

    res.json({
      success: true,
      eventId: event.id,
      eventLink: event.link,
      meetLink: event.meetLink,
      eventDetails: event,
      spokenResponse: `Perfect, I've booked that for you. A calendar invite will be sent shortly.`
    });
  } catch (error) {
    res.status(error.code === 'CALENDAR_NOT_CONFIGURED' ? 503 : 400).json({
      success: false,
      error: error.message
    });
  }
};

const getProfileInfoController = async (req, res) => {
  try {
    const { query } = req.body;
    const context = await getProfileContext(query);
    res.json({
      success: true,
      context: context || "I don't have that information."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRepoInfoController = async (req, res) => {
  try {
    const { repoName } = req.body;
    const context = await getRepoContext(repoName);
    res.json({
      success: true,
      context: context || "I don't have that information."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  checkAvailabilityController,
  createBookingController,
  getProfileInfoController,
  getRepoInfoController,
  handleCheckAvailability: checkAvailabilityController,
  handleBookSlot: createBookingController,
  handleGetProfileInfo: getProfileInfoController,
  handleGetRepoInfo: getRepoInfoController
};
