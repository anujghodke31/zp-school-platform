const express = require('express');
const router = express.Router();
const { protect, roleProtect } = require('../middleware/authMiddleware');
const Notice = require('../models/Notice');

// @route   POST /api/notices
// @desc    Create a notice and trigger SSE broadcast
// @access  Protected (Admin/Teacher)
router.post('/', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { title, message, audience } = req.body;

        const notice = await Notice.create({
            title,
            message,
            audience,
            createdBy: req.user._id
        });

        // Trigger SSE Broadcast attached via middleware/app instance (this is a simple approach)
        if (req.app.broadcastNotice) {
            req.app.broadcastNotice('notice', title, message);
        }

        res.status(201).json({ success: true, notice });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/notices
// @desc    Get all notices
// @access  Protected (All)
router.get('/', protect, async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
