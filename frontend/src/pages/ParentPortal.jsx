import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

const ParentPortal = () => {
    const { user } = useContext(AuthContext);
    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data } = await api.get('/data/assignments');
                setAssignments(data);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            }
        };
        fetchAssignments();
    }, []);

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <Sidebar role="Parent" />
            <main className="main-content">
                <TopBar title="Parent Portal" />
                <div className="content-area">
                    <div className="section-header">
                        <h2>Welcome, Parent of {user?.studentName || 'Student'}</h2>
                    </div>

                    <div className="panel data-panel slide-in">
                        <div className="panel-header">
                            <h3><BookOpen size={18} style={{ marginRight: '8px' }} /> Pending Homework</h3>
                        </div>
                        <div className="panel-body">
                            {assignments.length === 0 ? <p>No homework due!</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {assignments.map(a => (
                                        <div key={a._id} style={{ padding: '1rem', border: '1px solid #333', borderRadius: '8px', background: 'var(--surface-color)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <h4 style={{ margin: 0, color: 'var(--primary-color)' }}>{a.title}</h4>
                                                <span className="badge" style={{ background: 'var(--primary-hover)' }}>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>{a.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ParentPortal;
