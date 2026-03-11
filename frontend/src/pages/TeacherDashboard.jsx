import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'attendance';

    const [students, setStudents] = useState([]);
    const [noticeText, setNoticeText] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get('/data/students').catch(() => ({ data: [] }));
                setStudents(res.data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            }
        };
        fetchStudents();
    }, []);

    const handleSendNotice = async () => {
        if (!noticeText) return;
        try {
            await api.post('/notices', { title: 'Teacher Notice', message: noticeText, audience: 'All' });
            setNoticeText('');
            // The global ToastNotification will catch the SSE and show it.
        } catch (error) {
            console.error("Failed to send notice", error);
        }
    };

    return (
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar role="Teacher" />
            <div className="main" style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar title="Teacher Dashboard" subtitle="Class 7A - Homeroom" />

                <div className="content" style={{ padding: '2rem', flex: 1 }}>

                    {/* ======== ATTENDANCE PANEL ======== */}
                    {activeTab === 'attendance' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="card-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Daily Attendance Register
                                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                                        <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--navy)', color: '#fff', padding: '.55rem 1.1rem', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', cursor: 'pointer', border: 'none' }}><i className="fa-solid fa-cloud-arrow-up"></i> Sync to Cloud</button>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Roll</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Student Info</th>
                                                <th style={{ background: 'var(--navy)', color: '#fff', padding: '.75rem 1rem', textAlign: 'left', fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase' }}>Mark Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length > 0 ? students.map(st => (
                                                <tr key={st._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--navy-light)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{st.roll_no}</div>
                                                    </td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                                                        <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Parent: {st.parent_contact}</div>
                                                    </td>
                                                    <td style={{ padding: '.875rem 1rem', fontSize: '.88rem' }}>
                                                        <div style={{ display: 'flex', gap: '.4rem' }}>
                                                            <button style={{ width: '38px', height: '32px', borderRadius: '6px', border: '1.5px solid var(--success)', background: '#E8F5E9', color: 'var(--success)', fontWeight: 700, cursor: 'pointer' }}>P</button>
                                                            <button style={{ width: '38px', height: '32px', borderRadius: '6px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--muted)', fontWeight: 700, cursor: 'pointer' }}>A</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
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

                    {/* ======== MESSAGING PANEL ======== */}
                    {activeTab === 'messages' && (
                        <div className="panel slide-in active">
                            <div className="card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.5rem', maxWidth: '600px' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Parent Communications (SSE Broadcast)</h4>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '.35rem' }}>Notice Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Science Fair Tomorrow" value="Teacher Notice" disabled style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '.6rem .875rem', fontSize: '.9rem', background: '#f8fafc' }} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: '.35rem' }}>Message content (English/Marathi)</label>
                                    <textarea
                                        className="form-input"
                                        rows="4"
                                        placeholder="Type your notice here..."
                                        value={noticeText}
                                        onChange={(e) => setNoticeText(e.target.value)}
                                        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '.6rem .875rem', fontSize: '.9rem' }}></textarea>
                                </div>
                                <button className="btn btn-saffron" onClick={handleSendNotice} style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', width: '100%', justifyContent: 'center', padding: '.8rem', fontSize: '1rem', background: 'var(--saffron)', color: '#fff', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                    Broadcast to Parents <i className="fa-solid fa-paper-plane"></i>
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
