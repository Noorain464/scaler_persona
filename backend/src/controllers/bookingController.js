const { getAvailableSlots, createInterviewEvent } = require('../services/booking/calendarService');
const { validateBooking } = require('../services/booking/bookingValidator');

const getAvailability = async (req, res, next) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ success: false, error: 'Date query param is required (YYYY-MM-DD)' });

    const availableSlots = await getAvailableSlots(date);

    // 3. Return slots
    return res.json({
      success: true,
      data: {
        date,
        availableSlots
      }
    });
  } catch (error) {
    if (error.code === 'CALENDAR_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        type: 'calendar_setup_required',
        error: error.message
      });
    }

    next(error);
  }
};

const bookSlot = async (req, res, next) => {
  try {
    const { name, email, slotStart, slotEnd } = req.body;

    // 1. Validate chosen slot
    const validationError = validateBooking(name, email, slotStart, slotEnd);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    const availableSlots = await getAvailableSlots(slotStart.slice(0, 10), { maxSlots: Number.POSITIVE_INFINITY });
    const slotStillAvailable = availableSlots.some(slot => (
      new Date(slot.start).getTime() === new Date(slotStart).getTime() &&
      new Date(slot.end).getTime() === new Date(slotEnd).getTime()
    ));

    if (!slotStillAvailable) {
      return res.status(409).json({
        success: false,
        error: 'That slot is no longer available. Please choose another slot.'
      });
    }

    // 2. Create event via calendar service
    const event = await createInterviewEvent({
      name,
      email,
      start: slotStart,
      end: slotEnd
    });

    // 3. Return confirmation
    return res.json({
      success: true,
      message: 'Booking confirmed successfully',
      eventDetails: event
    });
  } catch (error) {
    if (error.code === 'CALENDAR_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        type: 'calendar_setup_required',
        error: error.message
      });
    }

    next(error);
  }
};

module.exports = {
  getAvailability,
  bookSlot
};
