const fs = require('fs');
const path = require('path');

const getRepos = (req, res, next) => {
  try {
    const summaryFile = path.resolve(__dirname, '../data/processed/repo_summaries.json');
    if (!fs.existsSync(summaryFile)) {
      return res.status(404).json({ success: false, error: 'Repo summaries not found. Ingest GitHub data first.' });
    }

    const data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRepos
};
