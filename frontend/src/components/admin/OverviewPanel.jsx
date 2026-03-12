import React from 'react';

const OverviewPanel = ({ stats }) => {
    const cards = [
        { icon: 'fa-users', label: 'Total Students', value: stats.total_students ?? '—', bg: 'var(--navy-light)', color: 'var(--navy)' },
        { icon: 'fa-percent', label: 'Avg Attendance', value: stats.avg_attendance != null ? `${stats.avg_attendance}%` : '—', bg: '#E8F5E9', color: 'var(--success)' },
        { icon: 'fa-triangle-exclamation', label: 'At-Risk Students', value: stats.at_risk_count ?? '—', bg: '#FFEBEE', color: 'var(--danger)' },
        { icon: 'fa-chalkboard-user', label: 'Teachers', value: stats.total_teachers ?? '—', bg: 'var(--saffron-light)', color: 'var(--warning)' },
        { icon: 'fa-building-columns', label: 'Schools', value: stats.schools_in_network ?? '—', bg: '#F3E5F5', color: '#6A1B9A' },
        { icon: 'fa-file-pen', label: 'Assignments', value: stats.total_assignments ?? '—', bg: '#E8F5E9', color: 'var(--success)' },
    ];

    return (
        <div className="panel slide-in active">
            <div className="stat-grid">
                {cards.map((c, i) => (
                    <div key={i} className="stat-card-item">
                        <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
                            <i className={`fa-solid ${c.icon}`} />
                        </div>
                        <div>
                            <div className="stat-val">{c.value}</div>
                            <div className="stat-lbl">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OverviewPanel;
