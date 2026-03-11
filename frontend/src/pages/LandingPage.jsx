import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    // Re-initialize slider logic on mount
    useEffect(() => {
        const slidesWrapper = document.getElementById('hero-slides-wrapper');
        const dots = document.querySelectorAll('.slide-dot');
        let currentSlide = 0;

        const updateSlide = (index) => {
            currentSlide = index;
            slidesWrapper.style.transform = `translateX(-${currentSlide * 50}%)`;
            dots.forEach(d => d.classList.remove('active'));
            dots[currentSlide].classList.add('active');
        };

        const handleNext = () => updateSlide((currentSlide + 1) % 2);
        const handlePrev = () => updateSlide((currentSlide - 1 + 2) % 2);

        document.getElementById('slide-next')?.addEventListener('click', handleNext);
        document.getElementById('slide-prev')?.addEventListener('click', handlePrev);

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                updateSlide(parseInt(e.target.dataset.slide));
            });
        });

        const autoSlide = setInterval(handleNext, 8000);
        return () => {
            clearInterval(autoSlide);
            document.getElementById('slide-next')?.removeEventListener('click', handleNext);
            document.getElementById('slide-prev')?.removeEventListener('click', handlePrev);
        };
    }, []);

    // Re-initialize dummy charts for visual fidelity
    useEffect(() => {
        if (!window.Chart) return;

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

    return (
        <main id="main-content" tabIndex="-1">
            {/* HERO SLIDER */}
            <section id="home" className="hero-slider-section" aria-label="Hero section">
                <div className="hero-slides-wrapper" id="hero-slides-wrapper">
                    {/* SLIDE 1: Real ZP School Photo */}
                    <div className="hero-slide slide-photo" aria-label="Real ZP School slide">
                        <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200"
                            alt="ZP school students" className="slide-bg-img" />
                        <div className="slide-overlay"></div>
                        <div className="container slide-content">
                            <div className="slide-text-block animate-slide-in">
                                <span className="badge badge-saffron mb-md lang-en"><i className="fa-solid fa-location-dot"></i> Zilla Parishad School, Rural Maharashtra</span>
                                <h2 className="slide-heading lang-en">Students Presenting Their Science Innovations</h2>
                                <p className="slide-desc lang-en">Our students are building the future. MahaVidya empowers every ZP school with digital tools to make this happen — at scale, across Maharashtra.</p>
                                <div className="slide-ctas flex gap-md mt-lg">
                                    <button className="btn btn-saffron btn-lg lang-en" onClick={() => navigate('/login')}>
                                        Enter Portal <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                                <div className="slide-stats mt-lg flex gap-lg">
                                    <div className="stat-pill"><strong>60,000+</strong><span className="lang-en">Schools</span></div>
                                    <div className="stat-pill"><strong>18 Lakh+</strong><span className="lang-en">Students</span></div>
                                    <div className="stat-pill"><strong>34</strong><span className="lang-en">Districts</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLIDE 2: AI Teacher Dashboard */}
                    <div className="hero-slide slide-ai" aria-label="AI Teacher Assistant slide">
                        <div className="slide-bg-gradient"></div>
                        <div className="container slide-content hero-grid">
                            <div className="slide-text-block animate-slide-in">
                                <span className="badge badge-primary mb-md lang-en">AI-Powered • Digital India</span>
                                <h2 className="slide-heading-dark lang-en">Next-Generation School Management Built for Rural Connectivity</h2>
                                <p className="slide-desc-dark lang-en">A unified, secure platform enabling teachers, parents, and administrators to access academics, track performance, and automate lesson planning.</p>
                                <div className="slide-ctas flex gap-md mt-lg">
                                    <button className="btn btn-primary btn-lg lang-en" onClick={() => navigate('/login')}>
                                        Explore Platform <i className="fa-solid fa-rocket"></i>
                                    </button>
                                </div>
                            </div>

                            {/* AI Widget Box (Visual Only) */}
                            <div className="hero-visual">
                                <div className="saas-floating-card shadow-lg bg-white rounded-lg p-lg relative">
                                    <div className="decor-circle bg-blue-100"></div>
                                    <div className="decor-circle bg-orange-100 bottom-right"></div>
                                    <div className="flex-between mb-lg border-bottom pb-sm">
                                        <div className="flex align-center gap-sm">
                                            <div className="icon-box bg-blue text-white"><i className="fa-solid fa-robot"></i></div>
                                            <div>
                                                <h3 className="text-sm font-bold lang-en">AI Teacher Assistant</h3>
                                                <span className="text-xs text-muted">Online</span>
                                            </div>
                                        </div>
                                        <span className="badge-sm badge-primary"><i className="fa-solid fa-bolt"></i> Ready</span>
                                    </div>
                                    <div>
                                        <div className="mock-chat-bubble user rounded mb-sm p-sm text-sm">
                                            <strong>Teacher:</strong> Generate a lesson plan for Science, Class 6 (Photosynthesis).
                                        </div>
                                        <div className="mock-chat-bubble active rounded mb-sm p-sm text-sm">
                                            <i className="fa-solid fa-wand-magic-sparkles text-accent"></i> <strong>Generating Plan:</strong> Lesson outline created successfully.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="slider-controls">
                    <button className="slide-dot active" data-slide="0"></button>
                    <button className="slide-dot" data-slide="1"></button>
                </div>
                <button className="slide-arrow slide-prev" id="slide-prev"><i className="fa-solid fa-chevron-left"></i></button>
                <button className="slide-arrow slide-next" id="slide-next"><i className="fa-solid fa-chevron-right"></i></button>
            </section>

            {/* ANALYTICS SECTION */}
            <section id="analytics" className="py-xl">
                <div className="container">
                    <div className="text-center mb-xl">
                        <span className="badge badge-navy mb-md lang-en">Live Data</span>
                        <h2 className="section-title lang-en">Student Progress Analytics</h2>
                        <p className="section-desc text-muted mx-auto lang-en">Visualize real-time attendance trends and subject competency gaps across districts.</p>
                    </div>
                    <div className="analytics-grid">
                        <div className="saas-card p-lg border-hover">
                            <div className="card-title mb-xs">
                                <span>Attendance & Dropout Risk</span>
                            </div>
                            <p className="text-sm text-muted mb-md">6-month district attendance vs. predicted dropout indicators.</p>
                            <div className="chart-container-wrapper">
                                <div className="chart-container loaded">
                                    <canvas id="attendanceChart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div className="saas-card p-lg border-hover">
                            <div className="card-title mb-xs">
                                <span>Learning Competency Tracking</span>
                            </div>
                            <p className="text-sm text-muted mb-md">Class-wise mastery percentages vs. state benchmarks.</p>
                            <div className="chart-container-wrapper">
                                <div className="chart-container loaded">
                                    <canvas id="competencyChart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default LandingPage;
