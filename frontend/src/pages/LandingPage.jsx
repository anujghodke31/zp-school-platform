import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    // Re-initialize dummy charts for visual fidelity
    useEffect(() => {
        if (!window.Chart) return;

        // Destroy existing instances if they exist
        let oldActx = window.Chart.getChart("attendanceChart");
        if (oldActx) oldActx.destroy();

        let oldCctx = window.Chart.getChart("competencyChart");
        if (oldCctx) oldCctx.destroy();

        const actx = document.getElementById('attendanceChart');
        if (actx) {
            new window.Chart(actx, {
                type: 'line',
                data: {
                    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    datasets: [{
                        label: 'Average Attendance %',
                        data: [82, 85, 78, 88, 92, 86],
                        borderColor: '#FF9933',
                        backgroundColor: 'rgba(255,153,51,0.1)',
                        tension: 0.4,
                        fill: true
                    }, {
                        label: 'Dropout Risk Index',
                        data: [18, 15, 22, 12, 8, 14],
                        borderColor: '#1A237E',
                        borderDash: [5, 5],
                        fill: false
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        const cctx = document.getElementById('competencyChart');
        if (cctx) {
            new window.Chart(cctx, {
                type: 'bar',
                data: {
                    labels: ['Marathi', 'Math', 'Science', 'English'],
                    datasets: [{
                        label: 'State Benchmark',
                        data: [75, 60, 65, 55],
                        backgroundColor: 'rgba(26,35,126,0.1)',
                        borderColor: '#1A237E',
                        borderWidth: 1
                    }, {
                        label: 'ZP Average Score',
                        data: [82, 58, 70, 48],
                        backgroundColor: '#FF9933'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }, []);

    const [events, setEvents] = React.useState([]);
    const [notices, setNotices] = React.useState([]);

    useEffect(() => {
        // Fetch public data for the landing page
        const fetchPublicData = async () => {
            try {
                // Use absolute URL or relative depending on setup, but typically api utility handles it. We don't have api util imported here.
                // Oh wait, I need to import api or use fetch. Let's use fetch.
                const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api';
                const [eventsRes, noticesRes] = await Promise.all([
                    fetch(`${baseUrl}/data/events/public`).then(r => r.json()),
                    fetch(`${baseUrl}/notices/public`).then(r => r.json())
                ]);
                if (eventsRes.success) setEvents(eventsRes.data);
                if (noticesRes.success) setNotices(noticesRes.data);
            } catch (err) {
                console.error("Error fetching public data:", err);
            }
        };
        fetchPublicData();
    }, []);

    return (
        <div style={{ fontFamily: 'var(--font-base)', color: 'var(--text-main)', background: 'var(--bg-main)' }}>
            {/* STICKY HEADER */}
            <header style={{ 
                position: 'fixed', top: 0, width: '100%', zIndex: 100, 
                background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', 
                borderBottom: '1px solid var(--border)', padding: '15px 0' 
            }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            M
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', color: 'var(--navy)', margin: 0, lineHeight: 1 }}>MahaVidya</h1>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>ZP School Platform</span>
                        </div>
                    </div>
                    <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
                        <a href="#analytics" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500, transition: 'color 0.2s' }}>Analytics</a>
                        <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
                        <Link to="/login" style={{ textDecoration: 'none', color: 'var(--navy)', fontWeight: 600 }}>Log In</Link>
                        <Link to="/register" className="btn btn-saffron" style={{ padding: '8px 20px', borderRadius: '6px', fontSize: '0.9rem' }}>Get Started</Link>
                    </nav>
                </div>
            </header>

            <main style={{ paddingTop: '80px' }}>
                {/* HERO SECTION */}
                <section style={{ 
                    padding: '100px 0', 
                    background: 'linear-gradient(135deg, var(--navy) 0%, #0F172A 100%)', 
                    color: 'white', 
                    position: 'relative', 
                    overflow: 'hidden' 
                }}>
                    <div style={{ 
                        position: 'absolute', top: '-10%', right: '-5%', width: '600px', height: '600px', 
                        background: 'radial-gradient(circle, rgba(255,153,51,0.15) 0%, rgba(255,153,51,0) 70%)', 
                        borderRadius: '50%', zIndex: 1 
                    }}></div>
                    
                    <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '60px' }}>
                        
                        {/* Hero Text */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(255,153,51,0.2)', color: 'var(--saffron)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px', border: '1px solid rgba(255,153,51,0.3)' }}>
                                <i className="fa-solid fa-sparkles"></i> Empowering Rural Education
                            </div>
                            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', color: 'white' }}>
                                Next-Gen School Management for <span style={{ color: 'var(--saffron)' }}>Digital India</span>.
                            </h1>
                            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '540px' }}>
                                A unified, secure ERP platform enabling teachers, parents, and administrators to access academics, track performance, and automate school operations seamlessly.
                            </p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <Link to="/register" className="btn btn-saffron btn-lg" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
                                    Join the Network <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                                <a href="#features" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1.1rem', padding: '14px 32px' }}>
                                    Explore Features
                                </a>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ width: '100%', paddingBottom: '75%', position: 'relative', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', background: 'var(--white)', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.1)' }}>
                                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200" alt="Students learning" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                {/* Overlay gradient */}
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,35,126,0.9), transparent)' }}></div>
                                {/* Floating stats in image */}
                                <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', display: 'flex', gap: '15px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px', flex: 1, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Attendance</div>
                                        <div style={{ color: 'var(--primary)', fontSize: '1.4rem', fontWeight: 800 }}>92.4% <i className="fa-solid fa-arrow-trend-up" style={{ color: 'var(--success)', fontSize: '1rem' }}></i></div>
                                    </div>
                                    <div style={{ background: 'var(--saffron)', color: 'white', padding: '15px', borderRadius: '12px', flex: 1, boxShadow: '0 10px 20px rgba(255,153,51,0.3)' }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.9 }}>AI Assistant</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>Active <i className="fa-solid fa-robot"></i></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* STATS BANNER */}
                <section style={{ background: 'var(--saffron)', padding: '40px 0', color: 'white' }}>
                    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'white' }}>60,000+</h2>
                            <p style={{ margin: 0, fontWeight: 500, opacity: 0.9 }}>Schools Connected</p>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'white' }}>18 Lakh+</h2>
                            <p style={{ margin: 0, fontWeight: 500, opacity: 0.9 }}>Active Students</p>
                        </div>
                        <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, color: 'white' }}>34</h2>
                            <p style={{ margin: 0, fontWeight: 500, opacity: 0.9 }}>Districts Covered</p>
                        </div>
                    </div>
                </section>

                {/* NEWS & EVENTS SECTION */}
                <section style={{ padding: '80px 0', background: 'white' }}>
                    <div className="container">
                        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                            {/* Announcements & News */}
                            <div style={{ flex: '1 1 500px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '15px', marginBottom: '25px' }}>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)', margin: 0 }}>
                                        <i className="fa-solid fa-bullhorn" style={{ color: 'var(--saffron)', marginRight: '10px' }}></i>
                                        News & Announcements
                                    </h2>
                                    <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View All <i className="fa-solid fa-arrow-right"></i></Link>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {notices.length > 0 ? notices.map(notice => (
                                        <div key={notice.id} style={{ padding: '20px', background: 'var(--bg-main)', borderRadius: '12px', borderLeft: '4px solid var(--primary)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                             onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                             onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 600 }}>
                                                {new Date(notice.createdAt?._seconds ? notice.createdAt._seconds * 1000 : new Date()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px', color: 'var(--navy)' }}>{notice.title}</h3>
                                            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0 }}>{notice.message}</p>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                            No recent announcements.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Events */}
                            <div style={{ flex: '1 1 400px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--border)', paddingBottom: '15px', marginBottom: '25px' }}>
                                    <h2 style={{ fontSize: '1.8rem', color: 'var(--navy)', margin: 0 }}>
                                        <i className="fa-solid fa-calendar-star" style={{ color: 'var(--success)', marginRight: '10px' }}></i>
                                        Upcoming Events
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {events.length > 0 ? events.map((ev, i) => {
                                        const dateObj = new Date(ev.date);
                                        return (
                                            <div key={ev.id || i} style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '15px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <div style={{ background: 'var(--navy)', color: 'white', padding: '10px 15px', borderRadius: '10px', textAlign: 'center', minWidth: '70px' }}>
                                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px', opacity: 0.9 }}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1 }}>{dateObj.getDate()}</div>
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 5px', color: 'var(--navy)' }}>{ev.title}</h4>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{ev.description || 'School-wide Event'}</p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                                            No upcoming events scheduled.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" style={{ padding: '100px 0', background: 'var(--bg-main)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <span style={{ color: 'var(--saffron)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Platform Capabilities</span>
                            <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>Comprehensive ERP Features</h2>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '15px auto 0', fontSize: '1.1rem' }}>Everything required to manage a modern school, tailored completely for the workflow of Zilla Parishad institutions.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                            {/* Feature 1 */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(26,35,126,0.1)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                                    <i className="fa-solid fa-users-chalkboard"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Academic Management</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>Easily structure classes, sections, subjects, and assign teachers to maintain an organized foundation.</p>
                            </div>

                            {/* Feature 2 */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,153,51,0.1)', color: 'var(--saffron)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                                    <i className="fa-solid fa-laptop-file"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Learning Management</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>Upload resources, assign homework, and conduct digital assessments securely from anywhere.</p>
                            </div>

                            {/* Feature 3 */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(46,125,50,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                                    <i className="fa-solid fa-chart-line"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Real-time Analytics</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>Track student records, predict dropout risks, and monitor holistic district performance visually.</p>
                            </div>

                            {/* Feature 4 */}
                            <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', transition: 'transform 0.3s, box-shadow 0.3s' }}
                                 onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                                 onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                            >
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(0,188,212,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '20px' }}>
                                    <i className="fa-solid fa-comments"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Parent Communication</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>Bridge the gap between schools and parents via direct notices, SMS alerts, and dedicated portals.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ANALYTICS SECTION */}
                <section id="analytics" style={{ padding: '80px 0', background: 'white', borderTop: '1px solid var(--border)' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                            <span style={{ color: 'var(--navy)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Live Insights</span>
                            <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>Data-Driven Decisions</h2>
                            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '15px auto 0', fontSize: '1.1rem' }}>Visualize key metrics to identify trends, reward performance, and intervene early.</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 45%', background: 'var(--bg-main)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Attendance & Dropout Risk</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>6-month district attendance vs. predicted indicators.</p>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <canvas id="attendanceChart"></canvas>
                                </div>
                            </div>
                            <div style={{ flex: '1 1 45%', background: 'var(--bg-main)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Learning Competency Tracking</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Class-wise mastery percentages vs. state benchmarks.</p>
                                <div style={{ height: '300px', width: '100%' }}>
                                    <canvas id="competencyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section style={{ padding: '80px 0', background: 'var(--navy)', color: 'white', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '20px' }}>Ready to Transform Your School?</h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 40px' }}>Join thousands of educators and administrators improving the quality of rural education today.</p>
                        <Link to="/register" className="btn btn-saffron btn-lg" style={{ fontSize: '1.2rem', padding: '16px 40px' }}>
                            Get Started Now
                        </Link>
                    </div>
                </section>
            </main>

            {/* FOOTER */}
            <footer style={{ background: '#0F172A', color: 'rgba(255,255,255,0.6)', padding: '40px 0 20px', borderTop: '4px solid var(--saffron)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ width: '30px', height: '30px', background: 'var(--saffron)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>M</div>
                                <h3 style={{ fontSize: '1.2rem', color: 'white', margin: 0 }}>MahaVidya</h3>
                            </div>
                            <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Empowering Zilla Parishad Schools across Maharashtra with world-class digital tools and analytics.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</a>
                            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</a>
                            <a href="#" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}>Contact Support</a>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                        &copy; {new Date().getFullYear()} MahaVidya ZP School Platform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
