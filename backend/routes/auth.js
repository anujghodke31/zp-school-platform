const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @route   POST /api/auth/login
// @desc    Auth user (Admin/Teacher) & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                username: user.username,
                name: user.name,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/auth/otp/send
// @desc    Simulate sending OTP to Parent
// @access  Public
router.post('/otp/send', async (req, res) => {
    const { phone } = req.body;
    try {
        const student = await Student.findOne({ parent_phone: phone });
        if (student) {
            // Generate a 6 digit dummy OTP for now
            const otp = Math.floor(100000 + Math.random() * 900000);
            res.json({ success: true, otp, message: 'OTP sent to ' + phone });
        } else {
            res.status(404).json({ success: false, message: 'Phone number not registered with any student.' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/auth/otp/verify
// @desc    Verify OTP and generate token for Parent
// @access  Public
router.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const student = await Student.findOne({ parent_phone: phone });
        if (student) {
            // In a real app we lookup the stored OTP, here we trust the dummy frontend logic
            res.json({
                success: true,
                role: 'Parent',
                studentName: student.name,
                token: generateToken(student._id, 'Parent'),
            });
        } else {
            res.status(404).json({ success: false, message: 'Verification failed' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
