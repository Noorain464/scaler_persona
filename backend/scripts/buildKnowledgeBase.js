require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { runIngestion } = require('../src/services/rag/ingestionService');
const env = require('../src/config/env');

const run = async () => {
  console.log('============= BUILDING KNOWLEDGE BASE =============');
  
  // Accept target github profile directly off the command line node call
  const targetGithubProfile = process.argv[2] || env.GITHUB_USERNAME;
  
  try {
    await runIngestion(targetGithubProfile);
    console.log('============= BUILD SUCCESSFUL =============');
  } catch (e) {
    console.error('============= BUILD FAILED =============', e);
  }
};

run();
