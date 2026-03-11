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

// In-memory store for OTPs (In production, use Redis or MongoDB with TTL)
const otpStore = new Map();

// @route   POST /api/auth/otp/send
// @desc    Generate OTP for Parent Mobile
// @access  Public
router.post('/otp/send', async (req, res) => {
    const { phone } = req.body;
    try {
        const student = await Student.findOne({ parent_phone: phone });
        if (student) {
            // Generate a 6-digit dynamic OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            // Store it with a 5-minute expiration timestamp
            otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 });

            // Note: In real production, we'd trigger an SMS API here (e.g. Twilio, MSG91)
            res.json({ success: true, otp, message: 'OTP sent to ' + phone });
        } else {
            res.status(404).json({ success: false, message: 'Phone number not registered with any student.' });
        }
    } catch (err) {
        console.error("OTP Send Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/auth/otp/verify
// @desc    Verify OTP and generate token for Parent
// @access  Public
router.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const storedData = otpStore.get(phone);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not requested.' });
        }

        if (Date.now() > storedData.expires) {
            otpStore.delete(phone);
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP entered.' });
        }

        // OTP is valid
        const student = await Student.findOne({ parent_phone: phone });
        if (student) {
            // Once verified, delete the OTP to prevent reuse
            otpStore.delete(phone);

            res.json({
                success: true,
                role: 'Parent',
                studentName: student.name,
                token: generateToken(student._id, 'Parent'),
            });
        } else {
            res.status(404).json({ success: false, message: 'Parent mapping lost.' });
        }
    } catch (err) {
        console.error("OTP Verify Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
