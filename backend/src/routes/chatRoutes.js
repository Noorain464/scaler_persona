const express = require('express');
const { handleChat } = require('../controllers/chatController');

const router = express.Router();

// Define POST /api/chat route
router.post('/', handleChat);

module.exports = router;
