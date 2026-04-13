require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { retrieveContext } = require('../src/services/rag/retriever');
const { buildSystemPrompt } = require('../src/services/ai/promptService');
const { callLLM } = require('../src/services/ai/openaiService');

const run = async () => {
  const query = process.argv[2] || "What projects have you worked on?";
  console.log(`[Test] Query: "${query}"`);

  try {
    // 1. Retrieve
    const retrievedChunks = await retrieveContext(query);
    console.log(`[Test] Found ${retrievedChunks.length} relevant context chunks.`);
    
    // 2. Build Prompt
    const prompt = buildSystemPrompt(retrievedChunks);
    
    // 3. Call OpenAI
    const answer = await callLLM(prompt, [], query);
    
    console.log(`\n[Test] Evaluated Answer:\n${answer}\n`);
  } catch (error) {
    console.error(`[Test] Chat simulation failed:`, error.message);
  }
};

run();
