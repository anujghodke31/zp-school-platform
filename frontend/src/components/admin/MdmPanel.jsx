import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2026, i, 1);
    return { value: `2026-${String(i + 1).padStart(2, '0')}`, label: d.toLocaleString('default', { month: 'long', year: 'numeric' }) };
});

const MdmPanel = () => {
    const [logs, setLogs] = useState([]);
    const [stock, setStock] = useState([]);
    const [report, setReport] = useState(null);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [tab, setTab] = useState('daily');
    const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), menu: '', studentsFed: '', cookName: '', remarks: '' });
    const [stockForm, setStockForm] = useState({ item: '', quantity: '', unit: 'kg' });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const fetchLogs = useCallback(async () => {
        const r = await api.get(`/data/mdm?month=${month}`);
        if (r.data.success) setLogs(r.data.data);
    }, [month]);
    const fetchStock = useCallback(async () => {
        const r = await api.get('/data/mdm/stock');
        if (r.data.success) setStock(r.data.data);
    }, []);
    const fetchReport = useCallback(async () => {
        const r = await api.get(`/data/mdm/report?month=${month}`);
        if (r.data.success) setReport(r.data);
    }, [month]);

    useEffect(() => { fetchLogs(); fetchReport(); }, [month, fetchLogs, fetchReport]);
    useEffect(() => { if (tab === 'stock') fetchStock(); }, [tab, fetchStock]);

    const submitDaily = async e => {
        e.preventDefault(); setLoading(true); setMsg('');
        try {
            await api.post('/data/mdm', form);
            setMsg('✓ Daily log saved'); fetchLogs(); fetchReport();
            setForm(f => ({ ...f, menu: '', studentsFed: '', cookName: '', remarks: '' }));
        } catch { setMsg('Error saving log'); } finally { setLoading(false); }
    };

    const submitStock = async e => {
        e.preventDefault(); setLoading(true); setMsg('');
        try {
            await api.post('/data/mdm/stock', stockForm);
            setMsg('✓ Stock added'); fetchStock();
            setStockForm({ item: '', quantity: '', unit: 'kg' });
        } catch { setMsg('Error adding stock'); } finally { setLoading(false); }
    };

    const inp = (field, val) => setForm(f => ({ ...f, [field]: val }));

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">🍱 Mid-Day Meal (MDM)</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['daily', 'stock', 'report'].map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-ghost'}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Month</label>
                <select className="form-input" style={{ width: 220 }} value={month} onChange={e => setMonth(e.target.value)}>
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {tab === 'daily' && (
                <>
                    <form onSubmit={submitDaily} className="form-grid" style={{ marginBottom: 24, background: 'var(--card-bg)', borderRadius: 8, padding: 16 }}>
                        <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>Log Today's Meal</h4>
                        <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" value={form.date} onChange={e => inp('date', e.target.value)} required /></div>
                        <div className="form-group"><label className="form-label">Menu Description</label><input className="form-input" value={form.menu} onChange={e => inp('menu', e.target.value)} placeholder="e.g. Rice + Dal + Sabzi" /></div>
                        <div className="form-group"><label className="form-label">Students Fed</label><input type="number" className="form-input" value={form.studentsFed} onChange={e => inp('studentsFed', e.target.value)} /></div>
                        <div className="form-group"><label className="form-label">Cook Name</label><input className="form-input" value={form.cookName} onChange={e => inp('cookName', e.target.value)} /></div>
                        <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Remarks</label><input className="form-input" value={form.remarks} onChange={e => inp('remarks', e.target.value)} /></div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Log'}</button>
                    </form>

                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Date</th><th>Menu</th><th>Students Fed</th><th>Cook</th><th>Remarks</th></tr></thead>
                            <tbody>
                                {logs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center' }}>No logs this month</td></tr>}
                                {logs.map(l => <tr key={l.id}><td>{l.date}</td><td>{l.menu}</td><td>{l.studentsFed}</td><td>{l.cookName}</td><td>{l.remarks}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === 'stock' && (
                <>
                    <form onSubmit={submitStock} className="form-grid" style={{ marginBottom: 24, background: 'var(--card-bg)', borderRadius: 8, padding: 16 }}>
                        <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>Add Stock Entry</h4>
                        <div className="form-group"><label className="form-label">Item Name</label><input className="form-input" value={stockForm.item} onChange={e => setStockForm(f => ({ ...f, item: e.target.value }))} required /></div>
                        <div className="form-group"><label className="form-label">Quantity</label><input type="number" className="form-input" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Unit</label>
                            <select className="form-input" value={stockForm.unit} onChange={e => setStockForm(f => ({ ...f, unit: e.target.value }))}>
                                {['kg', 'litre', 'pieces', 'bags'].map(u => <option key={u}>{u}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>Add Stock</button>
                    </form>
                    <div className="table-wrapper"><table className="data-table">
                        <thead><tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Added</th></tr></thead>
                        <tbody>{stock.map(s => <tr key={s.id}><td>{s.item}</td><td>{s.quantity}</td><td>{s.unit}</td><td>{s.updatedAt?.seconds ? new Date(s.updatedAt.seconds * 1000).toLocaleDateString() : '—'}</td></tr>)}</tbody>
                    </table></div>
                </>
            )}

            {tab === 'report' && report && (
                <div>
                    <div className="stats-grid" style={{ marginBottom: 24 }}>
                        {[
                            { label: 'Meal Days', value: report.totalDays },
                            { label: 'Student Meal Days', value: report.totalStudentsMealDays },
                            { label: 'Avg Students/Day', value: report.avgPerDay },
                        ].map(s => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="table-wrapper"><table className="data-table">
                        <thead><tr><th>Date</th><th>Menu</th><th>Students Fed</th></tr></thead>
                        <tbody>{report.logs.map((l, i) => <tr key={i}><td>{l.date}</td><td>{l.menu}</td><td>{l.studentsFed}</td></tr>)}</tbody>
                    </table></div>
                </div>
            )}
        </div>
    );
};

export default MdmPanel;
