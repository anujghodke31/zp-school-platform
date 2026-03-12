const express = require('express');
const router = express.Router();
const { protect, roleProtect } = require('../middleware/authMiddleware');
const { db, admin } = require('../firebase');

// ─── HELPER ────────────────────────────────────────────────────────────────────
const PAGE_LIMIT = 20;

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────
// @route   GET /api/data/admin/stats
// @access  Protected (Admin/SuperAdmin)
router.get('/admin/stats', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const [assignmentsSnap, schoolsSnap, studentsSnap, teachersSnap] = await Promise.all([
            db.collection('assignments').count().get(),
            db.collection('schools').count().get(),
            db.collection('students').get(),
            db.collection('users').where('role', '==', 'Teacher').count().get(),
        ]);

        const students = studentsSnap.docs.map(d => d.data());
        const total = students.length;

        // Real average attendance from stored attendance_pct per student
        const avg_attendance = total
            ? Math.round(students.reduce((sum, s) => sum + (s.attendance_pct ?? 100), 0) / total)
            : 0;

        // At-risk: below 75% attendance
        const at_risk_count = students.filter(s => (s.attendance_pct ?? 100) < 75).length;

        res.json({
            success: true,
            total_students: total,
            total_teachers: teachersSnap.data().count,
            avg_attendance,
            at_risk_count,
            total_assignments: assignmentsSnap.data().count,
            schools_in_network: schoolsSnap.data().count,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── AT-RISK STUDENTS ──────────────────────────────────────────────────────────
// @route   GET /api/data/at-risk
// @access  Protected (Admin/SuperAdmin)
router.get('/at-risk', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const snap = await db.collection('students').where('attendance_pct', '<', 75).get();
        const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
// @route   GET /api/data/students?limit=20&cursor=<docId>&className=7A
// @access  Protected (Admin/SuperAdmin/Teacher)
router.get('/students', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const { cursor, className } = req.query;

        let query = db.collection('students').orderBy('roll_no').limit(limit);
        if (className) query = query.where('className', '==', className);

        if (cursor) {
            const cursorDoc = await db.collection('students').doc(cursor).get();
            if (cursorDoc.exists) query = query.startAfter(cursorDoc);
        }

        const snap = await query.get();
        const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const nextCursor = snap.docs.length === limit ? snap.docs[snap.docs.length - 1].id : null;

        res.json({ success: true, data: students, nextCursor });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/students
// @access  Protected (Admin/SuperAdmin/Teacher)
router.post('/students', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { roll_no, name, className, parent_phone } = req.body;
        if (!roll_no || !name || !className || !parent_phone) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const existingSnap = await db.collection('students')
            .where('roll_no', '==', roll_no)
            .where('className', '==', className)
            .get();

        if (!existingSnap.empty) {
            return res.status(400).json({ success: false, message: 'Student with this Roll No already exists in this class.' });
        }

        const studentRef = await db.collection('students').add({
            roll_no, name, className, parent_phone,
            attendance_pct: 100,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Attempt to create parent Firebase Auth account
        let parentWarning = null;
        try {
            await admin.auth().getUserByPhoneNumber('+91' + parent_phone);
        } catch (authErr) {
            if (authErr.code === 'auth/user-not-found') {
                try {
                    const parentAuth = await admin.auth().createUser({
                        phoneNumber: '+91' + parent_phone,
                        displayName: `${name}'s Parent`,
                    });
                    await db.collection('users').doc(parentAuth.uid).set({
                        role: 'Parent',
                        name: `${name}'s Parent`,
                        contactNumber: parent_phone,
                        students: [studentRef.id],
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    });
                } catch (createErr) {
                    // Log the real error but don't roll back the student
                    console.error('Parent account creation failed:', createErr.message);
                    parentWarning = `Student added, but parent account creation failed: ${createErr.message}`;
                }
            } else {
                console.error('Parent lookup error (non-fatal):', authErr.message);
                parentWarning = `Student added, but parent lookup returned an unexpected error: ${authErr.message}`;
            }
        }

        const responsePayload = {
            success: true,
            student: { id: studentRef.id, roll_no, name },
        };
        if (parentWarning) responsePayload.warning = parentWarning;

        res.status(201).json(responsePayload);
    } catch (err) {
        console.error('Add Student Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── STAFF ────────────────────────────────────────────────────────────────────
// @route   GET /api/data/staff?limit=20&cursor=<docId>
// @access  Protected (Admin/SuperAdmin)
router.get('/staff', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || PAGE_LIMIT;
        const { cursor } = req.query;

        let query = db.collection('users')
            .where('role', 'in', ['Teacher', 'Admin', 'SuperAdmin'])
            .orderBy('name')
            .limit(limit);

        if (cursor) {
            const cursorDoc = await db.collection('users').doc(cursor).get();
            if (cursorDoc.exists) query = query.startAfter(cursorDoc);
        }

        const snap = await query.get();
        const staff = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const nextCursor = snap.docs.length === limit ? snap.docs[snap.docs.length - 1].id : null;

        res.json({ success: true, data: staff, nextCursor });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/staff
// @access  Protected (Admin/SuperAdmin)
router.post('/staff', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { username, password, name, role, contactNumber } = req.body;
        if (!username || !password || !name || !role) {
            return res.status(400).json({ success: false, message: 'Missing required staff fields.' });
        }

        const email = `${username}@zp.local`;
        try {
            const newAuthUser = await admin.auth().createUser({ email, password, displayName: name });
            await db.collection('users').doc(newAuthUser.uid).set({
                username, email, name, role,
                contactNumber: contactNumber || null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            res.status(201).json({ success: true, message: `${role} added successfully`, user: { username, role, name } });
        } catch (authErr) {
            if (authErr.code === 'auth/email-already-exists') {
                return res.status(400).json({ success: false, message: 'Staff username already exists.' });
            }
            throw authErr;
        }
    } catch (err) {
        console.error('Add Staff Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── ASSIGNMENTS ──────────────────────────────────────────────────────────────
// @route   GET /api/data/assignments?className=7A
// @access  Protected (All)
router.get('/assignments', protect, async (req, res) => {
    try {
        const { className } = req.query;
        let query = db.collection('assignments').orderBy('dueDate', 'asc');
        if (className) query = db.collection('assignments').where('className', '==', className).orderBy('dueDate', 'asc');

        const snap = await query.get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── CLASSES ──────────────────────────────────────────────────────────────────
router.get('/classes', protect, async (req, res) => {
    try {
        const snap = await db.collection('classes').orderBy('grade', 'asc').get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/classes', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { grade, section, room } = req.body;
        if (!grade || !section) return res.status(400).json({ success: false, message: 'Grade and section required.' });
        const ref = await db.collection('classes').add({ grade, section, room: room || null, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        res.status(201).json({ success: true, id: ref.id, grade, section, room });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.delete('/classes/:id', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        await db.collection('classes').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
router.get('/subjects', protect, async (req, res) => {
    try {
        const snap = await db.collection('subjects').orderBy('name', 'asc').get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/subjects', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { name, code, type } = req.body;
        if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required.' });
        const ref = await db.collection('subjects').add({ name, code, type: type || 'Theory', createdAt: admin.firestore.FieldValue.serverTimestamp() });
        res.status(201).json({ success: true, id: ref.id, name, code, type });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.delete('/subjects/:id', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        await db.collection('subjects').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── EVENTS ───────────────────────────────────────────────────────────────────
router.get('/events', protect, async (req, res) => {
    try {
        const snap = await db.collection('events').orderBy('date', 'asc').get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.post('/events', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { title, description, date } = req.body;
        if (!title || !date) return res.status(400).json({ success: false, message: 'Title and date required.' });
        const ref = await db.collection('events').add({ title, description: description || '', date, createdBy: req.user.id, createdAt: admin.firestore.FieldValue.serverTimestamp() });
        res.status(201).json({ success: true, id: ref.id, title, date });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── TIMETABLE ────────────────────────────────────────────────────────────────
// @route   GET /api/data/timetable?classId=X
// @access  Protected (All)
router.get('/timetable', protect, async (req, res) => {
    try {
        const { classId } = req.query;
        let query = db.collection('timetable');
        if (classId) query = query.where('classId', '==', classId);
        const snap = await query.get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/timetable  { classId, day, period, subjectId, teacherId }
// @access  Protected (Admin/SuperAdmin)
router.post('/timetable', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        const { classId, day, period, subjectId, teacherId } = req.body;
        if (!classId || !day || period == null) {
            return res.status(400).json({ success: false, message: 'classId, day, and period are required.' });
        }

        // Upsert: one slot per class+day+period
        const existing = await db.collection('timetable')
            .where('classId', '==', classId)
            .where('day', '==', day)
            .where('period', '==', period)
            .get();

        const slotData = { classId, day, period, subjectId: subjectId || null, teacherId: teacherId || null, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

        if (!existing.empty) {
            await existing.docs[0].ref.update(slotData);
            res.json({ success: true, id: existing.docs[0].id, ...slotData });
        } else {
            const ref = await db.collection('timetable').add({ ...slotData, createdAt: admin.firestore.FieldValue.serverTimestamp() });
            res.status(201).json({ success: true, id: ref.id, ...slotData });
        }
    } catch (err) {
        console.error('Timetable error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.delete('/timetable/:id', protect, roleProtect('Admin', 'SuperAdmin'), async (req, res) => {
    try {
        await db.collection('timetable').doc(req.params.id).delete();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── RESULTS ──────────────────────────────────────────────────────────────────
// @route   GET /api/data/results?classId=X&examType=mid
// @access  Protected (Admin/Teacher)
router.get('/results', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { classId, examType } = req.query;
        let query = db.collection('results');
        if (classId) query = query.where('classId', '==', classId);
        if (examType) query = query.where('examType', '==', examType);
        const snap = await query.orderBy('createdAt', 'desc').get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/data/results — { classId, examType, studentId, studentName, subjects:[{name,marks,maxMarks}] }
// @access  Protected (Admin/Teacher)
router.post('/results', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { classId, examType, studentId, studentName, subjects } = req.body;
        if (!classId || !examType || !studentId || !subjects) {
            return res.status(400).json({ success: false, message: 'classId, examType, studentId, and subjects are required.' });
        }
        const totalMarks = subjects.reduce((s, sub) => s + (sub.marks || 0), 0);
        const maxMarks = subjects.reduce((s, sub) => s + (sub.maxMarks || 100), 0);
        const percentage = maxMarks ? Math.round((totalMarks / maxMarks) * 100) : 0;

        const ref = await db.collection('results').add({
            classId, examType, studentId, studentName: studentName || '',
            subjects, totalMarks, maxMarks, percentage,
            createdBy: req.user.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(201).json({ success: true, id: ref.id });
    } catch (err) {
        console.error('Results error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
// @route   POST /api/data/attendance  { studentId, date, status: 'P'|'A' }
// @access  Protected (Teacher/Admin)
router.post('/attendance', protect, roleProtect('Admin', 'SuperAdmin', 'Teacher'), async (req, res) => {
    try {
        const { studentId, date, status } = req.body;
        if (!studentId || !date || !['P', 'A'].includes(status)) {
            return res.status(400).json({ success: false, message: 'studentId, date, and status (P|A) are required.' });
        }

        const recordId = `${studentId}_${date}`;
        await db.collection('attendance').doc(recordId).set({
            studentId, date, status,
            markedBy: req.user.id,
            markedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Recalculate attendance_pct from all records for this student
        const allSnap = await db.collection('attendance').where('studentId', '==', studentId).get();
        const all = allSnap.docs.map(d => d.data());
        const presentCount = all.filter(r => r.status === 'P').length;
        const pct = all.length ? Math.round((presentCount / all.length) * 100) : 100;

        await db.collection('students').doc(studentId).update({ attendance_pct: pct });

        res.json({ success: true, attendance_pct: pct });
    } catch (err) {
        console.error('Attendance error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/data/attendance?studentId=X&month=2026-03
// @access  Protected (Teacher/Admin/Parent)
router.get('/attendance', protect, async (req, res) => {
    try {
        const { studentId, month } = req.query;
        if (!studentId) return res.status(400).json({ success: false, message: 'studentId is required.' });

        let query = db.collection('attendance').where('studentId', '==', studentId);
        if (month) {
            // month = "2026-03" → filter dates starting with that prefix
            query = query.where('date', '>=', month).where('date', '<=', month + '\uf8ff');
        }
        const snap = await query.orderBy('date', 'desc').get();
        res.json({ success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
