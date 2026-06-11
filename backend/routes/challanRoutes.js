const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { createChallan, getAllChallans } = require('../controllers/challanController');
router.get('/', protect, admin,getAllChallans);
router.post('/', protect, admin, createChallan);
module.exports = router;