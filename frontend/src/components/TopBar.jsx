import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, Command } from 'lucide-react';

const TopBar = ({ title }) => {
    const { user } = useContext(AuthContext);

    return (
        <header className="top-bar">
            <div className="search-bar" onClick={() => {/* Trigger Cmd+K context potentially */ }} style={{ cursor: 'pointer' }}>
                <Search size={16} />
                <span>Search students, classes, or help...</span>
                <div className="keyboard-shortcut">
                    <Command size={12} style={{ marginRight: '2px' }} /> K
                </div>
            </div>

            <div className="top-bar-actions">
                <button className="action-btn icon-btn" title="Translate (Coming Soon)">A/अ</button>
                <button className="action-btn icon-btn">
                    <Bell size={18} />
                    <span className="notification-dot" style={{ display: 'none' }}></span>
                </button>
                <div className="date-display">
                    <i className="fa-regular fa-calendar"></i>
                    {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
