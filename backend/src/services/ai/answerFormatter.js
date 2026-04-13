/**
 * Standardize the response payload formatting
 * @param {string} answerText 
 * @param {Array} sources 
 * @returns {Object} Structured response payload
 */
const formatAnswer = (answerText, sources = []) => {
  // Simple heuristic for suggesting booking: check if output mentions related keywords
  const lowerAnswer = answerText.toLowerCase();
  const suggestBooking = lowerAnswer.includes('book') || 
                         lowerAnswer.includes('interview') || 
                         lowerAnswer.includes('schedule') || 
                         lowerAnswer.includes('meeting') ||
                         lowerAnswer.includes('availability');

  return {
    success: true,
    data: {
      text: answerText,
      sources,
      suggestedActions: suggestBooking ? ['book_interview'] : []
    }
  };
};

module.exports = {
  formatAnswer
};
