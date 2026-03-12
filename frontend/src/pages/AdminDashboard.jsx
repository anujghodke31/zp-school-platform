import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import AddUserModal from '../components/AddUserModal';
import AddClassModal from '../components/AddClassModal';
import AddSubjectModal from '../components/AddSubjectModal';
import AssignTeacherModal from '../components/AssignTeacherModal';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const [stats, setStats] = useState({
        totalStudents: 0,
        attendanceRate: 0,
        atRiskStudents: 0,
        totalTeachers: 0
    });
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [events, setEvents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [noticeText, setNoticeText] = useState('');

    // Modal State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalType, setUserModalType] = useState('student');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const fetchAdminData = async () => {
        try {
            const [statsRes, studentsRes, staffRes] = await Promise.all([
                api.get('/data/admin/stats').catch(() => ({ data: {} })),
                api.get('/data/students').catch(() => ({ data: [] })),
                api.get('/data/staff').catch(() => ({ data: [] }))
            ]);
            setStats(statsRes.data);
            setStudents(studentsRes.data);
            setTeachers(staffRes.data);

            const eventsQuery = query(collection(db, 'events'), orderBy('date', 'asc'));
            const eventsSnapshot = await getDocs(eventsQuery);
            setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const classesQuery = query(collection(db, 'classes'), orderBy('grade', 'asc'));
            const classesSnapshot = await getDocs(classesQuery);
            setClasses(classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const subjectsQuery = query(collection(db, 'subjects'), orderBy('name', 'asc'));
            const subjectsSnapshot = await getDocs(subjectsQuery);
            setSubjects(subjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const openAddUserModal = (type) => {
        setUserModalType(type);
        setIsUserModalOpen(true);
    };

    const openAssignModal = (teacher) => {
        setSelectedTeacher(teacher);
        setIsAssignModalOpen(true);
    };

    const handleSendNotice = async () => {
        if (!noticeText) return;
        try {
            await api.post('/notices', { title: 'Admin Announcement', message: noticeText, audience: 'All' });
            setNoticeText('');
            // ToastNotification will catch the SSE
        } catch (error) {
            console.error("Failed to send notice", error);
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar role="Admin" />
            <div className="main" style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar title="Dashboard Overview" subtitle="School-wide summary and quick actions" />

                <AddUserModal
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                    type={userModalType}
                    onUserAdded={fetchAdminData}
                />
                
                <AddClassModal
                    isOpen={isClassModalOpen}
                    onClose={() => setIsClassModalOpen(false)}
                    onAdded={fetchAdminData}
                />

                <AddSubjectModal
                    isOpen={isSubjectModalOpen}
                    onClose={() => setIsSubjectModalOpen(false)}
                    onAdded={fetchAdminData}
                />

                <AssignTeacherModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    teacher={selectedTeacher}
                    classes={classes}
                    subjects={subjects}
                />

                <div className="content" style={{ padding: '2rem', flex: 1, position: 'relative', zIndex: 100 }}>

                    {/* ======== OVERVIEW PANEL ======== */}
                    {activeTab === 'overview' && (
                        <div className="panel slide-in active">
                            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'var(--navy-light)', color: 'var(--navy)' }}><i className="fa-solid fa-users"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.totalStudents || 18450}</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Total Students</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: '#E8F5E9', color: 'var(--success)' }}><i className="fa-solid fa-percent"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.attendanceRate || 82}%</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Avg Attendance</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: '#FFEBEE', color: 'var(--danger)' }}><i className="fa-solid fa-triangle-exclamation"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.atRiskStudents || 142}</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>At-Risk Students</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'var(--saffron-light)', color: 'var(--warning)' }}><i className="fa-solid fa-chalkboard-user"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>{stats.totalTeachers || 840}</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Teachers</div>
                                    </div>
                                </div>
                            </div>
                            <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: '#F3E5F5', color: '#6A1B9A' }}><i className="fa-solid fa-school"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>56</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Classes</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: '#E8F5E9', color: 'var(--success)' }}><i className="fa-solid fa-file-pen"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>1,120</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Assignments</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'var(--navy-light)', color: 'var(--navy)' }}><i className="fa-solid fa-building-columns"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>12</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Schools</div>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                    <div className="stat-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: 'var(--saffron-light)', color: 'var(--warning)' }}><i className="fa-solid fa-wifi"></i></div>
                                    <div>
                                        <div className="stat-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)' }}>3,412</div>
                                        <div className="stat-lbl" style={{ fontSize: '.78rem', color: 'var(--muted)', fontWeight: 500 }}>Active Sessions</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== STUDENTS PANEL ======== */}
                    {activeTab === 'students' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Student Management — District Overview
                                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                                        <div className="search-wrap" style={{ width: '220px', display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: '10px', padding: '.5rem 1rem' }}>
                                            <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--muted)' }}></i>
                                            <input type="text" placeholder="Search student..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '.9rem', flex: 1 }} />
                                        </div>
                                        <button className="btn btn-primary" aria-label="Add New Student" onClick={() => openAddUserModal('student')} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none', position: 'relative', zIndex: 20 }}><i className="fa-solid fa-plus"></i> Add Student</button>
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Roll</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Class</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Parent Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length > 0 ? students.map((st, i) => (
                                                <tr key={st._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{st.roll_no}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}><strong>{st.name}</strong></td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{st.class_grade} {st.division}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{st.parent_contact}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                                                        <i className="fa-solid fa-spinner fa-spin"></i> Loading Database Records...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== TEACHERS PANEL ======== */}
                    {activeTab === 'teachers' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)', position: 'relative', zIndex: 110 }}>
                                <div className="card-title admin-controls-layer" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 120 }}>
                                    Teacher Management
                                    <button className="btn btn-primary" aria-label="Add Teacher or Admin" onClick={() => openAddUserModal('staff')} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none', position: 'relative', zIndex: 140 }}><i className="fa-solid fa-plus"></i> Add Teacher / Admin</button>
                                </div>
                                <div style={{ overflowX: 'auto', position: 'relative', zIndex: 115 }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>#</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Name</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Role</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Contact</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teachers.length > 0 ? teachers.map((t, i) => (
                                                <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{i + 1}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <strong style={{ display: 'block' }}>{t.name}</strong>
                                                        <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}>ID: {t.username}</span>
                                                    </td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{t.role}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{t.contactNumber || 'N/A'}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}><span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: '20px', fontSize: '.75rem', fontWeight: 600 }}>● Active</span></td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        {t.role === 'Teacher' && (
                                                            <button className="btn btn-sm" onClick={() => openAssignModal(t)} style={{ cursor: 'pointer', background: 'var(--navy)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Assign Subject</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                                                        <i className="fa-solid fa-spinner fa-spin"></i> Loading Database Records...
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== TIMETABLE PANEL ======== */}
                    {activeTab === 'timetable' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '4rem 1.5rem', textAlign: 'center' }}>
                                <i className="fa-solid fa-calendar-week" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: '1rem' }}></i>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>Timetable Management</h3>
                                <p style={{ color: 'var(--muted)', marginTop: '.5rem' }}>Basic timetable data structure is established. Full visual scheduler interface coming soon.</p>
                                <button className="btn btn-primary" onClick={() => alert('Timetable builder opening...')} style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fa-solid fa-plus"></i> Create Schedule</button>
                            </div>
                        </div>
                    )}

                    {/* ======== CLASSES PANEL ======== */}
                    {activeTab === 'classes' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Classes & Sections Management
                                    <button className="btn btn-primary" onClick={() => setIsClassModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fa-solid fa-plus"></i> Add Class</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Grade/Class</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Section</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Room</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {classes.length > 0 ? classes.map((cls) => (
                                                <tr key={cls.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}><strong>{cls.grade}</strong></td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{cls.section}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{cls.room || 'N/A'}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <button className="btn-icon" style={{ cursor: 'pointer', color: 'var(--danger)', background: 'transparent', border: 'none' }}><i className="fa-solid fa-trash"></i></button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No classes found. Please add a class.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== SUBJECTS PANEL ======== */}
                    {activeTab === 'subjects' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Subjects Master List
                                    <button className="btn btn-primary" onClick={() => setIsSubjectModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fa-solid fa-plus"></i> Add Subject</button>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Subject Name</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Code</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Type</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subjects.length > 0 ? subjects.map((sub) => (
                                                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}><strong>{sub.name}</strong></td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>{sub.code}</td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <span style={{ background: sub.type === 'Theory' ? '#E3F2FD' : sub.type === 'Practical' ? '#E8F5E9' : '#FFF3E0', color: sub.type === 'Theory' ? '#1565C0' : sub.type === 'Practical' ? '#2E7D32' : '#E65100', padding: '3px 8px', borderRadius: '12px', fontSize: '.75rem', fontWeight: 600 }}>{sub.type}</span>
                                                    </td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                       <button className="btn-icon" style={{ cursor: 'pointer', color: 'var(--danger)', background: 'transparent', border: 'none' }}><i className="fa-solid fa-trash"></i></button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No subjects found. Please add a subject.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== EVENTS PANEL ======== */}
                    {activeTab === 'events' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    School Events & Holidays
                                    <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fa-solid fa-plus"></i> Add Event</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                    {events.length > 0 ? events.map(event => {
                                        const eventDate = new Date(event.date);
                                        return (
                                            <div key={event.id} className="event-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.875rem 1rem', background: 'var(--bg)', borderRadius: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                                                    <div style={{ background: 'var(--navy)', color: '#fff', borderRadius: '8px', padding: '.35rem .65rem', textAlign: 'center', minWidth: '44px' }}>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{eventDate.getDate().toString().padStart(2, '0')}</div>
                                                        <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', opacity: .8 }}>{eventDate.toLocaleString('default', { month: 'short' })}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.15rem' }}>{event.title}</div>
                                                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{event.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>No upcoming events found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ======== ANNOUNCEMENTS PANEL ======== */}
                    {activeTab === 'announcements' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', maxWidth: '600px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Broadcast Announcement (SSE)</h4>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '.35rem' }}>Notice Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Science Fair Tomorrow" value="Admin Notice" disabled style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '.6rem .875rem', fontSize: '.9rem', background: '#f8fafc' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '.35rem' }}>Message content</label>
                                    <textarea
                                        className="form-input"
                                        rows="4"
                                        placeholder="Type your notice here..."
                                        value={noticeText}
                                        onChange={(e) => setNoticeText(e.target.value)}
                                        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '.6rem .875rem', fontSize: '.9rem' }}></textarea>
                                </div>
                                <button className="btn btn-saffron" onClick={handleSendNotice} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', width: '100%', justifyContent: 'center', padding: '.8rem', fontSize: '1rem', background: 'var(--saffron)', color: '#fff', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                    Broadcast to Network <i className="fa-solid fa-tower-broadcast"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ======== RESULTS/ANALYTICS FALLBACK ======== */}
                    {(activeTab === 'results' || activeTab === 'analytics') && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '4rem 1.5rem', textAlign: 'center' }}>
                                <i className="fa-solid fa-chart-diagram" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: '1rem' }}></i>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>Coming Soon</h3>
                                <p style={{ color: 'var(--muted)', marginTop: '.5rem' }}>This module is scheduled for the next release cycle.</p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
