import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

const FALLBACK_MATERIALS = [
    { id: 1, subject: "Mathematics", subject_mr: "गणित", type: "video", title: "Fractions & Decimals", title_mr: "अपूर्णांक आणि दशांश", desc: "Chapter 3 — Visual explanation with real-life examples", duration: "18 min", source: "Diksha Platform", class: "7A", color: "#1565C0", bg: "#E3F2FD", icon: "fa-calculator" },
    { id: 4, subject: "Science", subject_mr: "विज्ञान", type: "video", title: "Photosynthesis Explained", title_mr: "प्रकाशसंश्लेषण", desc: "Chapter 6 — Plant food making process with diagrams", duration: "12 min", source: "Diksha Platform", class: "7A", color: "#2E7D32", bg: "#E8F5E9", icon: "fa-flask" },
];

const ELearning = () => {
    const navigate = useNavigate();
    const [activeSubject, setActiveSubject] = useState('all');
    const [activeType, setActiveType] = useState('all');

    // For now use mock data as the backend elearning route isn't fully scaffolded yet
    const materials = FALLBACK_MATERIALS;

    const filteredMaterials = materials.filter(m => {
        const matchSubject = activeSubject === 'all' || m.subject === activeSubject;
        const matchType = activeType === 'all' || m.type === activeType;
        return matchSubject && matchType;
    });

    const typeBadgeData = {
        video: ['▶ Video', '#1565C0', '#E3F2FD'],
        pdf: ['📄 PDF', '#C62828', '#FFEBEE'],
        quiz: ['🧠 Quiz', '#2E7D32', '#E8F5E9']
    };

    return (
        <div className="app-container" style={{ background: 'var(--bg)', minHeight: '100vh', display: 'block' }}>

            {/* ====== HEADER ====== */}
            <div className="header" style={{ background: 'linear-gradient(135deg, #1A237E, #1565C0 60%, #283593)', color: '#fff', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
                <div className="header-logo" style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                    <div className="header-brand">
                        <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>MahaVidya E-Learning</h2>
                        <p style={{ fontSize: '.73rem', opacity: .75, marginTop: '.1rem' }}>ZP School Network — Maharashtra</p>
                    </div>
                </div>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                    <button onClick={() => navigate(-1)} className="back-btn" style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600 }}>
                        <i className="fa-solid fa-arrow-left"></i> Dashboard
                    </button>
                </div>
            </div>

            {/* ====== HERO ====== */}
            <div className="hero" style={{ background: 'linear-gradient(135deg, #0D47A1, #1565C0 50%, #1976D2)', color: '#fff', padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', color: '#fff', padding: '5px 14px', borderRadius: '20px', fontSize: '.78rem', fontWeight: 700, marginBottom: '1rem' }}>
                    <i className="fa-solid fa-graduation-cap"></i> NEP 2020 Aligned
                </div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '.5rem' }}>Digital Learning Portal</h1>
                <p style={{ fontSize: '1.05rem', opacity: .85, maxWidth: '560px', margin: '0 auto 1.5rem' }}>Access SCERT textbooks, Diksha video lessons & interactive quizzes — all in one place.</p>
                <div className="hero-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="hs" style={{ background: 'rgba(255,255,255,.12)', borderRadius: '12px', padding: '.6rem 1.2rem', backdropFilter: 'blur(4px)' }}>
                        <strong style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800 }}>12+</strong>
                        <span style={{ fontSize: '.72rem', opacity: .8 }}>Resources</span>
                    </div>
                    <div className="hs" style={{ background: 'rgba(255,255,255,.12)', borderRadius: '12px', padding: '.6rem 1.2rem', backdropFilter: 'blur(4px)' }}>
                        <strong style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800 }}>5</strong>
                        <span style={{ fontSize: '.72rem', opacity: .8 }}>Subjects</span>
                    </div>
                    <div className="hs" style={{ background: 'rgba(255,255,255,.12)', borderRadius: '12px', padding: '.6rem 1.2rem', backdropFilter: 'blur(4px)' }}>
                        <strong style={{ display: 'block', fontSize: '1.3rem', fontWeight: 800 }}>Free</strong>
                        <span style={{ fontSize: '.72rem', opacity: .8 }}>Access</span>
                    </div>
                </div>
            </div>

            {/* ====== MAIN CONTENT ====== */}
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* FILTER BAR */}
                <div className="filter-bar" style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted)' }}>Subject:</span>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                        {['all', 'Mathematics', 'Science', 'English', 'Marathi', 'History'].map(sub => (
                            <button
                                key={sub}
                                className={`filter-btn ${activeSubject === sub ? 'active' : ''}`}
                                onClick={() => setActiveSubject(sub)}
                                style={{ padding: '.45rem 1.1rem', borderRadius: '20px', border: '1.5px solid var(--border)', background: activeSubject === sub ? 'var(--navy)' : '#fff', color: activeSubject === sub ? '#fff' : 'var(--text)', fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                            >
                                {sub === 'all' ? 'All' : sub}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '.4rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        {['all', 'video', 'pdf', 'quiz'].map(type => (
                            <button
                                key={type}
                                className={`type-btn ${activeType === type ? 'active' : ''}`}
                                onClick={() => setActiveType(type)}
                                style={{ padding: '.4rem .9rem', borderRadius: '20px', border: '1.5px solid var(--border)', background: activeType === type ? 'var(--saffron)' : '#fff', color: activeType === type ? '#fff' : 'var(--muted)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                            >
                                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MATERIALS GRID */}
                <div className="materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {filteredMaterials.length > 0 ? filteredMaterials.map(m => {
                        const [badgeLabel, badgeColor, badgeBg] = typeBadgeData[m.type] || ['📄', '#1A237E', '#E8EAF6'];
                        return (
                            <div key={m.id} className="mat-card" style={{ background: '#fff', borderRadius: '18px', border: '1.5px solid var(--border)', overflow: 'hidden', transition: 'all .3s', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                                <div className="mat-header" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '.9rem', background: m.bg }}>
                                    <div className="mat-icon" style={{ width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0, background: `${m.color}20`, color: m.color }}>
                                        <i className={`fa-solid ${m.icon}`}></i>
                                    </div>
                                    <div className="mat-meta" style={{ flex: 1 }}>
                                        <div className="mat-subject" style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: m.color }}>{m.subject}</div>
                                        <div className="mat-title" style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', marginTop: '.15rem', lineHeight: 1.3 }}>{m.title}</div>
                                    </div>
                                </div>
                                <div className="mat-body" style={{ padding: '0 1.25rem 1.25rem' }}>
                                    <div className="mat-desc" style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '.875rem', lineHeight: 1.5, marginTop: '1.25rem' }}>{m.desc}</div>
                                    <div className="mat-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                                        <span className="type-badge" style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: badgeBg, color: badgeColor }}>{badgeLabel}</span>
                                        {m.duration && <span className="mat-duration" style={{ fontSize: '.75rem', color: 'var(--muted)' }}><i className="fa-regular fa-clock"></i> {m.duration}</span>}
                                    </div>
                                    <div className="mat-source" style={{ fontSize: '.72rem', color: 'var(--muted)', marginBottom: '.875rem' }}><i className="fa-solid fa-building-columns"></i> {m.source}</div>
                                    <button className="mat-btn" style={{ width: '100%', border: 'none', borderRadius: '10px', padding: '.6rem', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', color: '#fff', transition: 'all .2s', background: m.color }}>
                                        {m.type === 'video' ? '▶ Watch Video' : m.type === 'pdf' ? '📄 Download PDF' : '🧠 Take Quiz'}
                                    </button>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '18px', border: '1px solid var(--border)' }}>
                            <i className="fa-solid fa-book-open" style={{ fontSize: '3rem', color: 'var(--muted)', marginBottom: '.875rem' }}></i>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.4rem' }}>No resources found</h3>
                            <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Try a different subject or type filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ELearning;
