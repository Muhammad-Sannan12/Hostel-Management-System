const express = require('express');
const router = express.Router();
const {
    getRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    addRoomInventory,
    updateRoomInventory,
    deleteRoomInventory,
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getRooms);
router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);
router.post('/:id/inventory', protect, admin, addRoomInventory);
router.put('/:id/inventory/:itemId', protect, admin, updateRoomInventory);
router.delete('/:id/inventory/:itemId', protect, admin, deleteRoomInventory);

module.exports = router;
