import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CATEGORIES = ['General', 'Science', 'Mathematics', 'Language', 'Social Studies', 'Reference', 'Story Books', 'Government Publications'];

const LibraryPanel = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [issueModal, setIssueModal] = useState(null); // bookId
    const [issueForm, setIssueForm] = useState({ studentId: '', studentName: '', dueDate: '' });
    const [form, setForm] = useState({ title: '', author: '', subject: '', isbn: '', category: CATEGORIES[0], totalCopies: '1', availableCopies: '1' });
    const [search, setSearch] = useState('');

    const fetch = async () => {
        setLoading(true);
        try {
            const r = await api.get('/data/library');
            if (r.data.success) setBooks(r.data.data);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const submit = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post('/data/library', form);
            setMsg('✓ Book added'); setShowForm(false); fetch();
            setForm({ title: '', author: '', subject: '', isbn: '', category: CATEGORIES[0], totalCopies: '1', availableCopies: '1' });
        } catch { setMsg('Error adding book'); }
    };

    const issueBook = async e => {
        e.preventDefault(); setMsg('');
        try {
            await api.post(`/data/library/${issueModal}/issue`, issueForm);
            setMsg('✓ Book issued'); setIssueModal(null); fetch();
            setIssueForm({ studentId: '', studentName: '', dueDate: '' });
        } catch (err) { setMsg(err.response?.data?.message || 'Error issuing book'); }
    };

    const returnBook = async (bookId, studentId) => {
        try { await api.post(`/data/library/${bookId}/return`, { studentId }); fetch(); }
        catch { setMsg('Error returning book'); }
    };

    const inp = (f, v) => setForm(x => ({ ...x, [f]: v }));
    const filtered = books.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="panel-wrap">
            <div className="panel-header">
                <h2 className="panel-title">📚 Digital Library</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>+ Add Book</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 16 }}>
                {[
                    { label: 'Total Books', value: books.length },
                    { label: 'Total Copies', value: books.reduce((s, b) => s + (b.totalCopies || 0), 0) },
                    { label: 'Available', value: books.reduce((s, b) => s + (b.availableCopies || 0), 0) },
                    { label: 'Issued', value: books.reduce((s, b) => s + ((b.issuedTo || []).filter(i => i.status === 'Issued').length), 0) },
                ].map(s => <div key={s.label} className="stat-card"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>)}
            </div>

            {msg && <div className="alert-success" style={{ marginBottom: 12 }}>{msg}</div>}

            {showForm && (
                <form onSubmit={submit} className="form-grid" style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <h4 style={{ margin: '0 0 12px', gridColumn: '1/-1' }}>Add New Book</h4>
                    <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => inp('title', e.target.value)} required /></div>
                    <div className="form-group"><label className="form-label">Author</label><input className="form-input" value={form.author} onChange={e => inp('author', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={form.subject} onChange={e => inp('subject', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">ISBN</label><input className="form-input" value={form.isbn} onChange={e => inp('isbn', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Category</label>
                        <select className="form-input" value={form.category} onChange={e => inp('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group"><label className="form-label">Total Copies</label><input type="number" className="form-input" value={form.totalCopies} onChange={e => { inp('totalCopies', e.target.value); inp('availableCopies', e.target.value); }} /></div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                        <button type="submit" className="btn btn-primary">Add Book</button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {/* Issue Modal */}
            {issueModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <form className="modal-card" onSubmit={issueBook}>
                        <div className="modal-header"><h3>Issue Book</h3><button type="button" className="modal-close" onClick={() => setIssueModal(null)}>×</button></div>
                        <div className="modal-panel">
                            <div className="form-group"><label className="form-label">Student ID</label><input className="form-input" value={issueForm.studentId} onChange={e => setIssueForm(f => ({ ...f, studentId: e.target.value }))} required /></div>
                            <div className="form-group"><label className="form-label">Student Name</label><input className="form-input" value={issueForm.studentName} onChange={e => setIssueForm(f => ({ ...f, studentName: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="form-input" value={issueForm.dueDate} onChange={e => setIssueForm(f => ({ ...f, dueDate: e.target.value }))} required /></div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                <button type="submit" className="btn btn-primary">Issue</button>
                                <button type="button" className="btn btn-ghost" onClick={() => setIssueModal(null)}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ marginBottom: 12 }}>
                <input className="form-input" placeholder="Search by title or author…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Title</th><th>Author</th><th>Category</th><th>Available</th><th>Total</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading && <tr><td colSpan={6} style={{ textAlign: 'center' }}>Loading…</td></tr>}
                        {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>No books found</td></tr>}
                        {filtered.map(b => (
                            <React.Fragment key={b.id}>
                                <tr>
                                    <td><strong>{b.title}</strong></td>
                                    <td>{b.author}</td>
                                    <td><span className="badge badge-blue">{b.category}</span></td>
                                    <td style={{ color: b.availableCopies < 1 ? '#e74c3c' : '#27ae60', fontWeight: 700 }}>{b.availableCopies}</td>
                                    <td>{b.totalCopies}</td>
                                    <td><button className="btn btn-sm btn-primary" onClick={() => setIssueModal(b.id)} disabled={b.availableCopies < 1}>Issue</button></td>
                                </tr>
                                {/* Show issued-to rows */}
                                {(b.issuedTo || []).filter(i => i.status === 'Issued').map((issue, idx) => (
                                    <tr key={idx} style={{ background: 'rgba(255,107,0,0.04)' }}>
                                        <td colSpan={3} style={{ paddingLeft: 32, fontSize: '0.85rem', color: 'var(--muted)' }}>
                                            ↳ Issued to: <strong>{issue.studentName || issue.studentId}</strong> | Due: {issue.dueDate}
                                        </td>
                                        <td colSpan={3}><button className="btn btn-sm btn-ghost" onClick={() => returnBook(b.id, issue.studentId)}>Return</button></td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LibraryPanel;
