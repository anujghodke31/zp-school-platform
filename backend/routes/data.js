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

module.exports = router;
