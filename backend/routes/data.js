const express = require('express');
const router = express.Router();
const { protect, roleProtect } = require('../middleware/authMiddleware');
const { db, admin } = require('../firebase');

// @route   GET /api/data/admin/stats
// @desc    Get top-level stats for Admin Dashboard
// @access  Protected (Admin/SuperAdmin)
router.get('/admin/stats', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const studentsSnap = await db.collection('students').count().get();
        const assignmentsSnap = await db.collection('assignments').count().get();
        const schoolsSnap = await db.collection('schools').count().get();
        const teachersSnap = await db.collection('users').where('role', '==', 'Teacher').count().get();

        res.json({
            success: true,
            total_students: studentsSnap.data().count,
            total_teachers: teachersSnap.data().count,
            total_classes: 0, // This could be derived from schools or students
            avg_attendance: 0, // Needs aggregation logic which we skip for simplicity now
            at_risk_count: 0,
            total_assignments: assignmentsSnap.data().count,
            schools_in_network: schoolsSnap.data().count,
            active_sessions: 0
        });
    } catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/data/students
// @desc    Get all students
// @access  Protected (Admin/Teacher)
router.get('/students', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const snapshot = await db.collection('students').get();
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

        // Check if student exists in this class
        const existingSnap = await db.collection('students')
            .where('roll_no', '==', roll_no)
            .where('className', '==', className)
            .get();

        if (!existingSnap.empty) {
            return res.status(400).json({ success: false, message: 'Student with this Roll No already exists in this class.' });
        }

        const studentRef = await db.collection('students').add({
            roll_no,
            name,
            className,
            parent_phone,
            attendance_pct: 100, // Default for new student
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Add parent to Firebase Auth
        try {
            // Check if parent account already exists
            await admin.auth().getUserByPhoneNumber('+91' + parent_phone); // Ensure E.164 format
        } catch (authErr) {
            if (authErr.code === 'auth/user-not-found') {
                // We create a dummy password or handle SMS login later
                const parentAuth = await admin.auth().createUser({
                    phoneNumber: '+91' + parent_phone,
                    displayName: name + "'s Parent"
                });
                
                await db.collection('users').doc(parentAuth.uid).set({
                    role: 'Parent',
                    name: name + "'s Parent",
                    contactNumber: parent_phone,
                    students: [studentRef.id],
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        res.status(201).json({ success: true, message: 'Student added successfully', student: { id: studentRef.id, roll_no, name } });
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
        const snapshot = await db.collection('assignments').orderBy('dueDate', 'asc').get();
        const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/staff
// @desc    Add a new staff member (Teacher or Admin)
// @access  Protected (SuperAdmin/Admin)
router.post('/staff', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { username, password, name, role, contactNumber } = req.body;

        if (!username || !password || !name || !role) {
            return res.status(400).json({ success: false, message: 'Missing required staff fields.' });
        }

        // We use username as email for Firebase Auth (e.g., admin@zp.local)
        const email = `${username}@zp.local`;

        try {
            const newAuthUser = await admin.auth().createUser({
                email,
                password,
                displayName: name,
            });

            await db.collection('users').doc(newAuthUser.uid).set({
                username,
                email,
                name,
                role,
                contactNumber: contactNumber || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(201).json({ success: true, message: `${role} added successfully`, user: { username, role, name } });
        } catch (authErr) {
            if (authErr.code === 'auth/email-already-exists') {
                return res.status(400).json({ success: false, message: 'Staff username already exists.' });
            }
            throw authErr;
        }
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
        const snapshot = await db.collection('users').where('role', 'in', ['Teacher', 'Admin', 'SuperAdmin']).get();
        const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Sort by role then name
        staff.sort((a, b) => {
            if (a.role < b.role) return -1;
            if (a.role > b.role) return 1;
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        res.json(staff);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
