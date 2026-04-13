const { Octokit } = require('octokit');
const env = require('../../config/env');

const fetchRepos = async (username) => {
  const octokit = new Octokit({ auth: env.GITHUB_TOKEN });
  const repoData = [];

  try {
    console.log(`[GitHub Fetcher] Fetching repositories for ${username}...`);
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      type: 'owner',
      sort: 'updated',
      per_page: 10
    });

    for (const repo of repos) {
      console.log(`[GitHub Fetcher] Processing ${repo.name}...`);
      
      // Fetch languages
      const { data: languages } = await octokit.rest.repos.listLanguages({
        owner: username,
        repo: repo.name
      });

      // Fetch README. Note: Some repos lack one
      let readme = '';
      try {
        const { data: readmeData } = await octokit.rest.repos.getReadme({
          owner: username,
          repo: repo.name
        });
        readme = Buffer.from(readmeData.content, 'base64').toString('utf8');
      } catch (err) {
        console.warn(`[GitHub Fetcher] No README found for ${repo.name}`);
      }

      repoData.push({
        name: repo.name,
        description: repo.description,
        languages: Object.keys(languages),
        topics: repo.topics || [],
        updated_at: repo.updated_at,
        readme
      });
    }

    return repoData;
  } catch (err) {
    console.error(`[GitHub Fetcher] API request failed:`, err.message);
    throw err;
  }
};

module.exports = {
  fetchRepos
};
