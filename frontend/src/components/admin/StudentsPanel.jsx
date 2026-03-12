import React from 'react';

const StudentsPanel = ({ students, onAddStudent, nextCursor, onLoadMore }) => (
    <div className="panel slide-in active">
        <div className="panel-card">
            <div className="panel-title-row">
                <span>Student Management — District Overview</span>
                <button className="btn btn-primary" onClick={() => onAddStudent('student')}>
                    <i className="fa-solid fa-plus" /> Add Student
                </button>
            </div>
            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {['Roll', 'Name', 'Class', 'Parent Contact', 'Attendance'].map(h => (
                                <th key={h} className="th-navy">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(st => (
                            <tr key={st.id} className="table-row">
                                <td className="td">{st.roll_no}</td>
                                <td className="td"><strong>{st.name}</strong></td>
                                <td className="td">{st.className}</td>
                                <td className="td">{st.parent_phone}</td>
                                <td className="td">
                                    <span className={`badge-${(st.attendance_pct ?? 100) >= 75 ? 'success' : 'danger'}`}>
                                        {st.attendance_pct ?? 100}%
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="empty-state"><i className="fa-solid fa-spinner fa-spin" /> Loading...</td></tr>
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

export default StudentsPanel;
