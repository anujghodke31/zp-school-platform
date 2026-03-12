import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { AuthContext } from '../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';

    const [assignments, setAssignments] = useState([]);
    const [notices, setNotices] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [attendancePct, setAttendancePct] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [assignRes, noticeRes] = await Promise.all([
                    api.get('/data/assignments').catch(() => ({ data: { data: [] } })),
                    api.get('/notices').catch(() => ({ data: [] })),
                ]);
                setAssignments(assignRes.data.data || []);
                setNotices(Array.isArray(noticeRes.data) ? noticeRes.data : []);
            } catch (err) {
                console.error('Student dashboard load error:', err);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!user?._id) return;
        const month = new Date().toISOString().slice(0, 7); // "2026-03"
        api.get(`/data/attendance?studentId=${user._id}&month=${month}`)
            .then(res => {
                const records = res.data.data || [];
                setAttendance(records);
                if (records.length) {
                    const present = records.filter(r => r.status === 'P').length;
                    setAttendancePct(Math.round((present / records.length) * 100));
                }
            })
            .catch(console.error);
    }, [user]);

    const dueAssignments = assignments.filter(a => a.dueDate && new Date(a.dueDate) > new Date());

    return (
        <div className="dash-layout">
            <Sidebar role="Student" />
            <div className="dash-main">
                <TopBar title="Student Dashboard" subtitle={`Welcome, ${user?.name || 'Student'}`} />

                {/* Hero card */}
                <div className="student-hero">
                    <div className="sh-inner">
                        <div className="sh-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'S'}</div>
                        <div>
                            <h2>{user?.name || 'Student'}</h2>
                            <p style={{ opacity: .8, fontSize: '.875rem', marginTop: '.25rem' }}>Student Portal — MahaVidya</p>
                            <div className="sh-stats">
                                <div className="sh-stat">
                                    <strong>{attendancePct != null ? `${attendancePct}%` : '—'}</strong>
                                    <small>This Month</small>
                                </div>
                                <div className="sh-stat">
                                    <strong>{dueAssignments.length}</strong>
                                    <small>Due Soon</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dash-content">
                    {activeTab === 'overview' && (
                        <div className="panel slide-in active">
                            <div className="stat-grid">
                                <div className="stat-card-item">
                                    <div className="stat-icon" style={{ background: 'var(--navy-light)', color: 'var(--navy)' }}>
                                        <i className="fa-solid fa-calendar-check" />
                                    </div>
                                    <div>
                                        <div className="stat-val">{attendancePct != null ? `${attendancePct}%` : '—'}</div>
                                        <div className="stat-lbl">Attendance (This Month)</div>
                                    </div>
                                </div>
                                <div className="stat-card-item">
                                    <div className="stat-icon" style={{ background: 'var(--saffron-light)', color: 'var(--saffron)' }}>
                                        <i className="fa-solid fa-book-open" />
                                    </div>
                                    <div>
                                        <div className="stat-val">{dueAssignments.length}</div>
                                        <div className="stat-lbl">Assignments Due</div>
                                    </div>
                                </div>
                                <div className="stat-card-item">
                                    <div className="stat-icon" style={{ background: '#E8F5E9', color: 'var(--success)' }}>
                                        <i className="fa-solid fa-bullhorn" />
                                    </div>
                                    <div>
                                        <div className="stat-val">{notices.length}</div>
                                        <div className="stat-lbl">Notices</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent notices */}
                            {notices.length > 0 && (
                                <div className="panel-card" style={{ marginTop: '1.5rem' }}>
                                    <h4 className="panel-section-title">Recent Notices</h4>
                                    {notices.slice(0, 5).map(n => (
                                        <div key={n.id} className="event-item">
                                            <div className="event-date-badge" style={{ background: 'var(--navy)', minWidth: '44px' }}>
                                                <i className="fa-solid fa-bell" style={{ color: '#fff' }} />
                                            </div>
                                            <div>
                                                <div className="event-title">{n.title}</div>
                                                <div className="text-muted text-xs">{n.message}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="panel slide-in active">
                            <div className="panel-card">
                                <h4 className="panel-section-title">My Assignments</h4>
                                {assignments.length > 0 ? assignments.map((a, i) => (
                                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', borderLeft: '4px solid var(--navy)', marginBottom: '.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                            <strong style={{ fontSize: '.9rem' }}>{a.title || 'Assignment'}</strong>
                                            {a.dueDate && (
                                                <span className="badge-warning" style={{ fontSize: '.75rem' }}>
                                                    <i className="fa-regular fa-clock" /> Due: {new Date(a.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-muted text-sm">{a.description || ''}</p>
                                    </div>
                                )) : (
                                    <div className="empty-state">No assignments found.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="panel slide-in active">
                            <div className="panel-card">
                                <h4 className="panel-section-title">Attendance Record — This Month</h4>
                                {attendance.length > 0 ? (
                                    <div className="data-table-wrap">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th className="th-navy">Date</th>
                                                    <th className="th-navy">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendance.map(r => (
                                                    <tr key={r.id} className="table-row">
                                                        <td className="td">{r.date}</td>
                                                        <td className="td">
                                                            <span className={r.status === 'P' ? 'badge-success' : 'badge-danger'}>
                                                                {r.status === 'P' ? 'Present' : 'Absent'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">No attendance records for this month.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
