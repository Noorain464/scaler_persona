const { checkAvailability, createBooking, getProfileContext, getRepoContext } = require('../services/voice/vapiTools');

const handleCheckAvailability = async (req, res, next) => {
  try {
    const { date } = req.body;
    const slots = await checkAvailability(date);
    res.json({ success: true, result: `Available slots for ${date}: ${slots.length ? slots.join(', ') : 'No slots'}` });
  } catch (error) { next(error); }
};

const handleBookSlot = async (req, res, next) => {
  try {
    const { name, email, start, end } = req.body;
    const booking = await createBooking(name, email, start, end);
    res.json({ success: true, result: `Booking confirmed successfully for ${name}. Details: event link generated.` });
  } catch (error) { next(error); }
};

const handleGetProfileInfo = async (req, res, next) => {
  try {
    const { query } = req.body;
    const context = await getProfileContext(query);
    res.json({ success: true, result: context || "No relevant profile info found." });
  } catch (error) { next(error); }
};

const handleGetRepoInfo = async (req, res, next) => {
  try {
    const { repoName } = req.body;
    const context = await getRepoContext(repoName);
    res.json({ success: true, result: context || "No relevant repo info found." });
  } catch (error) { next(error); }
};

module.exports = {
  handleCheckAvailability,
  handleBookSlot,
  handleGetProfileInfo,
  handleGetRepoInfo
};
