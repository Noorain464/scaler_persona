const { callLLM } = require('../ai/openaiService');

const parseJsonResponse = (value) => {
  const text = String(value || '').trim();
  const fencedMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fencedMatch ? fencedMatch[1].trim() : text;

  return JSON.parse(jsonText);
};

/**
 * Make better repo summaries for RAG.
 * Uses an LLM to generate structured summaries highlighting architecture, problem solved, tradeoffs, etc.
 * 
 * @param {Array} parsedRepoData 
 */
const buildSummaries = async (parsedRepoData) => {
  const summaries = [];

  for (const repo of parsedRepoData) {
    console.log(`[GitHub Summary Builder] Summarizing repo: ${repo.repo}`);

    const prompt = `
Analyze the following repository description and README.
Extract a structured summary with exactly the following fields (as a JSON object):
- "repo": String (the repo name)
- "problem_solved": String (what problem it solves)
- "stack": Array of Strings (technologies used)
- "architecture": String (high-level architecture)
- "tradeoffs": String (key tradeoffs, decisions, or hard parts)
- "limitations": String (shortcomings)
- "features": Array of Strings (key features)

Repository Name: ${repo.repo}
Description: ${repo.purpose}
Tech/Keywords: ${repo.stack.join(', ')}

README snippet:
${(repo._rawReadme || "").substring(0, 3000)}

Return raw valid JSON ONLY.
    `.trim();

    try {
      const summaryString = await callLLM(
        "You are an expert technical writer formulating concise repository summaries. Output only JSON.",
        [],
        prompt
      );
      
      const structuredSummary = parseJsonResponse(summaryString);
      summaries.push({
        repo: structuredSummary.repo || repo.repo,
        purpose: structuredSummary.problem_solved || repo.purpose,
        stack: structuredSummary.stack || repo.stack,
        architecture: structuredSummary.architecture || "",
        tradeoffs: structuredSummary.tradeoffs || "",
        limitations: structuredSummary.limitations || "",
        features: structuredSummary.features || []
      });
    } catch (err) {
      console.error(`[GitHub Summary Builder] Failed to build summary for ${repo.repo}`, err.message);
      // Fallback
      summaries.push({
        repo: repo.repo,
        purpose: repo.purpose,
        stack: repo.stack,
        tradeoffs: 'Not analyzed.',
        features: []
      });
    }
  }

  return summaries;
};

module.exports = {
  buildSummaries
};
