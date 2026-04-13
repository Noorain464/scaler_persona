import api from './api';

export const getAvailableSlots = async (date) => {
  try {
    const response = await api.get('/booking/availability', { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};

export const bookSlot = async (bookingDetails) => {
  try {
    const response = await api.post('/booking/book', bookingDetails);
    return response.data;
  } catch (error) {
    console.error('Error booking slot:', error);
    throw error;
  }
};
