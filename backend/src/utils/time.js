const formatToTimeZone = (dateStr, timeZone = 'UTC') => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', { timeZone });
};

const formatSlotForUI = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

module.exports = {
  formatToTimeZone,
  formatSlotForUI
};
