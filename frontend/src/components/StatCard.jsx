import React from 'react';

const StatCard = ({ title, value, subtitle, icon, colorClass = "blue-glow" }) => {
    return (
        <div className={`stat-card ${colorClass}`}>
            <div className="stat-content">
                <h3>{title}</h3>
                <div className="stat-value">{value}</div>
                {subtitle && <div className="stat-subtitle">{subtitle}</div>}
            </div>
            {icon && <div className="stat-icon">{icon}</div>}
        </div>
    );
};

export default StatCard;
