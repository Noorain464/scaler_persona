const express = require('express');
const { getRepos } = require('../controllers/githubController');

const router = express.Router();

// Optional route to inspect ingested GitHub data
router.get('/repos', getRepos);

module.exports = router;
