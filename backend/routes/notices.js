const express = require('express');
const router = express.Router();
const { protect, roleProtect } = require('../middleware/authMiddleware');
const { db, admin } = require('../firebase');

// @route   POST /api/notices
// @desc    Create a notice and trigger SSE broadcast
// @access  Protected (Admin/Teacher)
router.post('/', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { title, message, audience } = req.body;

        const noticeRef = await db.collection('notices').add({
            title,
            message,
            audience,
            createdBy: req.user.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        const noticeDoc = await noticeRef.get();
        const notice = { id: noticeDoc.id, ...noticeDoc.data() };

        // Trigger SSE Broadcast attached via middleware/app instance
        if (req.app.broadcastNotice) {
            req.app.broadcastNotice('notice', title, message);
        }

        res.status(201).json({ success: true, notice });
    } catch (err) {
        console.error("Error creating notice:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/notices/public
// @desc    Get latest notices for public landing page
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const snapshot = await db.collection('notices').orderBy('createdAt', 'desc').limit(5).get();
        const notices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json({ success: true, data: notices });
    } catch (err) {
        console.error("Error fetching public notices:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/notices
// @desc    Get all notices
// @access  Protected (All)
router.get('/', protect, async (req, res) => {
    try {
        const snapshot = await db.collection('notices').orderBy('createdAt', 'desc').get();
        const notices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(notices);
    } catch (err) {
        console.error("Error fetching notices:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
