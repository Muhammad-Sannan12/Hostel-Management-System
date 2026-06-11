const express = require('express');
const router = express.Router();
const { getHostels, createHostel, updateHostel, deleteHostel } = require('../controllers/hostelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getHostels).post(protect, admin, createHostel);
router.route('/:id').put(protect, admin, updateHostel).delete(protect, admin, deleteHostel);

module.exports = router;
