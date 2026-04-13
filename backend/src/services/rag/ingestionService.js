const { loadResumeBuffer } = require('../resume/resumeLoader');
const { extractAndCleanResume } = require('../resume/resumeParser');
const { fetchRepos } = require('../github/githubFetcher');
const { parseRepoData } = require('../github/githubParser');
const { buildSummaries } = require('../github/githubSummaryBuilder');
const { chunkLogicalSections, chunkRepoSummary } = require('./chunker');
const { appendEmbeddingsToChunks } = require('./embeddings');
const { saveEmbeddings } = require('./vectorStore');
const fs = require('fs');
const path = require('path');
const env = require('../../config/env');

/**
 * Rebuild the entire knowledge base from source data.
 */
const runIngestion = async (githubUsername) => {
  try {
    const targetGithubUsername = githubUsername || env.GITHUB_USERNAME;
    console.log('[Ingestion] Starting KB ingestion...');
    const allChunks = [];

    // 1. Process Resume
    console.log('[Ingestion] Processing Resume...');
    try {
      const resumeBuffer = loadResumeBuffer();
      const rawResumeText = await extractAndCleanResume(resumeBuffer);
      const resumeChunks = chunkLogicalSections(rawResumeText, 'resume');
      allChunks.push(...resumeChunks);
    } catch (e) {
      console.warn('[Ingestion] Could not ingest resume:', e.message);
    }

    // 2. Process GitHub
    if (targetGithubUsername) {
      console.log('[Ingestion] Processing GitHub Data...');
      const rawRepos = await fetchRepos(targetGithubUsername);
      const parsedRepos = parseRepoData(rawRepos);
      const summaries = await buildSummaries(parsedRepos);
      
      // Save summaries locally as requested
      const summaryPath = path.resolve(__dirname, '../../data/processed/repo_summaries.json');
      fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
      fs.writeFileSync(
        summaryPath,
        JSON.stringify(summaries, null, 2)
      );

      summaries.forEach(summary => {
        allChunks.push(chunkRepoSummary(summary));
      });
    }

    // 3. Generate Embeddings & Save Vector Store
    console.log(`[Ingestion] Generating embeddings for ${allChunks.length} chunks...`);
    const embeddedChunks = await appendEmbeddingsToChunks(allChunks);
    
    saveEmbeddings(embeddedChunks);
    console.log('[Ingestion] KB processing complete! Saved to vector store json.');

    return true;
  } catch (error) {
    console.error('[Ingestion] Fatal error during ingestion process:', error);
    throw error;
  }
};

module.exports = {
  runIngestion
};
