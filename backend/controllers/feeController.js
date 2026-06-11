// GET /api/students/search?q=EC-2024-001
const Student = require('../models/studentModel');

const SearchBoardingNo = async (req, res) => {
  const { q } = req.query;
  
  const student = await Student.findOne({
    $or: [
      { boardingNumber: { $regex: q, $options: "i" } },
      // name is in User, so search via populate filter won't work directly
    ]
  })
  .populate('user', 'name contact')  // ← gets name & contact
  .populate('room', 'roomNumber')    // ← gets room number
  .populate('hostel', 'name');       // ← gets hostel name

  res.json(student);
};

module.exports = { SearchBoardingNo };