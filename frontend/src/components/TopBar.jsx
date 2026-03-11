import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopBar = ({ title, subtitle, showSearch }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="topbar">
            <div className="topbar-title">
                <h3>{title}</h3>
                {subtitle && <p>{subtitle}</p>}
            </div>

            {showSearch && (
                <div className="search-wrap" style={{ width: '300px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--muted)' }}></i>
                    <input type="text" placeholder="Search student by name or roll..." />
                </div>
            )}

            <div className="topbar-right">
                <button className="btn btn-outline btn-sm" title="Open Command Bar (Cmd+K)" onClick={() => {
                    const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                    document.dispatchEvent(evt);
                }}>
                    <i className="fa-solid fa-magnifying-glass"></i> <kbd style={{ fontFamily: 'inherit', fontWeight: 'bold' }}>⌘K</kbd>
                </button>
                <span className="date-badge">
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
                    <i className="fa-solid fa-arrow-left"></i> Home
                </button>
            </div>
        </div>
    );
};

export default TopBar;
