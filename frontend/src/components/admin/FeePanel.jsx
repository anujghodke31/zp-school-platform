import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const STATUS_COLORS = { Paid: 'badge-green', Unpaid: 'badge-red', Partial: 'badge-yellow' };

const FeePanel = ({ classes = [] }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ studentId: '', studentName: '', classId: '', amount: '', category: 'General', status: 'Unpaid', paymentMode: 'Cash', receiptNo: '', paidOn: '' });

    const fetchFees = useCallback(async () => {
        setLoading(true);
        try {
            const r = await api.get(`/data/fees${filterClass ? `?classId=${filterClass}` : ''}`);
            if (r.data.success) setFees(r.data.data);
        } finally { setLoading(false); }
    }, [filterClass]);

    useEffect(() => { fetchFees(); }, [fetchFees]);

    const submit = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post('/data/fees', form);
            setMsg('✓ Fee record added'); setShowForm(false); fetchFees();
            setForm({ studentId: '', studentName: '', classId: '', amount: '', category: 'General', status: 'Unpaid', paymentMode: 'Cash', receiptNo: '', paidOn: '' });
        } catch { setMsg('Error adding fee'); }
    };

    const markPaid = async (id) => {
        try {
            await api.patch(`/data/fees/${id}`, { status: 'Paid', paidOn: new Date().toISOString().slice(0, 10) });
            fetchFees();
        } catch { setMsg('Error updating'); }
    };

    const inp = (f, v) => setForm(x => ({ ...x, [f]: v }));
    const paid = fees.filter(f => f.status === 'Paid').length;
    const total = fees.reduce((s, f) => s + (f.amount || 0), 0);
    const collected = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + (f.amount || 0), 0);

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">💰 Fee Management</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Add Record</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 20 }}>
                {[{ label: 'Total Records', value: fees.length }, { label: 'Paid', value: paid }, { label: 'Pending', value: fees.length - paid }, { label: 'Collected ₹', value: `₹${collected.toLocaleString()}` }, { label: 'Total Expected ₹', value: `₹${total.toLocaleString()}` }].map(s => (
                    <div key={s.label} className="stat-card"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
                ))}
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {showForm && (
                <form onSubmit={submit} className="form-grid" style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>New Fee Record</h4>
                    <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" value={form.studentId} onChange={e => inp('studentId', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Student Name</label><input className="form-input" value={form.studentName} onChange={e => inp('studentName', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Class</label>
                        <select className="form-input" value={form.classId} onChange={e => inp('classId', e.target.value)}>
                            <option value="">-- Select --</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Amount (₹)</label><input type="number" className="form-input" value={form.amount} onChange={e => inp('amount', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Category</label>
                        <select className="form-input" value={form.category} onChange={e => inp('category', e.target.value)}>
                            {['General', 'Exam Fee', 'Sports', 'Library', 'Scholarship Contribution'].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Status</label>
                        <select className="form-input" value={form.status} onChange={e => inp('status', e.target.value)}>
                            {['Unpaid', 'Paid', 'Partial'].map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Payment Mode</label>
                        <select className="form-input" value={form.paymentMode} onChange={e => inp('paymentMode', e.target.value)}>
                            {['Cash', 'UPI', 'NEFT', 'Cheque'].map(m => <option key={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Receipt No.</label><input className="form-input" value={form.receiptNo} onChange={e => inp('receiptNo', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Paid On</label><input type="date" className="form-input" value={form.paidOn} onChange={e => inp('paidOn', e.target.value)} /></div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary">Save</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            <div style={{ marginBottom: 12 }}>
                <label className="form-label">Filter by Class</label>
                <select className="form-input" style={{ width: 200 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Class</th><th>Amount</th><th>Category</th><th>Status</th><th>Mode</th><th>Paid On</th><th>Action</th></tr></thead>
                    <tbody>
                        {loading && <tr><td colSpan={8} style={{ textAlign: 'center' }}>Loading…</td></tr>}
                        {!loading && fees.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center' }}>No fee records</td></tr>}
                        {fees.map(f => (
                            <tr key={f.id}>
                                <td>{f.studentName || f.studentId}</td>
                                <td>{f.classId}</td>
                                <td>₹{f.amount}</td>
                                <td>{f.category}</td>
                                <td><span className={`badge ${STATUS_COLORS[f.status] || 'badge-muted'}`}>{f.status}</span></td>
                                <td>{f.paymentMode}</td>
                                <td>{f.paidOn || '—'}</td>
                                <td>{f.status !== 'Paid' && <button className="btn btn-sm btn-primary" onClick={() => markPaid(f.id)}>Mark Paid</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeePanel;
