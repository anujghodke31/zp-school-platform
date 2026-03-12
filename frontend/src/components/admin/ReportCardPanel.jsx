import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const GRADE_THRESHOLDS = [{ min: 90, grade: 'A+', color: '#27ae60' }, { min: 75, grade: 'A', color: '#2ecc71' }, { min: 60, grade: 'B', color: '#3498db' }, { min: 45, grade: 'C', color: '#e67e22' }, { min: 33, grade: 'D', color: '#e74c3c' }, { min: 0, grade: 'F', color: '#c0392b' }];
const getGrade = (pct) => GRADE_THRESHOLDS.find(g => pct >= g.min) || GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1];

const ReportCardPanel = ({ students = [] }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchReport = async (id) => {
        if (!id) return;
        setLoading(true); setReportData(null);
        try {
            const r = await api.get(`/data/report-card/${id}`);
            if (r.data.success) setReportData(r.data);
            else setMsg('Report not found');
        } catch { setMsg('Error loading report card'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchReport(selectedStudent); }, [selectedStudent]);

    const printCard = () => window.print();

    const overallPct = (byExam) => {
        const allMarks = Object.values(byExam).flat();
        if (!allMarks.length) return null;
        const obtained = allMarks.reduce((s, m) => s + (m.marks_obtained || 0), 0);
        const max = allMarks.reduce((s, m) => s + (m.max_marks || 100), 0);
        return max ? Math.round((obtained / max) * 100) : null;
    };

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">📋 Report Card</h2>
                {reportData && <button className="btn btn-ghost btn-sm" onClick={printCard}>🖨 Print</button>}
            </div>

            <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <label className="form-label">Select Student</label>
                    <select className="form-input" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                        <option value="">-- Select a student --</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.className || s.class}</option>)}
                    </select>
                </div>
            </div>

            {msg && <div className="alert-error" style={{ marginBottom: 12 }}>{msg}</div>}
            {loading && <p style={{ textAlign: 'center' }}>Loading report card…</p>}

            {reportData && (
                <div className="report-card" id="report-card-print" style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 24, border: '2px solid var(--primary)' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: 16, marginBottom: 20 }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>MahaVidya ZP School</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Maharashtra Zilla Parishad — Academic Progress Report</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>Academic Year 2025–26</div>
                    </div>

                    {/* Student Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20, padding: '12px 16px', background: 'rgba(255,107,0,0.05)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        {[
                            ['Student Name', reportData.student.name],
                            ['Class', reportData.student.class || reportData.student.className],
                            ['Roll No.', reportData.student.roll_no || '—'],
                            ['Admission No.', reportData.student.admission_no || '—'],
                            ['Attendance', `${reportData.attendancePct}% (${reportData.totalPresent}/${reportData.totalDays} days)`],
                            ['Category', reportData.student.category || '—'],
                        ].map(([label, value]) => (
                            <div key={label}><span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</span><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</div></div>
                        ))}
                    </div>

                    {/* Attendance Bar */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Attendance</span>
                            <span style={{ fontWeight: 700, color: reportData.attendancePct >= 75 ? '#27ae60' : '#e74c3c' }}>{reportData.attendancePct}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: 'var(--border)' }}>
                            <div style={{ width: `${reportData.attendancePct}%`, height: '100%', borderRadius: 4, background: reportData.attendancePct >= 75 ? '#27ae60' : '#e74c3c' }} />
                        </div>
                        {reportData.attendancePct < 75 && <div style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: 4 }}>⚠ Below 75% — At Risk</div>}
                    </div>

                    {/* Marks by Exam Type */}
                    {Object.entries(reportData.byExam).map(([examType, marks]) => {
                        const obtained = marks.reduce((s, m) => s + (m.marks_obtained || 0), 0);
                        const maxTotal = marks.reduce((s, m) => s + (m.max_marks || 100), 0);
                        const pct = maxTotal ? Math.round((obtained / maxTotal) * 100) : 0;
                        const grade = getGrade(pct);
                        return (
                            <div key={examType} style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem' }}>{examType}</h4>
                                    <span style={{ background: grade.color + '22', color: grade.color, border: `1px solid ${grade.color}`, borderRadius: 4, padding: '2px 10px', fontWeight: 700, fontSize: '0.85rem' }}>Grade {grade.grade} — {pct}%</span>
                                </div>
                                <table className="data-table">
                                    <thead><tr><th>Subject</th><th>Marks Obtained</th><th>Max Marks</th><th>%</th><th>Grade</th></tr></thead>
                                    <tbody>
                                        {marks.map((m, i) => {
                                            const subPct = m.max_marks ? Math.round((m.marks_obtained / m.max_marks) * 100) : 0;
                                            const subGrade = getGrade(subPct);
                                            return (
                                                <tr key={i}>
                                                    <td>{m.subjectName || m.subject}</td>
                                                    <td>{m.marks_obtained}</td>
                                                    <td>{m.max_marks || 100}</td>
                                                    <td>{subPct}%</td>
                                                    <td><span style={{ color: subGrade.color, fontWeight: 700 }}>{subGrade.grade}</span></td>
                                                </tr>
                                            );
                                        })}
                                        <tr style={{ fontWeight: 700, background: 'rgba(255,107,0,0.08)' }}>
                                            <td>Total</td><td>{obtained}</td><td>{maxTotal}</td>
                                            <td style={{ color: grade.color }}>{pct}%</td>
                                            <td style={{ color: grade.color }}>{grade.grade}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}

                    {Object.keys(reportData.byExam).length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No marks recorded yet for this student.</p>
                    )}

                    {/* Overall summary */}
                    {Object.keys(reportData.byExam).length > 0 && (() => {
                        const pct = overallPct(reportData.byExam);
                        const grade = pct !== null ? getGrade(pct) : null;
                        return (
                            <div style={{ padding: '16px 20px', background: grade ? grade.color + '15' : 'var(--border)', borderRadius: 10, border: `2px solid ${grade ? grade.color : 'var(--border)'}`, textAlign: 'center', marginTop: 8 }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Overall Performance</div>
                                {grade && <>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: grade.color }}>Grade {grade.grade}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: grade.color }}>{pct}%</div>
                                </>}
                            </div>
                        );
                    })()}

                    {/* Footer */}
                    <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                        <span>Generated: {new Date().toLocaleDateString()}</span>
                        <span>MahaVidya ZP School Platform</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportCardPanel;
