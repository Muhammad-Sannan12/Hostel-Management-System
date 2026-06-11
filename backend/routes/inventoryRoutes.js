const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  addInventory,
  getAllInventory,
  getFilteredInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/InventoryController");
router.get("/", protect, admin, getAllInventory);
router.post("/", protect, admin, addInventory);
router.put("/", protect, admin, updateInventory);
router.get("/filter", protect, admin, getFilteredInventory);
router.delete("/:id", protect, admin, deleteInventory);
// router.get("/filter", getFilteredInventory);
module.exports = router;
