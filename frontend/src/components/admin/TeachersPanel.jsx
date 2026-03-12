import React from 'react';

const TeachersPanel = ({ teachers, onAddStaff, onAssign, nextCursor, onLoadMore }) => (
    <div className="panel slide-in active">
        <div className="panel-card">
            <div className="panel-title-row">
                <span>Teacher Management</span>
                <button className="btn btn-primary" onClick={onAddStaff}>
                    <i className="fa-solid fa-plus" /> Add Teacher / Admin
                </button>
            </div>
            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['#', 'Name', 'Role', 'Contact', 'Status', 'Actions'].map(h => (
                                <th key={h} className="th-navy">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.length > 0 ? teachers.map((t, i) => (
                            <tr key={t.id} className="table-row">
                                <td className="td">{i + 1}</td>
                                <td className="td">
                                    <strong>{t.name}</strong>
                                    <span className="text-muted" style={{ display: 'block', fontSize: '.75rem' }}>ID: {t.username}</span>
                                </td>
                                <td className="td">{t.role}</td>
                                <td className="td">{t.contactNumber || 'N/A'}</td>
                                <td className="td"><span className="badge-success">● Active</span></td>
                                <td className="td">
                                    {t.role === 'Teacher' && (
                                        <button className="btn btn-secondary" style={{ fontSize: '.8rem', padding: '.3rem .7rem' }} onClick={() => onAssign(t)}>
                                            Assign Subject
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="empty-state"><i className="fa-solid fa-spinner fa-spin" /> Loading...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {nextCursor && (
                <div className="load-more-row">
                    <button className="btn btn-secondary" onClick={onLoadMore}>Load More</button>
                </div>
            )}
        </div>
    </div>
);

export default TeachersPanel;
