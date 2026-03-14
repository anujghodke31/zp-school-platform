import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const EXAM_TYPES = ['Unit Test', 'Mid-Term', 'Annual', 'Pre-Board', 'Monthly'];

const ExamPanel = ({ classes = [] }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [filterClass, setFilterClass] = useState('');
    const [form, setForm] = useState({ classId: '', subjectName: '', examName: '', examType: EXAM_TYPES[0], examDate: '', startTime: '09:00', endTime: '12:00', totalMarks: '100', venue: '' });

    const fetch = async () => {
        setLoading(true);
        try {
            const r = await api.get(`/data/exam-schedule${filterClass ? `?classId=${filterClass}` : ''}`);
            if (r.data.success) setExams(r.data.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, [filterClass]);

    const submit = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post('/data/exam-schedule', form);
            setMsg('✓ Exam scheduled'); setShowForm(false); fetch();
            setForm({ classId: '', subjectName: '', examName: '', examType: EXAM_TYPES[0], examDate: '', startTime: '09:00', endTime: '12:00', totalMarks: '100', venue: '' });
        } catch { setMsg('Error scheduling exam'); }
    };

    const del = async id => {
        if (!window.confirm('Delete this exam?')) return;
        try { await api.delete(`/data/exam-schedule/${id}`); fetch(); }
        catch { setMsg('Error deleting'); }
    };

    const inp = (f, v) => setForm(x => ({ ...x, [f]: v }));

    // Group exams by type for display
    const grouped = exams.reduce((acc, e) => {
        const key = e.examType || 'Other';
        if (!acc[key]) acc[key] = [];
        acc[key].push(e);
        return acc;
    }, {});

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">📅 Exam Schedule</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                    <select className="form-input" style={{ width: 180 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Schedule Exam</button>
                </div>
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {showForm && (
                <form onSubmit={submit} className="form-grid" style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>New Exam</h4>
                    <div className="form-group"><label className="form-label">Class</label>
                        <select className="form-input" value={form.classId} onChange={e => inp('classId', e.target.value)} required>
                            <option value="">-- Select --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={form.subjectName} onChange={e => inp('subjectName', e.target.value)} placeholder="e.g. Mathematics" /></div>
                    <div className="form-group"><label className="form-label">Exam Name</label><input className="form-input" value={form.examName} onChange={e => inp('examName', e.target.value)} placeholder="e.g. Unit Test 1" /></div>
                    <div className="form-group"><label className="form-label">Exam Type</label>
                        <select className="form-input" value={form.examType} onChange={e => inp('examType', e.target.value)}>
                            {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.examDate} onChange={e => inp('examDate', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Start Time</label><input type="time" className="form-input" value={form.startTime} onChange={e => inp('startTime', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">End Time</label><input type="time" className="form-input" value={form.endTime} onChange={e => inp('endTime', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Total Marks</label><input type="number" className="form-input" value={form.totalMarks} onChange={e => inp('totalMarks', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Venue / Hall</label><input className="form-input" value={form.venue} onChange={e => inp('venue', e.target.value)} /></div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {loading && <p style={{ textAlign: 'center' }}>Loading…</p>}

            {!loading && Object.keys(grouped).length === 0 && <p style={{ textAlign: 'center', color: 'var(--muted)' }}>No exams scheduled</p>}

            {Object.entries(grouped).map(([type, items]) => (
                <div key={type} style={{ marginBottom: 20 }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>{type}</h4>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Class</th><th>Subject</th><th>Name</th><th>Date</th><th>Time</th><th>Marks</th><th>Venue</th><th></th></tr></thead>
                            <tbody>
                                {items.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.classId}</td>
                                        <td>{e.subjectName}</td>
                                        <td>{e.examName}</td>
                                        <td>{e.examDate}</td>
                                        <td>{e.startTime} – {e.endTime}</td>
                                        <td>{e.totalMarks}</td>
                                        <td>{e.venue || '—'}</td>
                                        <td><button className="btn btn-sm btn-danger" onClick={() => del(e.id)}>Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExamPanel;
