const express = require('express');
const {
  startGoogleAuth,
  handleGoogleCallback
} = require('../controllers/googleAuthController');

const router = express.Router();

router.get('/auth/google', startGoogleAuth);
router.get('/oauth2callback', handleGoogleCallback);

module.exports = router;
