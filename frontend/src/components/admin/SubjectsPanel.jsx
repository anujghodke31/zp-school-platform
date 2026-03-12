import React from 'react';

const typeClass = { Theory: 'badge-info', Practical: 'badge-success', default: 'badge-warning' };

const SubjectsPanel = ({ subjects, onAddSubject, onDeleteSubject }) => (
    <div className="panel slide-in active">
        <div className="panel-card">
            <div className="panel-title-row">
                <span>Subjects Master List</span>
                <button className="btn btn-primary" onClick={onAddSubject}>
                    <i className="fa-solid fa-plus" /> Add Subject
                </button>
            </div>
            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Subject Name', 'Code', 'Type', 'Actions'].map(h => (
                                <th key={h} className="th-navy">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length > 0 ? subjects.map(sub => (
                            <tr key={sub.id} className="table-row">
                                <td className="td"><strong>{sub.name}</strong></td>
                                <td className="td">{sub.code}</td>
                                <td className="td">
                                    <span className={typeClass[sub.type] || typeClass.default}>{sub.type}</span>
                                </td>
                                <td className="td">
                                    <button className="btn-icon-danger" onClick={() => onDeleteSubject(sub.id)}>
                                        <i className="fa-solid fa-trash" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" className="empty-state">No subjects found. Add a subject to get started.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default SubjectsPanel;
