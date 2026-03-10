import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import api from '../utils/api';
import { Send } from 'lucide-react';

const TeacherDashboard = () => {
    const [students, setStudents] = useState([]);
    const [noticeMsg, setNoticeMsg] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await api.get('/data/students');
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    const sendNotice = async (e) => {
        e.preventDefault();
        if (!noticeMsg) return;
        try {
            await api.post('/notices', {
                title: 'Teacher Announcement',
                message: noticeMsg,
                audience: 'all'
            });
            setNoticeMsg('');
            alert('Notice broadcasted to all active clients!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <Sidebar role="Teacher" />
            <main className="main-content">
                <TopBar title="Teacher Dashboard" />
                <div className="content-area">

                    <div className="panel data-panel mb-4">
                        <div className="panel-header">
                            <h3>Broadcast Notice (SSE Demo)</h3>
                        </div>
                        <div className="panel-body">
                            <form onSubmit={sendNotice} style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    className="search-input"
                                    style={{ flex: 1, padding: '10px' }}
                                    placeholder="Type an announcement to broadcast..."
                                    value={noticeMsg}
                                    onChange={(e) => setNoticeMsg(e.target.value)}
                                />
                                <button type="submit" className="primary-btn"><Send size={16} style={{ marginRight: '8px' }} /> Send Alert</button>
                            </form>
                        </div>
                    </div>

                    <div className="panel data-panel slide-in">
                        <div className="panel-header">
                            <h3>My Students ({students.length})</h3>
                        </div>
                        <div className="panel-body p-0">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s._id}>
                                            <td>{s.roll_no}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="avatar small">{s.name.charAt(0)}</div>
                                                    {s.name}
                                                </div>
                                            </td>
                                            <td><span className="badge">{s.className}</span></td>
                                            <td>
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${s.attendance_pct}%`, backgroundColor: s.attendance_pct > 80 ? '#4CAF50' : '#FF9800' }}></div>
                                                </div>
                                                <span style={{ fontSize: '12px', color: '#888', marginTop: '4px', display: 'block' }}>{s.attendance_pct}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
