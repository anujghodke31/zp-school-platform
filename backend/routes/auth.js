const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin, db } = require('../firebase');

// @route   GET /api/auth/me
// @desc    Get user profile based on Firebase token
// @access  Protected
router.get('/me', protect, async (req, res) => {
    try {
        // req.user is populated by protect middleware
        res.json({
            success: true,
            _id: req.user.id,
            username: req.user.username,
            name: req.user.name,
            role: req.user.role,
            contactNumber: req.user.contactNumber
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user via OAuth
// @access  Public (verifies token inline)
router.post('/register', async (req, res) => {
    try {
        const { admin, db } = require('../firebase');
        const { role } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Check if user already exists
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        if (userDoc.exists) {
            return res.status(400).json({ success: false, message: 'User already exists. Please log in.' });
        }
        
        // Define default role logic
        const validRoles = ['Parent', 'Student', 'Teacher']; // Should restrict Teacher? Let's allow for now or restrict later, but typically Student or Parent.
        const assignedRole = validRoles.includes(role) ? role : 'Parent';

        const userData = {
            username: decodedToken.email || decodedToken.phone_number || decodedToken.uid,
            name: decodedToken.name || (decodedToken.email ? decodedToken.email.split('@')[0] : 'New User'),
            role: assignedRole,
            contactNumber: decodedToken.phone_number || '',
            createdAt: new Date()
        };

        await db.collection('users').doc(decodedToken.uid).set(userData);
        
        res.status(201).json({
            success: true,
            user: {
                id: decodedToken.uid,
                ...userData
            }
        });
    } catch (error) {
        console.error("Registration error STACK:", error.stack || error);
        res.status(500).json({ success: false, message: 'Server Error during registration: ' + error.message });
    }
});

module.exports = router;
