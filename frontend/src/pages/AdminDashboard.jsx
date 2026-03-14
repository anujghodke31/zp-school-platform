import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

// Existing panels - Lazy Loaded
const OverviewPanel = React.lazy(() => import('../components/admin/OverviewPanel'));
const StudentsPanel = React.lazy(() => import('../components/admin/StudentsPanel'));
const TeachersPanel = React.lazy(() => import('../components/admin/TeachersPanel'));
const ClassesPanel = React.lazy(() => import('../components/admin/ClassesPanel'));
const SubjectsPanel = React.lazy(() => import('../components/admin/SubjectsPanel'));
const EventsPanel = React.lazy(() => import('../components/admin/EventsPanel'));
const AnnouncementsPanel = React.lazy(() => import('../components/admin/AnnouncementsPanel'));
const TimetablePanel = React.lazy(() => import('../components/admin/TimetablePanel'));
const ResultsPanel = React.lazy(() => import('../components/admin/ResultsPanel'));

// New blueprint panels - Lazy Loaded
const MdmPanel = React.lazy(() => import('../components/admin/MdmPanel'));
const FeePanel = React.lazy(() => import('../components/admin/FeePanel'));
const ScholarshipPanel = React.lazy(() => import('../components/admin/ScholarshipPanel'));
const LeavePanel = React.lazy(() => import('../components/admin/LeavePanel'));
const ExamPanel = React.lazy(() => import('../components/admin/ExamPanel'));
const LibraryPanel = React.lazy(() => import('../components/admin/LibraryPanel'));
const UDISEPanel = React.lazy(() => import('../components/admin/UDISEPanel'));
const ReportCardPanel = React.lazy(() => import('../components/admin/ReportCardPanel'));

// Modals
import AddUserModal from '../components/AddUserModal';
import AddClassModal from '../components/AddClassModal';
import AddSubjectModal from '../components/AddSubjectModal';
import AssignTeacherModal from '../components/AssignTeacherModal';

