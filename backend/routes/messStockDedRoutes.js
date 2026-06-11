const express =require('express');
const router = express.Router();
const {deductStock}=require('../controllers/messStockDeductionController.js')
router.post('/',deductStock);
module.exports=router;
