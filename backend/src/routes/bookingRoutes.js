const express = require('express');
const { getAvailability, bookSlot } = require('../controllers/bookingController');

const router = express.Router();

router.get('/availability', getAvailability);
router.post('/book', bookSlot);

module.exports = router;
