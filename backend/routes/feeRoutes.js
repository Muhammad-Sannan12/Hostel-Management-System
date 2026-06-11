const express = require('express');
const router = express.Router();

const { protect, admin } = require('../middleware/authMiddleware');
const { SearchBoardingNo } = require('../controllers/feeController');

router.get('/search', protect, admin, SearchBoardingNo);

module.exports = router;
