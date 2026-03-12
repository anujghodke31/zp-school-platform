import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import FeePanel from '../components/admin/FeePanel';
import ScholarshipPanel from '../components/admin/ScholarshipPanel';

const ParentPortal = () => {
    const navigate = useNavigate();
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
        <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <Sidebar role="Parent" />
            <div className="main" style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar title="Parent Portal" subtitle="Track your child's progress" />

                {/* ====== STUDENT HERO ====== */}
                <div className="student-hero" style={{ background: 'linear-gradient(135deg, var(--navy), #3949AB)', color: '#fff', padding: '2rem 1.5rem' }}>
                    <div className="sh-inner" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div className="sh-avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, border: '3px solid rgba(255,255,255,.4)', flexShrink: 0 }}>A</div>
                        <div>
                            <div className="sh-info">
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Aanya Patil</h2>
                                <p style={{ fontSize: '.85rem', opacity: .8, marginTop: '.2rem' }}>Class 7A | Roll No: 12 | ZP Primary School, Maharashtra</p>
                            </div>
                            <div className="sh-stats" style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                <div className="sh-stat" style={{ background: 'rgba(255,255,255,.15)', borderRadius: '10px', padding: '.6rem 1rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                                    <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800 }}>92%</strong>
                                    <small style={{ fontSize: '.7rem', opacity: .8 }}>Attendance</small>
                                </div>
                                <div className="sh-stat" style={{ background: 'rgba(255,255,255,.15)', borderRadius: '10px', padding: '.6rem 1rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                                    <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800 }}>A</strong>
                                    <small style={{ fontSize: '.7rem', opacity: .8 }}>Current Grade</small>
                                </div>
                                <div className="sh-stat" style={{ background: 'rgba(255,255,255,.15)', borderRadius: '10px', padding: '.6rem 1rem', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
                                    <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 800 }}>Gold</strong>
                                    <small style={{ fontSize: '.7rem', opacity: .8 }}>Reading Badge</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content" style={{ padding: '2rem', flex: 1, maxWidth: '900px', margin: '0 auto', width: '100%' }}>

                    {/* ====== PORTAL DASHBOARD (ATTENDANCE) ====== */}
                    {activeTab === 'dashboard' && (
                        <div className="section-card slide-in" style={{ background: 'var(--white)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                                <i className="fa-solid fa-calendar-check" style={{ color: 'var(--navy)' }}></i> Attendance Summary
                            </h3>

                            <div className="cal-months" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div className="cal-month">
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.5rem', textAlign: 'center' }}>August (94%)</h4>
                                    <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={'h1' + i} className="cal-day-hdr" style={{ fontSize: '.6rem', textAlign: 'center', color: 'var(--muted)', fontWeight: 600, padding: '2px' }}>{d}</div>)}
                                        {generateCalendar(31, 2)}
                                    </div>
                                </div>
                                <div className="cal-month">
                                    <h4 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '.5rem', textAlign: 'center' }}>September (Current)</h4>
                                    <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={'h2' + i} className="cal-day-hdr" style={{ fontSize: '.6rem', textAlign: 'center', color: 'var(--muted)', fontWeight: 600, padding: '2px' }}>{d}</div>)}
                                        {generateCalendar(30, 5).slice(0, 24)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ====== HOMEWORK/ASSIGNMENTS ====== */}
                    {activeTab === 'assignments' && (
                        <div className="section-card slide-in" style={{ background: 'var(--white)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--border)' }}>
                                <i className="fa-solid fa-book-open" style={{ color: 'var(--warning)' }}></i> Active Assignments
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                                {assignments.length > 0 ? assignments.map((a, i) => (
                                    <div key={i} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', borderLeft: '4px solid var(--navy)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                                            <strong style={{ fontSize: '.9rem' }}>{a.title || "Science Project Formulation"}</strong>
                                            <span style={{ fontSize: '.75rem', color: 'var(--danger)', fontWeight: 600 }}><i className="fa-regular fa-clock"></i> Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Next week'}</span>
                                        </div>
                                        <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '.5rem' }}>{a.description || "Research on environmental issues."}</p>
                                    </div>
                                )) : (
                                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', color: 'var(--muted)' }}>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Loading Assignments...
                                    </div>
                                )}
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
