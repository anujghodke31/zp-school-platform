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
    const [dataError, setDataError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMoreStudents, setIsLoadingMoreStudents] = useState(false);
    const [isLoadingMoreTeachers, setIsLoadingMoreTeachers] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            setIsLoading(true);
            setDataError(null);
            const [statsRes, studentsRes, staffRes, classesRes, subjectsRes, eventsRes] = await Promise.all([
                api.get('/data/admin/stats').catch((err) => ({ error: err, data: {} })),
                api.get('/data/students?limit=20').catch((err) => ({ error: err, data: { data: [], nextCursor: null } })),
                api.get('/data/staff?limit=20').catch((err) => ({ error: err, data: { data: [], nextCursor: null } })),
                api.get('/data/classes').catch((err) => ({ error: err, data: { data: [] } })),
                api.get('/data/subjects').catch((err) => ({ error: err, data: { data: [] } })),
                api.get('/data/events').catch((err) => ({ error: err, data: { data: [] } })),
            ]);

            const responses = [statsRes, studentsRes, staffRes, classesRes, subjectsRes, eventsRes];
            const hasError = responses.some(res => res.error);

            if (hasError) {
                const firstError = responses.find(res => res.error)?.error;
                if (firstError?.response?.data?.message?.includes('Firebase not configured') || firstError?.message?.includes('Firebase not configured')) {
                    setDataError('Database is not configured. Real data features will fail. Please set up Firebase credentials.');
                } else {
                    setDataError('Failed to load some dashboard data. Please try again later.');
                }
            }

            setStats(statsRes.data);
            setStudents(studentsRes.data.data || []);
            setStudentCursor(studentsRes.data.nextCursor || null);
            setTeachers(staffRes.data.data || []);
            setTeacherCursor(staffRes.data.nextCursor || null);
            setClasses(classesRes.data.data || []);
            setSubjects(subjectsRes.data.data || []);
            setEvents(eventsRes.data.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
            setDataError('An unexpected error occurred while loading data.');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Wrapped in an async self-invoking function to avoid synchronous setState warnings
        const initLoad = async () => {
            if (isMounted) {
                await fetchAll();
            }
        };
        initLoad();

        return () => {
            isMounted = false;
        };
    }, [fetchAll]);

    const loadMoreStudents = async () => {
        if (!studentCursor) return;
        setIsLoadingMoreStudents(true);
        const res = await api.get(`/data/students?limit=20&cursor=${studentCursor}`).catch(() => ({ data: { data: [], nextCursor: null } }));
        setStudents(prev => [...prev, ...(res.data.data || [])]);
        setStudentCursor(res.data.nextCursor || null);
        setIsLoadingMoreStudents(false);
    };

    const loadMoreTeachers = async () => {
        if (!teacherCursor) return;
        setIsLoadingMoreTeachers(true);
        const res = await api.get(`/data/staff?limit=20&cursor=${teacherCursor}`).catch(() => ({ data: { data: [], nextCursor: null } }));
        setTeachers(prev => [...prev, ...(res.data.data || [])]);
        setTeacherCursor(res.data.nextCursor || null);
        setIsLoadingMoreTeachers(false);
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
                    {dataError && (
                        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.5rem' }}></i>
                                {dataError}
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={fetchAll} style={{ backgroundColor: '#fff', color: '#991b1b', borderColor: '#f87171' }}>
                                <i className="fa-solid fa-rotate-right" style={{ marginRight: '0.3rem' }}></i> Retry
                            </button>
                        </div>
                    )}
                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--navy)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                    <Suspense fallback={<div className="panel-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Loading panel...</div>}>
                        {activeTab === 'overview' && <OverviewPanel stats={stats} />}

                        {activeTab === 'students' && (
                            <StudentsPanel
                                students={students}
                                nextCursor={studentCursor}
                                onAddStudent={type => { setUserModalType(type); setIsUserModalOpen(true); }}
                                onLoadMore={loadMoreStudents}
                                isLoading={isLoadingMoreStudents}
                            />
                        )}

                        {activeTab === 'teachers' && (
                            <TeachersPanel
                                teachers={teachers}
                                nextCursor={teacherCursor}
                                onAddStaff={() => { setUserModalType('staff'); setIsUserModalOpen(true); }}
                                onAssign={t => { setSelectedTeacher(t); setIsAssignModalOpen(true); }}
                                onLoadMore={loadMoreTeachers}
                                isLoading={isLoadingMoreTeachers}
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
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
