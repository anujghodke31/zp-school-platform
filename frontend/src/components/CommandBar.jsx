import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CommandBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Mock search results
    const allResults = [
        { id: 1, type: 'dashboard', title: 'Admin Dashboard', sub: 'Overview & Analytics', path: '/admin', icon: 'fa-gauge-high' },
        { id: 2, type: 'dashboard', title: 'Teacher Portal', sub: 'Attendance & E-Learning', path: '/teacher', icon: 'fa-chalkboard-user' },
        { id: 3, type: 'dashboard', title: 'Parent Portal', sub: 'Student Performance', path: '/parent', icon: 'fa-home' },
        { id: 4, type: 'tool', title: 'E-Learning', sub: 'Access Digital Content', path: '/elearning', icon: 'fa-tablet-screen-button' },
        { id: 5, type: 'action', title: 'Logout', sub: 'Sign out securely', path: '/login', icon: 'fa-arrow-right-from-bracket' },
    ];

    const results = query
        ? allResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.sub.toLowerCase().includes(query.toLowerCase()))
        : allResults;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
            if (isOpen && results.length > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev + 1) % results.length);
                }
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIndex(prev => (prev - 1 + results.length) % results.length);
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    executeAction(results[activeIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, activeIndex]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setActiveIndex(0);
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const executeAction = (item) => {
        if (!item) return;
        setIsOpen(false);
        navigate(item.path);
    };

    if (!isOpen) return null;

    return (
        <div className="cmd-overlay open">
            <div className="cmd-modal">
                <div className="cmd-search-box">
                    <i className="fa-solid fa-magnifying-glass cmd-icon"></i>
                    <input
                        ref={inputRef}
                        type="text"
                        className="cmd-input"
                        placeholder="Search schools, teachers, portals... (e.g. 'teacher')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="cmd-esc">ESC</kbd>
                </div>
                <div className="cmd-results">
                    {results.length > 0 ? (
                        results.map((item, idx) => (
                            <div
                                key={item.id}
                                className={`cmd-result-item ${idx === activeIndex ? 'active' : ''}`}
                                onClick={() => executeAction(item)}
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                <div className="cmd-result-icon">
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <div>
                                    <div className="cmd-result-text">{item.title}</div>
                                    <div className="cmd-result-sub">{item.sub}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.9rem' }}>
                            No results found for "{query}"
                        </div>
                    )}
                </div>
                <div className="cmd-footer">
                    <span><kbd>↑↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> select</span>
                    <span><kbd>ESC</kbd> close</span>
                </div>
            </div>

            <style>{`
                .cmd-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, .5); z-index: 9999; display: flex; align-items: flex-start; justify-content: center; padding-top: 10vh; backdrop-filter: blur(4px); }
                .cmd-modal { background: #fff; width: 100%; max-width: 600px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0, 0, 0, .3); overflow: hidden; animation: cmdPop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                @keyframes cmdPop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                .cmd-search-box { display: flex; align-items: center; padding: 1.25rem; border-bottom: 1px solid var(--border); }
                .cmd-icon { color: var(--navy); font-size: 1.1rem; width: 30px; }
                .cmd-input { flex: 1; border: none; outline: none; padding: 0 1rem; font-size: 1.1rem; color: var(--navy); background: transparent; }
                .cmd-input::placeholder { color: #CBD5E1; }
                .cmd-esc { font-size: .7rem; background: var(--bg); padding: .2rem .4rem; border-radius: 4px; border: 1px solid var(--border); color: var(--muted); }
                .cmd-results { max-height: 400px; overflow-y: auto; padding: .5rem 0; }
                .cmd-result-item { display: flex; align-items: center; gap: 1rem; padding: .75rem 1.25rem; cursor: pointer; transition: all .1s; }
                .cmd-result-item:hover, .cmd-result-item.active { background: #F8FAFC; border-left: 3px solid var(--saffron); padding-left: calc(1.25rem - 3px); }
                .cmd-result-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid var(--border); border-radius: 8px; color: var(--navy); }
                .cmd-result-item.active .cmd-result-icon { background: var(--navy); color: #fff; border-color: var(--navy); }
                .cmd-result-text { font-size: .95rem; font-weight: 600; color: var(--navy); }
                .cmd-result-sub { font-size: .8rem; color: var(--muted); }
                .cmd-footer { padding: .75rem 1.25rem; background: #F8FAFC; border-top: 1px solid var(--border); display: flex; gap: 1.5rem; justify-content: center; font-size: .75rem; color: var(--muted); }
                .cmd-footer span { display: flex; align-items: center; gap: .4rem; }
                .cmd-footer kbd { background: #fff; border: 1px solid var(--border); border-radius: 4px; padding: .1rem .3rem; font-family: monospace; font-weight: 600; box-shadow: 0 2px 0 var(--border); }
            `}</style>
        </div>
    );
};

export default CommandBar;
