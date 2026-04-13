const OpenAI = require('openai');
const env = require('../../config/env');
const constants = require('../../config/constants');

let groqClient;

const getGroqClient = () => {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing or empty. Add it to backend/.env before calling the chat service.');
  }

  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  return groqClient;
};

/**
 * Calls Groq's OpenAI-compatible chat API with a system prompt and conversation messages.
 * @param {string} systemPrompt 
 * @param {Array} history 
 * @param {string} currentMessage 
 * @returns {string} The LLM response answer text
 */
const callLLM = async (systemPrompt, history = [], currentMessage) => {
  const groq = getGroqClient();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: currentMessage }
  ];

  const response = await groq.chat.completions.create({
    model: env.GROQ_CHAT_MODEL || constants.MODEL_NAMES.CHAT,
    messages,
    temperature: 0.2,
    max_tokens: 220,
  });

  return response.choices[0].message.content;
};

module.exports = {
  callLLM
};
