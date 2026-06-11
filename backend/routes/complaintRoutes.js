const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
    deleteComplaint,
} = require('../controllers/complaintController');

// Public/Student routes
router.get('/test', (req, res) => res.json({ message: 'Complaint routes working' }));
router.post('/', createComplaint);
router.get('/my', getMyComplaints);

// Admin routes  
router.get('/', getAllComplaints);
router.put('/:id', updateComplaintStatus);
router.delete('/:id', deleteComplaint);

module.exports = router;
