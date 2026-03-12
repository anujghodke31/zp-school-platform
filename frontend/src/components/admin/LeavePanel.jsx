import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const STATUS_COLOR = { Pending: 'badge-yellow', Approved: 'badge-green', Rejected: 'badge-red' };
const LEAVE_TYPES = ['Casual Leave', 'Medical Leave', 'Earned Leave', 'Study Leave', 'Maternity/Paternity'];

const LeavePanel = ({ isAdmin = true }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ fromDate: '', toDate: '', leaveType: LEAVE_TYPES[0], reason: '' });
    const [remarks, setRemarks] = useState({});

    const fetch = async () => {
        setLoading(true);
        try {
            const r = await api.get('/data/leave');
            if (r.data.success) setRequests(r.data.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const submit = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post('/data/leave', form);
            setMsg('✓ Leave request submitted'); setShowForm(false); fetch();
            setForm({ fromDate: '', toDate: '', leaveType: LEAVE_TYPES[0], reason: '' });
        } catch { setMsg('Error submitting leave'); }
    };

    const decide = async (id, status) => {
        try {
            await api.patch(`/data/leave/${id}`, { status, remarks: remarks[id] || '' });
            fetch();
        } catch { setMsg('Error updating'); }
    };

    const inp = (f, v) => setForm(x => ({ ...x, [f]: v }));

    const days = (from, to) => {
        const d1 = new Date(from), d2 = new Date(to);
        return isNaN(d1) || isNaN(d2) ? '?' : Math.max(1, Math.ceil((d2 - d1) / 86400000) + 1);
    };

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">📋 Leave Management</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Apply Leave</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[
                    { label: 'Total Requests', value: requests.length },
                    { label: 'Pending', value: requests.filter(r => r.status === 'Pending').length, color: '#e67e22' },
                    { label: 'Approved', value: requests.filter(r => r.status === 'Approved').length, color: '#27ae60' },
                    { label: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length, color: '#e74c3c' },
                ].map(s => (
                    <div key={s.label} className="stat-card"><div className="stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div><div className="stat-label">{s.label}</div></div>
                ))}
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {showForm && (
                <form onSubmit={submit} className="form-grid" style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>Apply for Leave</h4>
                    <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-input" value={form.fromDate} onChange={e => inp('fromDate', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-input" value={form.toDate} onChange={e => inp('toDate', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Leave Type</label>
                        <select className="form-input" value={form.leaveType} onChange={e => inp('leaveType', e.target.value)}>
                            {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Reason</label><textarea className="form-input" rows={3} value={form.reason} onChange={e => inp('reason', e.target.value)} /></div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary">Submit</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Teacher</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th>{isAdmin && <th>Action</th>}</tr></thead>
                    <tbody>
                        {loading && <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading…</td></tr>}
                        {!loading && requests.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center' }}>No leave requests</td></tr>}
                        {requests.map(r => (
                            <tr key={r.id}>
                                <td>{r.teacherName || r.teacherId}</td>
                                <td>{r.leaveType}</td>
                                <td>{r.fromDate}</td>
                                <td>{r.toDate}</td>
                                <td>{days(r.fromDate, r.toDate)}</td>
                                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                                <td><span className={`badge ${STATUS_COLOR[r.status] || 'badge-muted'}`}>{r.status}</span></td>
                                {isAdmin && (
                                    <td>
                                        {r.status === 'Pending' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <input className="form-input" placeholder="Remarks (optional)" style={{ fontSize: '0.75rem', padding: '4px 8px' }} value={remarks[r.id] || ''} onChange={e => setRemarks(x => ({ ...x, [r.id]: e.target.value }))} />
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-sm btn-primary" onClick={() => decide(r.id, 'Approved')}>✓ Approve</button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => decide(r.id, 'Rejected')}>✗ Reject</button>
                                                </div>
                                            </div>
                                        )}
                                        {r.status !== 'Pending' && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.remarks || '—'}</span>}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeavePanel;
