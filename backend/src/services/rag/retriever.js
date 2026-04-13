const { generateEmbeddings } = require('./embeddings');
const { searchSimilar } = require('./vectorStore');
const constants = require('../../config/constants');

/**
 * Main RAG engine retriever. Embeds the query and fetches relevant local chunks.
 * 
 * @param {string} queryText 
 */
const retrieveContext = async (queryText) => {
  console.log(`[Retriever] Searching matching chunks for: "${queryText}"`);
  
  // Embed query
  const queryEmbeddings = await generateEmbeddings([queryText]);
  if (!queryEmbeddings || queryEmbeddings.length === 0) return [];
  
  const queryEmbedding = queryEmbeddings[0];

  // Search vector store
  const topK = constants.MAX_RETRIEVED_CHUNKS || 3;
  const results = searchSimilar(queryEmbedding, topK);
  
  // Clean off the heavy embedding arrays before returning context
  return results
    .filter(r => r.score > 0)
    .map(r => ({
      text: r.text,
      source: r.source,
      score: r.score
    }));
};

module.exports = {
  retrieveContext
};
