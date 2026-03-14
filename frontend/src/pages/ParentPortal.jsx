import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import FeePanel from '../components/admin/FeePanel';
import ScholarshipPanel from '../components/admin/ScholarshipPanel';

const ParentPortal = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'dashboard';

    const [assignments, setAssignments] = useState([]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await api.get('/data/assignments').catch(() => ({ data: [] }));
                setAssignments(res.data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            }
        };
        fetchAssignments();
    }, []);

    // Helper functions for mock data UI
    const generateCalendar = (days, startDay) => {
        return Array.from({ length: days }).map((_, i) => {
            const isWeekend = (i + startDay) % 7 === 0 || (i + startDay) % 7 === 6;
            const isAbsent = i === 12 || i === 13;
            let statusClass = 'cd-empty';
            let label = '';

            if (isWeekend) {
                statusClass = 'cd-weekend';
            } else if (i < 24) { // past days
                statusClass = isAbsent ? 'cd-a' : 'cd-p';
                label = isAbsent ? 'A' : 'P';
            }

            return (
                <div key={i} className={`cal-day ${statusClass} ${i === 24 ? 'cd-today' : ''}`} style={{
                    aspectRatio: '1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 600,
                    background: statusClass === 'cd-weekend' ? '#F1F5F9' : statusClass === 'cd-p' ? '#C8E6C9' : statusClass === 'cd-a' ? '#FFCDD2' : 'transparent',
                    color: statusClass === 'cd-weekend' ? 'var(--muted)' : statusClass === 'cd-p' ? 'var(--success)' : statusClass === 'cd-a' ? 'var(--danger)' : 'inherit',
                    border: i === 24 ? '2px solid var(--saffron)' : 'none'
                }}>
                    {i < 24 && !isWeekend ? label : (isWeekend ? '' : i + 1)}
                </div>
            );
        });
    };

    return (
        <div className="dash-layout">
            <Sidebar role="Parent" />
            <div className="dash-main">
                <TopBar title="Parent Portal" subtitle="Track your child's progress" />

                {/* ====== STUDENT HERO ====== */}
                <div className="student-hero">
                    <div className="sh-inner">
                        <div className="sh-avatar">A</div>
                        <div>
                            <div className="sh-info">
                                <h2>Aanya Patil</h2>
                                <p style={{ opacity: .8, fontSize: '.875rem', marginTop: '.25rem' }}>Class 7A | Roll No: 12 | ZP Primary School, Maharashtra</p>
                            </div>
                            <div className="sh-stats">
                                <div className="sh-stat">
                                    <strong>92%</strong>
                                    <small>Attendance</small>
                                </div>
                                <div className="sh-stat">
                                    <strong>A</strong>
                                    <small>Current Grade</small>
                                </div>
                                <div className="sh-stat">
                                    <strong>Gold</strong>
                                    <small>Reading Badge</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dash-content">

                    {/* ====== PORTAL DASHBOARD (ATTENDANCE) ====== */}
                    {activeTab === 'dashboard' && (
                        <div className="panel slide-in active">
                            <div className="panel-card">
                                <h4 className="panel-section-title">
                                    <i className="fa-solid fa-calendar-check" style={{ color: 'var(--success)' }}></i> Attendance Summary
                                </h4>

                                <div className="cal-months" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                                    <div className="cal-month">
                                        <h4 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '.5rem', textAlign: 'center' }}>August (94%)</h4>
                                        <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={'h1' + i} className="cal-day-hdr" style={{ fontSize: '.7rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '2px' }}>{d}</div>)}
                                            {generateCalendar(31, 2)}
                                        </div>
                                    </div>
                                    <div className="cal-month">
                                        <h4 style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '.5rem', textAlign: 'center' }}>September (Current)</h4>
                                        <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={'h2' + i} className="cal-day-hdr" style={{ fontSize: '.7rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '2px' }}>{d}</div>)}
                                            {generateCalendar(30, 5).slice(0, 24)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====== HOMEWORK/ASSIGNMENTS ====== */}
                    {activeTab === 'assignments' && (
                        <div className="panel slide-in active">
                            <div className="panel-card">
                                <h4 className="panel-section-title">
                                    <i className="fa-solid fa-book-open" style={{ color: 'var(--warning)' }}></i> Active Assignments
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                    {assignments.length > 0 ? assignments.map((a, i) => (
                                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', borderLeft: '4px solid var(--navy)', background: 'var(--bg-main)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                                <strong style={{ fontSize: '.9rem', color: 'var(--text-main)' }}>{a.title || "Science Project Formulation"}</strong>
                                                <span className="badge-warning" style={{ fontSize: '.75rem' }}><i className="fa-regular fa-clock"></i> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Next week'}</span>
                                            </div>
                                            <p className="text-muted text-sm">{a.description || "Research on environmental issues."}</p>
                                        </div>
                                    )) : (
                                        <div className="empty-state">
                                            <i className="fa-solid fa-spinner fa-spin"></i> Loading Assignments...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'fees' && <FeePanel classes={[]} />}
                    {activeTab === 'scholarships' && <ScholarshipPanel classes={[]} />}
                </div>
            </div>
        </div>
    );
};

export default ParentPortal;
