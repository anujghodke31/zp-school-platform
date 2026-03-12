import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UDISE_FIELDS = [
    { key: 'udise_code', label: 'UDISE Code' }, { key: 'name', label: 'Student Name' }, { key: 'dob', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' }, { key: 'category', label: 'Category' }, { key: 'aadhaar', label: 'Aadhaar No.' },
    { key: 'mother_name', label: "Mother's Name" }, { key: 'father_name', label: "Father's Name" }, { key: 'parent_phone', label: 'Parent Phone' },
    { key: 'class', label: 'Class' }, { key: 'section', label: 'Section' }, { key: 'admission_no', label: 'Admission No.' },
    { key: 'religion', label: 'Religion' }, { key: 'minority', label: 'Minority' }, { key: 'disability', label: 'Disability' },
    { key: 'bpl', label: 'BPL' }, { key: 'attendance_pct', label: 'Attendance %' },
];

const completeness = (student) => {
    const filled = UDISE_FIELDS.filter(f => student[f.key] !== undefined && student[f.key] !== '' && student[f.key] !== null).length;
    return Math.round((filled / UDISE_FIELDS.length) * 100);
};

const UDISEPanel = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [msg, setMsg] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const r = await api.get('/data/students?limit=200');
            if (r.data.success) setStudents(r.data.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const exportCSV = async () => {
        setExporting(true); setMsg('');
        try {
            // Direct download via anchor — backend returns CSV file
            const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token;
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/data/udise-export`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'UDISE_Students_Export.csv';
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setMsg('✓ UDISE CSV exported successfully');
        } catch { setMsg('Export failed. Try again.'); }
        finally { setExporting(false); }
    };

    const avgCompleteness = students.length ? Math.round(students.reduce((s, st) => s + completeness(st), 0) / students.length) : 0;
    const fullProfiles = students.filter(s => completeness(s) === 100).length;
    const missingAadhaar = students.filter(s => !s.aadhaar).length;

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">🏛️ UDISE+ Data Export</h2>
                <button className="btn btn-primary" onClick={exportCSV} disabled={exporting}>
                    {exporting ? 'Exporting…' : '⬇ Export UDISE CSV'}
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[
                    { label: 'Total Students', value: students.length },
                    { label: 'Avg. Profile Completeness', value: `${avgCompleteness}%` },
                    { label: 'Full Profiles', value: fullProfiles },
                    { label: 'Missing Aadhaar', value: missingAadhaar, color: missingAadhaar > 0 ? '#e74c3c' : '#27ae60' },
                ].map(s => <div key={s.label} className="stat-card"><div className="stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {/* Completeness color legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.8rem' }}>
                <span style={{ color: '#27ae60' }}>● 100% Complete</span>
                <span style={{ color: '#e67e22' }}>● 60–99% Partial</span>
                <span style={{ color: '#e74c3c' }}>● &lt;60% Incomplete</span>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Aadhaar</th>
                            <th>Class</th>
                            <th>Parent Phone</th>
                            <th>DOB</th>
                            <th>Category</th>
                            <th>Completeness</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading…</td></tr>}
                        {students.map(s => {
                            const pct = completeness(s);
                            const color = pct === 100 ? '#27ae60' : pct >= 60 ? '#e67e22' : '#e74c3c';
                            return (
                                <tr key={s.id}>
                                    <td>{s.name}</td>
                                    <td>{s.aadhaar || <span style={{ color: '#e74c3c' }}>Missing</span>}</td>
                                    <td>{s.class || s.className}</td>
                                    <td>{s.parent_phone || '—'}</td>
                                    <td>{s.dob || '—'}</td>
                                    <td>{s.category || '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.3s' }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color, fontWeight: 700, minWidth: 36 }}>{pct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* UDISE fields reference */}
            <div style={{ marginTop: 24, padding: 16, background: 'var(--card-bg)', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 10px', color: 'var(--primary)' }}>UDISE Export Fields ({UDISE_FIELDS.length} fields)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                    {UDISE_FIELDS.map(f => <span key={f.key} style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>• {f.label}</span>)}
                </div>
            </div>
        </div>
    );
};

export default UDISEPanel;
