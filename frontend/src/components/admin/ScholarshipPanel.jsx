import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const SCHEMES = ['eKalyan Scholarship', 'Uniform Allowance', 'Free Textbooks', 'Saral Scholarship', 'SC/ST Merit', 'OBC Scholarship', 'Mid-Day Meal Benefit'];
const STATUS_COLOR = { Approved: 'badge-green', Pending: 'badge-yellow', Rejected: 'badge-red', Disbursed: 'badge-blue' };

const ScholarshipPanel = ({ classes = [] }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [filterClass, setFilterClass] = useState('');
    const [form, setForm] = useState({ studentId: '', studentName: '', classId: '', schemeName: SCHEMES[0], benefit: '', status: 'Approved', disbursementDate: '' });

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get(`/data/scholarships${filterClass ? `?classId=${filterClass}` : ''}`);
            if (r.data.success) setData(r.data.data);
        } finally { setLoading(false); }
    }, [filterClass]);

    useEffect(() => { fetch(); }, [fetch]);

    const submit = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post('/data/scholarships', form);
            setMsg('✓ Scholarship record added'); setShowForm(false); fetch();
        } catch { setMsg('Error adding record'); }
    };

    const updateStatus = async (id, status) => {
        try { await api.patch(`/data/scholarships/${id}`, { status }); fetch(); }
        catch { setMsg('Error updating'); }
    };

    const inp = (f, v) => setForm(x => ({ ...x, [f]: v }));

    // Aggregate by scheme
    const byScheme = data.reduce((acc, d) => {
        acc[d.schemeName] = (acc[d.schemeName] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">🏆 Scholarship & Schemes</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Add Record</button>
            </div>

            {/* Scheme summary badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {Object.entries(byScheme).map(([scheme, count]) => (
                    <span key={scheme} className="badge badge-blue" style={{ fontSize: '0.8rem' }}>{scheme}: {count}</span>
                ))}
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {showForm && (
                <form onSubmit={submit} className="form-grid" style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>New Scholarship Record</h4>
                    <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" value={form.studentId} onChange={e => inp('studentId', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Student Name</label><input className="form-input" value={form.studentName} onChange={e => inp('studentName', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Class</label>
                        <select className="form-input" value={form.classId} onChange={e => inp('classId', e.target.value)}>
                            <option value="">-- Select --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Scheme</label>
                        <select className="form-input" value={form.schemeName} onChange={e => inp('schemeName', e.target.value)}>
                            {SCHEMES.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Benefit / Amount</label><input className="form-input" value={form.benefit} onChange={e => inp('benefit', e.target.value)} placeholder="e.g. ₹1500 / 5 books" /></div>
                    <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-input" value={form.status} onChange={e => inp('status', e.target.value)}>
                            {['Approved', 'Pending', 'Rejected', 'Disbursed'].map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Disbursement Date</label><input type="date" className="form-input" value={form.disbursementDate} onChange={e => inp('disbursementDate', e.target.value)} /></div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div style={{ marginBottom: 12 }}>
                <select className="form-input" style={{ width: 200 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Class</th><th>Scheme</th><th>Benefit</th><th>Status</th><th>Disbursed On</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading && <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading…</td></tr>}
                        {!loading && data.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center' }}>No records found</td></tr>}
                        {data.map(d => (
                            <tr key={d.id}>
                                <td>{d.studentName || d.studentId}</td>
                                <td>{d.classId}</td>
                                <td>{d.schemeName}</td>
                                <td>{d.benefit}</td>
                                <td><span className={`badge ${STATUS_COLOR[d.status] || 'badge-muted'}`}>{d.status}</span></td>
                                <td>{d.disbursementDate || '—'}</td>
                                <td style={{ display: 'flex', gap: 4 }}>
                                    {d.status !== 'Disbursed' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(d.id, 'Disbursed')}>Disburse</button>}
                                    {d.status === 'Pending' && <button className="btn btn-sm btn-danger" onClick={() => updateStatus(d.id, 'Rejected')}>Reject</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScholarshipPanel;
