const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    getUsers,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const { protect, admin, superAdmin } = require('../middleware/authMiddleware');

router.get('/all', protect, superAdmin, getUsers);
router.post('/', protect, superAdmin, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/:id', protect, superAdmin, updateUser);
router.delete('/:id', protect, superAdmin, deleteUser);

module.exports = router;
