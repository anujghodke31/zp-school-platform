import React from 'react';

const ClassesPanel = ({ classes, onAddClass, onDeleteClass }) => (
    <div className="panel slide-in active">
        <div className="panel-card">
            <div className="panel-title-row">
                <span>Classes &amp; Sections Management</span>
                <button className="btn btn-primary" onClick={onAddClass}>
                    <i className="fa-solid fa-plus" /> Add Class
                </button>
            </div>
            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Grade/Class', 'Section', 'Room', 'Actions'].map(h => (
                                <th key={h} className="th-navy">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classes.length > 0 ? classes.map(cls => (
                            <tr key={cls.id} className="table-row">
                                <td className="td"><strong>{cls.grade}</strong></td>
                                <td className="td">{cls.section}</td>
                                <td className="td">{cls.room || 'N/A'}</td>
                                <td className="td">
                                    <button className="btn-icon-danger" onClick={() => onDeleteClass(cls.id)}>
                                        <i className="fa-solid fa-trash" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="empty-state">No classes found. Add a class to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default ClassesPanel;
