require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { fetchRepos } = require('../src/services/github/githubFetcher');
const { parseRepoData } = require('../src/services/github/githubParser');
const { buildSummaries } = require('../src/services/github/githubSummaryBuilder');
const env = require('../src/config/env');
const fs = require('fs');
const path = require('path');

const run = async () => {
  console.log('[Script] Running isolate GitHub ingestion...');
  
  // Use argument or default username placeholder
  const username = process.argv[2] || env.GITHUB_USERNAME; 

  if (!username) {
    console.error('[Script] GitHub username is required. Pass one as an argument or set GITHUB_USERNAME in .env.');
    process.exitCode = 1;
    return;
  }
  
  try {
    const rawRepos = await fetchRepos(username);
    const parsed = parseRepoData(rawRepos);
    const summaries = await buildSummaries(parsed);
    
    fs.writeFileSync(
      path.resolve(__dirname, '../src/data/processed/repo_summaries.json'),
      JSON.stringify(summaries, null, 2)
    );
    console.log('[Script] GitHub summaries generated and saved successfully!');
  } catch (error) {
    console.error('[Script] GitHub ingestion failed:', error.message);
  }
};

run();
