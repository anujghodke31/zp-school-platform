import React, { useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ role }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = role === 'Admin' || role === 'SuperAdmin';
    const isTeacher = role === 'Teacher';
    const isParent = role === 'Parent';
    const isStudent = role === 'Student';

    let portalName = 'ZP Portal';
    if (isAdmin) portalName = 'ZP Admin Panel';
    if (isTeacher) portalName = 'ZP Teacher Portal';
    if (isParent) portalName = 'ZP Parent Portal';
    if (isStudent) portalName = 'ZP Student Portal';

    return (
        <aside className="sidebar">
            <div className="sb-brand">
                <img src="/mh-gov-emblem.png"
                    alt="Emblem" />
                <div>
                    <h2>MahaVidya</h2>
                    <small>{portalName}</small>
                </div>
            </div>

            <nav className="sb-nav">
                {isAdmin && (
                    <>
                        <div className="sb-section">Overview</div>
                        <NavLink to="/admin" end className={() => `sb-item ${location.pathname === '/admin' && !location.search ? 'active' : ''}`}>
                            <i className="fa-solid fa-gauge-high"></i> Dashboard
                        </NavLink>
                        <NavLink to="/admin?tab=students" className={() => `sb-item ${location.search === '?tab=students' ? 'active' : ''}`}>
                            <i className="fa-solid fa-users"></i> Students
                        </NavLink>
                        <NavLink to="/admin?tab=teachers" className={() => `sb-item ${location.search === '?tab=teachers' ? 'active' : ''}`}>
                            <i className="fa-solid fa-chalkboard-user"></i> Teachers
                        </NavLink>

                        <div className="sb-section">Academic</div>
                        <NavLink to="/admin?tab=timetable" className={() => `sb-item ${location.search === '?tab=timetable' ? 'active' : ''}`}>
                            <i className="fa-solid fa-clock"></i> Timetable
                        </NavLink>
                        <NavLink to="/admin?tab=classes" className={() => `sb-item ${location.search === '?tab=classes' ? 'active' : ''}`}>
                            <i className="fa-solid fa-chalkboard"></i> Classes
                        </NavLink>
                        <NavLink to="/admin?tab=subjects" className={() => `sb-item ${location.search === '?tab=subjects' ? 'active' : ''}`}>
                            <i className="fa-solid fa-book"></i> Subjects
                        </NavLink>
                        <NavLink to="/admin?tab=events" className={() => `sb-item ${location.search === '?tab=events' ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-star"></i> Events & Holidays
                        </NavLink>
                        <NavLink to="/admin?tab=results" className={() => `sb-item ${location.search === '?tab=results' ? 'active' : ''}`}>
                            <i className="fa-solid fa-file-certificate"></i> Results & Reports
                        </NavLink>

                        <div className="sb-section">Communication</div>
                        <NavLink to="/admin?tab=announcements" className={() => `sb-item ${location.search === '?tab=announcements' ? 'active' : ''}`}>
                            <i className="fa-solid fa-bullhorn"></i> Announcements
                        </NavLink>

                        <div className="sb-section">Operations</div>
                        <NavLink to="/admin?tab=mdm" className={() => `sb-item ${location.search === '?tab=mdm' ? 'active' : ''}`}>
                            <i className="fa-solid fa-utensils"></i> Mid-Day Meal
                        </NavLink>
                        <NavLink to="/admin?tab=fees" className={() => `sb-item ${location.search === '?tab=fees' ? 'active' : ''}`}>
                            <i className="fa-solid fa-money-bill-wave"></i> Fee Management
                        </NavLink>
                        <NavLink to="/admin?tab=scholarships" className={() => `sb-item ${location.search === '?tab=scholarships' ? 'active' : ''}`}>
                            <i className="fa-solid fa-award"></i> Scholarships
                        </NavLink>
                        <NavLink to="/admin?tab=exams" className={() => `sb-item ${location.search === '?tab=exams' ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-check"></i> Exam Planner
                        </NavLink>
                        <NavLink to="/admin?tab=events" className={() => `sb-item ${location.search === '?tab=events' ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-star"></i> Events & Holidays
                        </NavLink>
                        <NavLink to="/admin?tab=leave" className={() => `sb-item ${location.search === '?tab=leave' ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-xmark"></i> Leave Requests
                        </NavLink>

                        <div className="sb-section">System</div>
                        <NavLink to="/admin?tab=analytics" className={() => `sb-item ${location.search === '?tab=analytics' ? 'active' : ''}`}>
                            <i className="fa-solid fa-chart-line" /> Analytics
                        </NavLink>
                        <NavLink to="/admin?tab=udise" className={() => `sb-item ${location.search === '?tab=udise' ? 'active' : ''}`}>
                            <i className="fa-solid fa-file-export"></i> UDISE Export
                        </NavLink>
                        <NavLink to="/blueprint" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-map" /> System Blueprint
                        </NavLink>
                    </>
                )}
                {isTeacher && (
                    <>
                        <div className="sb-section">Overview</div>
                        <NavLink to="/teacher" end className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-clipboard-user"></i> Attendance
                        </NavLink>
                        <NavLink to="/teacher?tab=elearning" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-laptop-file"></i> E-Learning
                        </NavLink>
                        <NavLink to="/teacher?tab=messages" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-message"></i> Messaging
                        </NavLink>
                        <NavLink to="/teacher?tab=leave" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-xmark"></i> Leave Request
                        </NavLink>
                        <NavLink to="/teacher?tab=exams" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-check"></i> Exam Schedule
                        </NavLink>
                    </>
                )}
                {isParent && (
                    <>
                        <div className="sb-section">Portal</div>
                        <NavLink to="/parent" end className={({ isActive }) => `sb-item ${location.pathname === '/parent' && !location.search ? 'active' : ''}`}>
                            <i className="fa-solid fa-home" /> Dashboard
                        </NavLink>
                        <NavLink to="/parent?tab=assignments" className={() => `sb-item ${location.search === '?tab=assignments' ? 'active' : ''}`}>
                            <i className="fa-solid fa-book-open" /> Assignments
                        </NavLink>
                        <NavLink to="/parent?tab=fees" className={() => `sb-item ${location.search === '?tab=fees' ? 'active' : ''}`}>
                            <i className="fa-solid fa-money-bill-wave" /> Fee Status
                        </NavLink>
                        <NavLink to="/parent?tab=scholarships" className={() => `sb-item ${location.search === '?tab=scholarships' ? 'active' : ''}`}>
                            <i className="fa-solid fa-award" /> Scholarships
                        </NavLink>
                        <NavLink to="/elearning" className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}>
                            <i className="fa-solid fa-laptop-file" /> E-Learning
                        </NavLink>
                    </>
                )}
                {isStudent && (
                    <>
                        <div className="sb-section">My Portal</div>
                        <NavLink to="/student" end className={({ isActive }) => `sb-item ${location.pathname === '/student' && !location.search ? 'active' : ''}`}>
                            <i className="fa-solid fa-gauge-high" /> Overview
                        </NavLink>
                        <NavLink to="/student?tab=assignments" className={() => `sb-item ${location.search === '?tab=assignments' ? 'active' : ''}`}>
                            <i className="fa-solid fa-book-open" /> Assignments
                        </NavLink>
                        <NavLink to="/student?tab=attendance" className={() => `sb-item ${location.search === '?tab=attendance' ? 'active' : ''}`}>
                            <i className="fa-solid fa-calendar-check" /> Attendance
                        </NavLink>
                        <NavLink to="/student?tab=library" className={() => `sb-item ${location.search === '?tab=library' ? 'active' : ''}`}>
                            <i className="fa-solid fa-book-bookmark" /> Library Books
                        </NavLink>
                        <NavLink to="/student?tab=report-card" className={() => `sb-item ${location.search === '?tab=report-card' ? 'active' : ''}`}>
                            <i className="fa-solid fa-file-certificate" /> Report Card
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sb-footer">
                <div className="sb-user">
                    <div className="sb-avatar">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div style={{ fontSize: '.85rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
                        <div style={{ fontSize: '.7rem', opacity: .6 }}>{user?.role || role}</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ marginTop: '.75rem', width: '100%', background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', padding: '.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '.75rem' }}>Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;
