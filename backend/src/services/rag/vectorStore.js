const fs = require('fs');
const path = require('path');

const STORE_PATH = path.resolve(__dirname, '../../data/processed/embeddings.json');

// Helper to compute dot product over norms for chunk scoring
const cosineSimilarity = (vecA, vecB) => {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const saveEmbeddings = (chunks) => {
  // Simple JSON storage for now. Easily upgradable to pgvector/Pinecone.
  fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(chunks, null, 2));
};

const loadEmbeddings = () => {
  if (!fs.existsSync(STORE_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
};

const searchSimilar = (queryEmbedding, topK = 3) => {
  const store = loadEmbeddings().filter(chunk => Array.isArray(chunk.embedding));
  
  const scoredChunks = store.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  // Sort descending by score
  scoredChunks.sort((a, b) => b.score - a.score);
  
  return scoredChunks.slice(0, topK);
};

module.exports = {
  saveEmbeddings,
  loadEmbeddings,
  searchSimilar
};
