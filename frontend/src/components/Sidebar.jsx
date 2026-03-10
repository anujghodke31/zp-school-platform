import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Users, Search, GraduationCap, Calendar, Bell, LineChart, MessageSquare } from 'lucide-react';

const Sidebar = ({ role }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        if (role === 'Admin' || role === 'SuperAdmin') {
            return [
                { path: '/admin', icon: <Home size={18} />, label: 'Overview' },
                { path: '/admin/students', icon: <GraduationCap size={18} />, label: 'Students' },
                { path: '/admin/teachers', icon: <Users size={18} />, label: 'Teachers' },
                { path: '/admin/events', icon: <Calendar size={18} />, label: 'Events' },
                { path: '/admin/notices', icon: <Bell size={18} />, label: 'Notices' },
                { path: '/admin/analytics', icon: <LineChart size={18} />, label: 'Analytics' }
            ];
        } else if (role === 'Teacher') {
            return [
                { path: '/teacher', icon: <Home size={18} />, label: 'My Classes' },
                { path: '/teacher/elearning', icon: <Search size={18} />, label: 'E-Learning' },
                { path: '/teacher/assignments', icon: <MessageSquare size={18} />, label: 'Assignments' },
                { path: '/teacher/messaging', icon: <Bell size={18} />, label: 'Messaging' }
            ];
        } else if (role === 'Parent') {
            return [
                { path: '/parent', icon: <Home size={18} />, label: 'Child Progress' },
                { path: '/parent/assignments', icon: <MessageSquare size={18} />, label: 'Homework' }
            ];
        }
        return [];
    };

    return (
        <nav className="sidebar">
            <div className="brand">
                <div className="logo-icon">🎓</div>
                <div className="brand-text">
                    <h2>MahaVidya ZP</h2>
                    <span className="badge">{role} Portal</span>
                </div>
            </div>

            <div className="nav-links">
                {getNavItems().map(item => (
                    <NavLink
                        to={item.path}
                        end={item.path === '/admin' || item.path === '/teacher' || item.path === '/parent'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        key={item.label}
                    >
                        {item.icon} {item.label}
                    </NavLink>
                ))}
            </div>

            <div className="user-profile">
                <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
                <div className="user-info">
                    <h4>{user?.name || 'User'}</h4>
                    <span>{user?.role || role}</span>
                </div>
                <button onClick={handleLogout} className="action-btn icon-btn" title="Logout" style={{ background: 'none' }}>
                    <LogOut size={16} />
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
