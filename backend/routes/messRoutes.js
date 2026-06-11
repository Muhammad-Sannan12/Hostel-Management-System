const express = require('express');
const router = express.Router();
const {
    getMenu,
    updateMenu,
    markAttendance,
    getAttendanceLogs,getMessInventory
} = require('../controllers/messController');
const { protect } = require('../middleware/authMiddleware');

router.get('/menu', getMenu);
router.put('/menu/:day', protect, updateMenu);
router.post('/attendance', protect, markAttendance);
router.get('/attendance', protect, getAttendanceLogs);
router.get('/inventory',getMessInventory);
module.exports = router;
