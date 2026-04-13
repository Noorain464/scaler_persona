// Note: retrieveContext will be defined in services/rag/retriever.js
const { retrieveContext } = require('../services/rag/retriever'); 
const { buildSystemPrompt } = require('../services/ai/promptService');
const { callLLM } = require('../services/ai/openaiService');
const { looksLikeBookingIntent, handleBookingFlow } = require('../services/booking/bookingFlow');

const extractEmail = (message = '') => {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
};

const findPendingBookingMessage = (history = []) => {
  for (let i = history.length - 1; i >= 0; i--) {
    const item = history[i];

    if (item?.role === 'user' && looksLikeBookingIntent(item.content || '')) {
      return item.content;
    }
  }

  return null;
};

const handleChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (history !== undefined && !Array.isArray(history)) {
      return res.status(400).json({ success: false, error: 'History must be an array when provided' });
    }

    const email = extractEmail(message);
    const pendingBookingMessage = email ? findPendingBookingMessage(history || []) : null;

    if (email && pendingBookingMessage && !looksLikeBookingIntent(message)) {
      const result = await handleBookingFlow(`${pendingBookingMessage} ${email}`);
      return res.json(result);
    }

    if (looksLikeBookingIntent(message)) {
      const result = await handleBookingFlow(message);
      return res.json(result);
    }

    // 1. Call retriever to get relevant context
    // Defaulting to an empty array for now until retriever is implemented
    let contextChunks = [];
    if (typeof retrieveContext === 'function') {
      contextChunks = await retrieveContext(message);
    }

    if (!Array.isArray(contextChunks) || contextChunks.length === 0) {
      return res.json({
        success: true,
        answer: 'I do not have any ingested resume or GitHub context yet. Please run npm run ingest from the backend folder, then ask me again.',
        sources: []
      });
    }

    // Extract sources if applicable
    const sources = contextChunks.map(c => c.source || 'unknown');

    // 2. Call prompt builder
    const systemPrompt = buildSystemPrompt(contextChunks);

    // 3. Call LLM service
    const answer = await callLLM(systemPrompt, history || [], message);

    // 4. Return answer + sources
    return res.json({
      success: true,
      answer,
      sources
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleChat
};
