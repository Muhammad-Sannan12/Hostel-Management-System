const express = require('express');
const router = express.Router();
const {
    getStudents,
    registerStudent,
    getMyProfile,
    updateStudent,
    deleteStudent,
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getStudents);
router.post('/', protect, admin, registerStudent);
router.get('/me', protect, getMyProfile);
router.put('/:id', protect, admin, updateStudent);
router.delete('/:id', protect, admin, deleteStudent);

module.exports = router;
