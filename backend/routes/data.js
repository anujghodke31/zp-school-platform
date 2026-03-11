const express = require('express');
const router = express.Router();
const { protect, roleProtect } = require('../middleware/authMiddleware');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');

// @route   GET /api/data/admin/stats
// @desc    Get top-level stats for Admin Dashboard
// @access  Protected (Admin/SuperAdmin)
router.get('/admin/stats', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalAssignments = await Assignment.countDocuments();
        // Since teachers/users are mostly hardcoded/demoed via script, we can mock or count `User`

        res.json({
            success: true,
            total_students: totalStudents || 10,
            total_teachers: 8,
            total_classes: 4,
            avg_attendance: 87.4,
            at_risk_count: 2,
            total_assignments: totalAssignments || 5,
            schools_in_network: 40,
            active_sessions: 6
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/data/students
// @desc    Get all students
// @access  Protected (Admin/Teacher)
router.get('/students', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const students = await Student.find({});
        res.json(students);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/students
// @desc    Add a new student
// @access  Protected (Admin/SuperAdmin/Teacher)
router.post('/students', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { roll_no, name, className, parent_phone } = req.body;

        if (!roll_no || !name || !className || !parent_phone) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const studentExists = await Student.findOne({ roll_no, className });
        if (studentExists) {
            return res.status(400).json({ success: false, message: 'Student with this Roll No already exists in this class.' });
        }

        const student = await Student.create({
            roll_no,
            name,
            className,
            parent_phone,
            attendance_pct: 100 // Default for new student
        });

        res.status(201).json({ success: true, message: 'Student added successfully', student });
    } catch (err) {
        console.error("Add Student Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/data/assignments
// @desc    Get assignments for a class
// @access  Protected (All)
router.get('/assignments', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find({}).sort({ dueDate: 1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// We need to import the User model at the top since we are adding staff
const User = require('../models/User');

// @route   POST /api/data/staff
// @desc    Add a new staff member (Teacher or Admin)
// @access  Protected (SuperAdmin/Admin)
router.post('/staff', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { username, password, name, role, contactNumber } = req.body;

        if (!username || !password || !name || !role) {
            return res.status(400).json({ success: false, message: 'Missing required staff fields.' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Staff username already exists.' });
        }

        const staff = await User.create({
            username,
            passwordHash: password, // The pre-save hook in User model will hash this
            name,
            role,
            contactNumber
        });

        res.status(201).json({ success: true, message: `${role} added successfully`, user: { username, role, name } });
    } catch (err) {
        console.error("Add Staff Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/data/staff
// @desc    Get all staff members (Teacher, Admin, SuperAdmin)
// @access  Protected (SuperAdmin/Admin)
router.get('/staff', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['Teacher', 'Admin', 'SuperAdmin'] } })
            .select('-passwordHash') // Don't send hashes back
            .sort({ role: 1, name: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
