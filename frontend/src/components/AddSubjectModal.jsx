import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddSubjectModal = ({ isOpen, onClose, onAdded }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState('Theory');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addDoc(collection(db, 'subjects'), {
                name: name,
                code: code.toUpperCase(),
                type: type,
                createdAt: serverTimestamp()
            });
            setLoading(false);
            setName('');
            setCode('');
            setType('Theory');
            onAdded();
            onClose();
        } catch (err) {
            console.error("Error adding subject:", err);
            setError("Failed to add subject. Check console.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="modal-box" style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Create New Subject</h3>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #F87171' }}>{error}</div>}
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Subject Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mathematics" style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Subject Code</label>
                        <input type="text" value={code} onChange={e => setCode(e.target.value)} required placeholder="e.g. MAT101" style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Subject Type</label>
                        <select value={type} onChange={e => setType(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
                            <option value="Theory">Theory</option>
                            <option value="Practical">Practical</option>
                            <option value="Elective">Elective</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Creating...' : 'Create Subject'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubjectModal;
