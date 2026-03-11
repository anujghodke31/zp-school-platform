const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db');
const User = require('./models/User');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const Assignment = require('./models/Assignment');
const Notice = require('./models/Notice');

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Student.deleteMany();
        await Attendance.deleteMany();
        await Assignment.deleteMany();
        await Notice.deleteMany();

        console.log('Old records destroyed.');

        // Seed Users
        const ceoUser = await User.create({
            username: 'ceo',
            passwordHash: 'ceo123',
            name: 'ZP Chief Executive Officer',
            role: 'SuperAdmin',
            contactNumber: '9988776600'
        });

        const adminUser = await User.create({
            username: 'admin',
            passwordHash: 'admin123',
            name: 'Prakash Deshmukh',
            role: 'Admin',
            contactNumber: '9988776655'
        });

        const teacherUser = await User.create({
            username: 'teacher',
            passwordHash: 'teacher123',
            name: 'Priya Shinde',
            role: 'Teacher',
            contactNumber: '9988776644'
        });

        console.log('CEO, Admin, and Teacher generated.');

        // Seed Students
        const s1 = await Student.create({ roll_no: '1', name: 'Aarav Patil', className: '7A', parent_phone: '9876543210', attendance_pct: 92 });
        const s2 = await Student.create({ roll_no: '2', name: 'Diya Kadam', className: '7A', parent_phone: '9876543211', attendance_pct: 78 });
        const s3 = await Student.create({ roll_no: '3', name: 'Rohan Joshi', className: '7A', parent_phone: '9876543212', attendance_pct: 88 });

        console.log('Students generated.');

        // Seed Assignments
        await Assignment.create({
            title: 'Algebra Worksheet 3',
            description: 'Please complete all exercises on quadratic equations from Chapter 4.',
            subject: 'Mathematics',
            className: '7A',
            dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
            createdBy: teacherUser._id
        });

        console.log('Assignments generated.');

        // Seed Notices
        await Notice.create({
            title: 'Mid-term Exams Next Week',
            message: 'A reminder that mid-terms begin next Monday. Please review the syllabus.',
            audience: 'all',
            createdBy: adminUser._id
        });

        console.log('Notices generated.');
        console.log('=============================');
        console.log('✅ DATABASE SEEDING COMPLETE ✅');
        console.log('=============================');

        process.exit();

    } catch (error) {
        console.error(`Error with seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedDatabase();
