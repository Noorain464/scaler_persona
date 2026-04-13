/**
 * Split long text (like a resume) into chunks logically by sections
 * 
 * @param {string} fullText 
 * @param {string} sourceName 
 * @returns {Array} List of chunks
 */
const chunkLogicalSections = (fullText, sourceName = 'resume') => {
  // Regex to split on common resume section headers (e.g. Education, Projects, Skills)
  // This matches a capitalized word on a line by itself acting as a header
  const sectionSplitRegex = /(?:\n|^)(?=Education|Experience|Projects|Skills|Summary|Work History|Certifications)(?:\b)/i;
  
  const rawSections = fullText.split(sectionSplitRegex);

  const chunks = rawSections
    .map(section => section.trim())
    .filter(section => section.length > 0)
    .map(section => ({
      text: section,
      source: sourceName
    }));

  return chunks;
};

/**
 * Turn structured repo summary into a logical chunk for RAG context
 * 
 * @param {Object} structuredSummary 
 * @returns {Object} Chunks representing the repo
 */
const chunkRepoSummary = (structuredSummary) => {
  const content = `
Repository Name: ${structuredSummary.repo}
Problem Solved / Purpose: ${structuredSummary.purpose || structuredSummary.problem_solved}
Tech Stack used: ${(structuredSummary.stack || []).join(', ')}
Architecture: ${structuredSummary.architecture || 'Not specified'}
Features: ${(structuredSummary.features || []).join(', ')}
Tradeoffs made: ${structuredSummary.tradeoffs || 'None specified'}
Limitations: ${structuredSummary.limitations || 'None specified'}
  `.trim();

  return {
    text: content,
    source: `github: ${structuredSummary.repo}`
  };
};

module.exports = {
  chunkLogicalSections,
  chunkRepoSummary
};
