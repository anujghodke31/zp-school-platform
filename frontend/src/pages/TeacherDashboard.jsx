import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const TeacherDashboard = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'attendance';

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [syncing, setSyncing] = useState(false);
    const [noticeText, setNoticeText] = useState('');

    const today = new Date().toISOString().slice(0, 10);

    useEffect(() => {
        api.get('/data/students?limit=50')
            .then(res => setStudents(res.data.data || []))
            .catch(err => console.error('Failed to fetch students', err));
    }, []);

    const markAttendance = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const syncToCloud = async () => {
        setSyncing(true);
        try {
            await Promise.all(
                Object.entries(attendance).map(([studentId, status]) =>
                    api.post('/data/attendance', { studentId, date: today, status })
                )
            );
            setAttendance({});
        } catch (err) {
            console.error('Attendance sync error:', err);
        } finally {
            setSyncing(false);
        }
    };

    const handleSendNotice = async () => {
        if (!noticeText) return;
        try {
            await api.post('/notices', { title: 'Teacher Notice', message: noticeText, audience: 'All' });
            setNoticeText('');
        } catch (err) {
            console.error('Failed to send notice', err);
        }
    };

    return (
        <div className="dash-layout">
            <Sidebar role="Teacher" />
            <div className="dash-main">
                <TopBar title="Teacher Dashboard" subtitle="Attendance & Communication" />

                <div className="dash-content">
                    {activeTab === 'attendance' && (
                        <div className="panel slide-in active">
                            <div className="panel-card">
                                <div className="panel-title-row">
                                    <span>Daily Attendance Register — {today}</span>
                                    <button className="btn btn-saffron" onClick={syncToCloud} disabled={syncing || Object.keys(attendance).length === 0}>
                                        <i className="fa-solid fa-cloud-arrow-up" /> {syncing ? 'Syncing…' : `Sync ${Object.keys(attendance).length} Record(s)`}
                                    </button>
                                </div>
                                <div className="data-table-wrap">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th className="th-navy">Roll</th>
                                                <th className="th-navy">Student Info</th>
                                                <th className="th-navy">Mark Status</th>
                                                <th className="th-navy">Saved</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length > 0 ? students.map(st => (
                                                <tr key={st.id} className="table-row">
                                                    <td className="td">
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--navy-light)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                                            {st.roll_no}
                                                        </div>
                                                    </td>
                                                    <td className="td">
                                                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                                                        <div className="text-muted text-xs">{st.parent_phone}</div>
                                                    </td>
                                                    <td className="td">
                                                        <div style={{ display: 'flex', gap: '.4rem' }}>
                                                            <button
                                                                style={{ width: '38px', height: '32px', borderRadius: '6px', border: '1.5px solid var(--success)', background: attendance[st.id] === 'P' ? 'var(--success)' : '#E8F5E9', color: attendance[st.id] === 'P' ? '#fff' : 'var(--success)', fontWeight: 700, cursor: 'pointer' }}
                                                                onClick={() => markAttendance(st.id, 'P')}
                                                            >P</button>
                                                            <button
                                                                style={{ width: '38px', height: '32px', borderRadius: '6px', border: '1.5px solid var(--danger)', background: attendance[st.id] === 'A' ? 'var(--danger)' : '#FFEBEE', color: attendance[st.id] === 'A' ? '#fff' : 'var(--danger)', fontWeight: 700, cursor: 'pointer' }}
                                                                onClick={() => markAttendance(st.id, 'A')}
                                                            >A</button>
                                                        </div>
                                                    </td>
                                                    <td className="td">
                                                        <span className={`badge-${(st.attendance_pct ?? 100) >= 75 ? 'success' : 'danger'}`}>
                                                            {st.attendance_pct ?? 100}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan="4" className="empty-state"><i className="fa-solid fa-spinner fa-spin" /> Loading students...</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'messages' && (
                        <div className="panel slide-in active">
                            <div className="panel-card" style={{ maxWidth: '600px' }}>
                                <h4 className="panel-section-title">Parent Communications (SSE Broadcast)</h4>
                                <div className="form-group mb-sm">
                                    <label className="form-label">Notice Title</label>
                                    <input className="form-input" value="Teacher Notice" disabled />
                                </div>
                                <div className="form-group mb-sm">
                                    <label className="form-label">Message (English / मराठी)</label>
                                    <textarea className="form-input" rows="4" placeholder="Type your notice here..." value={noticeText} onChange={e => setNoticeText(e.target.value)} />
                                </div>
                                <button className="btn btn-saffron w-100" onClick={handleSendNotice}>
                                    Broadcast to Parents <i className="fa-solid fa-paper-plane" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