const AdminDashboard = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({});
    const [students, setStudents] = useState([]);
    const [studentCursor, setStudentCursor] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [teacherCursor, setTeacherCursor] = useState(null);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalType, setUserModalType] = useState('student');
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [statsRes, studentsRes, staffRes, classesRes, subjectsRes, eventsRes] = await Promise.all([
                api.get('/data/admin/stats').catch(() => ({ data: {} })),
                api.get('/data/students?limit=20').catch(() => ({ data: { data: [], nextCursor: null } })),
                api.get('/data/staff?limit=20').catch(() => ({ data: { data: [], nextCursor: null } })),
                api.get('/data/classes').catch(() => ({ data: { data: [] } })),
                api.get('/data/subjects').catch(() => ({ data: { data: [] } })),
                api.get('/data/events').catch(() => ({ data: { data: [] } })),
            ]);
            setStats(statsRes.data);
            setStudents(studentsRes.data.data || []);
            setStudentCursor(studentsRes.data.nextCursor || null);
            setTeachers(staffRes.data.data || []);
            setTeacherCursor(staffRes.data.nextCursor || null);
            setClasses(classesRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
            setEvents(eventsRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const [statsRes, studentsRes, staffRes, classesRes, subjectsRes, eventsRes] = await Promise.all([
                    api.get('/data/admin/stats').catch(() => ({ data: {} })),
                    api.get('/data/students?limit=20').catch(() => ({ data: { data: [], nextCursor: null } })),
                    api.get('/data/staff?limit=20').catch(() => ({ data: { data: [], nextCursor: null } })),
                    api.get('/data/classes').catch(() => ({ data: { data: [] } })),
                    api.get('/data/subjects').catch(() => ({ data: { data: [] } })),
                    api.get('/data/events').catch(() => ({ data: { data: [] } })),
                ]);
                if (isMounted) {
                    setStats(statsRes.data);
                    setStudents(studentsRes.data.data || []);
                    setStudentCursor(studentsRes.data.nextCursor || null);
                    setTeachers(staffRes.data.data || []);
                    setTeacherCursor(staffRes.data.nextCursor || null);
                    setClasses(classesRes.data.data || []);
                    setSubjects(subjectsRes.data.data || []);
                    setEvents(eventsRes.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch admin data:', err);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    const loadMoreStudents = async () => {
        if (!studentCursor) return;
        const res = await api.get(`/data/students?limit=20&cursor=${studentCursor}`).catch(() => ({ data: { data: [], nextCursor: null } }));
        setStudents(prev => [...prev, ...(res.data.data || [])]);
        setStudentCursor(res.data.nextCursor || null);
    };

    const loadMoreTeachers = async () => {
        if (!teacherCursor) return;
        const res = await api.get(`/data/staff?limit=20&cursor=${teacherCursor}`).catch(() => ({ data: { data: [], nextCursor: null } }));
        setTeachers(prev => [...prev, ...(res.data.data || [])]);
        setTeacherCursor(res.data.nextCursor || null);
    };

    const handleDeleteClass = async (id) => {
        await api.delete(`/data/classes/${id}`);
        setClasses(prev => prev.filter(c => c.id !== id));
    };

    const handleDeleteSubject = async (id) => {
        await api.delete(`/data/subjects/${id}`);
        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="dash-layout">
            <Sidebar role="Admin" />
            <div className="dash-main">
                <TopBar title="Admin Dashboard" subtitle="School-wide management & operations" />

                <AddUserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} type={userModalType} onUserAdded={fetchAll} />
                <AddClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} onAdded={fetchAll} />
                <AddSubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} onAdded={fetchAll} />
                <AssignTeacherModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} teacher={selectedTeacher} classes={classes} subjects={subjects} />

                <div className="dash-content">
                    <Suspense fallback={<div className="panel-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Loading panel...</div>}>
                        {activeTab === 'overview' && <OverviewPanel stats={stats} />}

                        {activeTab === 'students' && (
                            <StudentsPanel
                                students={students}
                                nextCursor={studentCursor}
                                onAddStudent={type => { setUserModalType(type); setIsUserModalOpen(true); }}
                                onLoadMore={loadMoreStudents}
                            />
                        )}

                        {activeTab === 'teachers' && (
                            <TeachersPanel
                                teachers={teachers}
                                nextCursor={teacherCursor}
                                onAddStaff={() => { setUserModalType('staff'); setIsUserModalOpen(true); }}
                                onAssign={t => { setSelectedTeacher(t); setIsAssignModalOpen(true); }}
                                onLoadMore={loadMoreTeachers}
                            />
                        )}

                        {activeTab === 'classes' && (
                            <ClassesPanel
                                classes={classes}
                                onAddClass={() => setIsClassModalOpen(true)}
                                onDeleteClass={handleDeleteClass}
                            />
                        )}

                        {activeTab === 'subjects' && (
                            <SubjectsPanel
                                subjects={subjects}
                                onAddSubject={() => setIsSubjectModalOpen(true)}
                                onDeleteSubject={handleDeleteSubject}
                            />
                        )}

                        {activeTab === 'events' && (
                            <EventsPanel events={events} onRefresh={() => api.get('/data/events?limit=20').then(res => setEvents(res.data.data || [])).catch(console.error)} />
                        )}

                        {activeTab === 'timetable' && (
                            <TimetablePanel classes={classes} subjects={subjects} teachers={teachers} />
                        )}

                        {activeTab === 'results' && <ResultsPanel classes={classes} />}
                        {activeTab === 'analytics' && <ResultsPanel classes={classes} />}
                        {activeTab === 'announcements' && <AnnouncementsPanel />}

                        {/* ── New Blueprint Panels ─────────────────────────────── */}
                        {activeTab === 'mdm' && <MdmPanel />}
                        {activeTab === 'fees' && <FeePanel classes={classes} />}
                        {activeTab === 'scholarships' && <ScholarshipPanel classes={classes} />}
                        {activeTab === 'leave' && <LeavePanel isAdmin={true} />}
                        {activeTab === 'exams' && <ExamPanel classes={classes} />}
                        {activeTab === 'library' && <LibraryPanel />}
                        {activeTab === 'udise' && <UDISEPanel />}
                        {activeTab === 'report-card' && <ReportCardPanel students={students} />}
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
