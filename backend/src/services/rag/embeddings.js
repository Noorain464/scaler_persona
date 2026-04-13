const constants = require('../../config/constants');

const EMBEDDING_DIMENSIONS = constants.EMBEDDING_DIMENSIONS || 384;

const tokenize = (text) => {
  return String(text || '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) || [];
};

const hashToken = (token) => {
  let hash = 2166136261;

  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const createLocalEmbedding = (text) => {
  const vector = new Array(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenize(text);

  tokens.forEach((token) => {
    const hash = hashToken(token);
    const index = hash % EMBEDDING_DIMENSIONS;
    const sign = hash & 1 ? 1 : -1;
    vector[index] += sign;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return vector;

  return vector.map(value => value / magnitude);
};

/**
 * Convert an array of text strings into local deterministic embeddings.
 *
 * Groq provides OpenAI-compatible chat completions, but not an embeddings
 * endpoint in the API used by this app. This keeps RAG usable without an
 * OPENAI_API_KEY and without calling OpenAI.
 * 
 * @param {Array<string>} texts 
 * @returns {Array<Array<number>>} List of numerical embedding arrays
 */
const generateEmbeddings = async (texts) => {
  if (!texts || texts.length === 0) return [];

  try {
    return texts.map(createLocalEmbedding);
  } catch (error) {
    console.error(`[Embeddings Service] Failed to generate embeddings:`, error.message);
    throw error;
  }
};

/**
 * Convenience function to attach generated embeddings directly onto chunk objects.
 * 
 * @param {Array<Object>} chunks - Array of objects with a 'text' property
 * @returns {Array<Object>} The same array of objects with an added 'embedding' property
 */
const appendEmbeddingsToChunks = async (chunks) => {
  if (!chunks || chunks.length === 0) return chunks;

  const texts = chunks.map(c => c.text);
  const rawEmbeddings = await generateEmbeddings(texts);

  return chunks.map((chunk, idx) => ({
    ...chunk,
    embedding: rawEmbeddings[idx]
  }));
};

module.exports = {
  generateEmbeddings,
  appendEmbeddingsToChunks
};
