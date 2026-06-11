const mongoose = require('mongoose');
const User = require('./models/userModel');
const Student = require('./models/studentModel');
const connectDB = require('./config/db');

require('dotenv').config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Student.deleteMany();

    // Create admin
    const admin = new User({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'admin123',
      isAdmin: true,
      role: 'admin',
    });
    await admin.save();
    console.log('Admin created');

    // Create superadmin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@college.edu',
      password: 'super123',
      isAdmin: true,
      role: 'superadmin',
    });
    await superAdmin.save();
    console.log('Superadmin created');

    // Create 10 students
    const studentsData = [
      { name: 'John Doe', email: 'john.doe@college.edu', boardingNumber: 'EC-2024-001', fatherName: 'John Sr.', program: 'B.Tech', department: 'CSE', contact: '1234567890', parentContact: '0987654321', year: '3rd' },
      { name: 'Jane Smith', email: 'jane.smith@college.edu', boardingNumber: 'EC-2024-002', fatherName: 'Smith Sr.', program: 'B.Tech', department: 'ECE', contact: '1234567891', parentContact: '0987654322', year: '2nd' },
      { name: 'Alice Johnson', email: 'alice.johnson@college.edu', boardingNumber: 'EC-2024-003', fatherName: 'Johnson Sr.', program: 'B.Tech', department: 'ME', contact: '1234567892', parentContact: '0987654323', year: '4th' },
      { name: 'Bob Brown', email: 'bob.brown@college.edu', boardingNumber: 'EC-2024-004', fatherName: 'Brown Sr.', program: 'M.Tech', department: 'CSE', contact: '1234567893', parentContact: '0987654324', year: '1st' },
      { name: 'Charlie Wilson', email: 'charlie.wilson@college.edu', boardingNumber: 'EC-2024-005', fatherName: 'Wilson Sr.', program: 'B.Tech', department: 'CE', contact: '1234567894', parentContact: '0987654325', year: '3rd' },
      { name: 'Diana Davis', email: 'diana.davis@college.edu', boardingNumber: 'EC-2024-006', fatherName: 'Davis Sr.', program: 'B.Tech', department: 'IT', contact: '1234567895', parentContact: '0987654326', year: '2nd' },
      { name: 'Eve Miller', email: 'eve.miller@college.edu', boardingNumber: 'EC-2024-007', fatherName: 'Miller Sr.', program: 'M.Tech', department: 'ECE', contact: '1234567896', parentContact: '0987654327', year: '1st' },
      { name: 'Frank Garcia', email: 'frank.garcia@college.edu', boardingNumber: 'EC-2024-008', fatherName: 'Garcia Sr.', program: 'B.Tech', department: 'ME', contact: '1234567897', parentContact: '0987654328', year: '4th' },
      { name: 'Grace Martinez', email: 'grace.martinez@college.edu', boardingNumber: 'EC-2024-009', fatherName: 'Martinez Sr.', program: 'B.Tech', department: 'CSE', contact: '1234567898', parentContact: '0987654329', year: '3rd' },
      { name: 'Henry Lopez', email: 'henry.lopez@college.edu', boardingNumber: 'EC-2024-010', fatherName: 'Lopez Sr.', program: 'B.Tech', department: 'CE', contact: '1234567899', parentContact: '0987654330', year: '2nd' },
    ];

    for (const studentData of studentsData) {
      const user = new User({
        name: studentData.name,
        email: studentData.email,
        boardingNumber: studentData.boardingNumber,
        password: 'student123',
        isAdmin: false,
        role: 'student',
      });
      const savedUser = await user.save();

      const student = new Student({
        user: savedUser._id,
        boardingNumber: studentData.boardingNumber,
        fatherName: studentData.fatherName,
        program: studentData.program,
        department: studentData.department,
        contact: studentData.contact,
        parentContact: studentData.parentContact,
        year: studentData.year,
      });
      await student.save();
    }

    console.log('10 students created');
    console.log('Seeding completed');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();