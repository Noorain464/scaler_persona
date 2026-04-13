/**
 * Convert raw GitHub data into structured baseline records.
 * Provides a skeleton output for the Summary Builder step.
 * 
 * @param {Array} rawRepos 
 */
const parseRepoData = (rawRepos) => {
  return rawRepos.map(repo => ({
    repo: repo.name,
    purpose: repo.description || 'No description provided.',
    stack: [ ...(repo.languages || []), ...(repo.topics || []) ],
    features: [], 
    tradeoffs: "", 
    
    // Internal fields used by builder logic
    _rawReadme: repo.readme,
    _updatedDate: repo.updated_at
  }));
};

module.exports = {
  parseRepoData
};
