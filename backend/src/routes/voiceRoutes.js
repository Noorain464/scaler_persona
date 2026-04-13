const express = require('express');
const { 
  checkAvailabilityController,
  createBookingController,
  getProfileInfoController,
  getRepoInfoController
} = require('../controllers/voiceController');

const router = express.Router();

router.post('/check-availability', checkAvailabilityController);
router.post('/book-meeting', createBookingController);
router.post('/get-profile-info', getProfileInfoController);
router.post('/get-repo-info', getRepoInfoController);

// Backward-compatible aliases for any existing Vapi dashboard config.
router.post('/tool/check-availability', checkAvailabilityController);
router.post('/tool/book', createBookingController);
router.post('/tool/get-profile-info', getProfileInfoController);
router.post('/tool/get-repo-info', getRepoInfoController);

module.exports = router;
