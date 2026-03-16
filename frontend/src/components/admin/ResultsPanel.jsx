import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const grades = { 90: 'A+', 80: 'A', 70: 'B', 60: 'C', 50: 'D', 0: 'F' };
const getGrade = pct => {
    for (const threshold of [90, 80, 70, 60, 50]) {
        if (pct >= threshold) return grades[threshold];
    }
    return grades[0];
};

const exportCSV = (results) => {
    const header = ['Student', 'Total Marks', 'Max Marks', 'Percentage', 'Grade'];
    const rows = results.map(r => [r.studentName, r.totalMarks, r.maxMarks, `${r.percentage}%`, getGrade(r.percentage)]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; a.click();
    URL.revokeObjectURL(url);
};

const ResultsPanel = ({ classes }) => {
    const [classId, setClassId] = useState('');
    const [examType, setExamType] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = useCallback(async () => {
        if (!classId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ classId });
            if (examType) params.set('examType', examType);
            const res = await api.get(`/data/results?${params}`);
            setResults(res.data.data || []);
        } catch (err) {
            console.error('Results fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [classId, examType]);

    useEffect(() => { fetchResults(); }, [classId, examType, fetchResults]);

    const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
    const top3 = sorted.slice(0, 3);

    return (
        <div className="panel slide-in active">
            <div className="panel-card">
                <div className="panel-title-row">
                    <span>Results &amp; Analytics</span>
                    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                        <select className="form-input" style={{ width: '150px' }} value={classId} onChange={e => setClassId(e.target.value)}>
                            <option value="">Select Class…</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.grade} {c.section}</option>)}
                        </select>
                        <select className="form-input" style={{ width: '140px' }} value={examType} onChange={e => setExamType(e.target.value)}>
                            <option value="">All Exams</option>
                            <option value="unit1">Unit Test 1</option>
                            <option value="mid">Mid-Term</option>
                            <option value="unit2">Unit Test 2</option>
                            <option value="final">Final</option>
                        </select>
                        {results.length > 0 && (
                            <button className="btn btn-secondary" onClick={() => exportCSV(results)}>
                                <i className="fa-solid fa-download" /> Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {top3.length > 0 && (
                    <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
                        {top3.map((r, i) => (
                            <div key={r.id} className="stat-card-item" style={{ background: ['#FFF8E1', '#F3E5F5', '#E8F5E9'][i] }}>
                                <div className="stat-icon" style={{ background: ['#FF9933', '#9C27B0', '#4CAF50'][i], color: '#fff' }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <div className="stat-val" style={{ fontSize: '1.1rem' }}>{r.studentName}</div>
                                    <div className="stat-lbl">{r.percentage}% — {getGrade(r.percentage)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <div className="empty-state"><i className="fa-solid fa-spinner fa-spin" /> Loading results...</div>}

                {!loading && results.length > 0 && (
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {['Student', 'Marks', 'Max', '%', 'Grade'].map(h => <th key={h} className="th-navy">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map(r => (
                                    <tr key={r.id} className="table-row">
                                        <td className="td"><strong>{r.studentName}</strong></td>
                                        <td className="td">{r.totalMarks}</td>
                                        <td className="td">{r.maxMarks}</td>
                                        <td className="td">{r.percentage}%</td>
                                        <td className="td">
                                            <span className={r.percentage >= 60 ? 'badge-success' : 'badge-danger'}>
                                                {getGrade(r.percentage)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && !classId && (
                    <div className="empty-state">Select a class to view results.</div>
                )}

                {!loading && classId && results.length === 0 && (
                    <div className="empty-state">No results recorded for this selection.</div>
                )}
            </div>
        </div>
    );
};

export default ResultsPanel;
