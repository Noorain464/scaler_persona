const express = require('express');
const { 
  handleCheckAvailability, 
  handleBookSlot, 
  handleGetProfileInfo, 
  handleGetRepoInfo 
} = require('../controllers/voiceController');

const router = express.Router();

router.post('/tool/check-availability', handleCheckAvailability);
router.post('/tool/book', handleBookSlot);
router.post('/tool/get-profile-info', handleGetProfileInfo);
router.post('/tool/get-repo-info', handleGetRepoInfo);

module.exports = router;
