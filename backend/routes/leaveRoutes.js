const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyLeave);
router.get('/me', protect, getMyLeaves);
router.get('/', protect, getAllLeaves); // Admin check would be ideal here
router.put('/:id', protect, updateLeaveStatus);

module.exports = router;
