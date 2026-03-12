import React, { useState } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddClassModal = ({ isOpen, onClose, onAdded }) => {
    const [grade, setGrade] = useState('');
    const [section, setSection] = useState('');
    const [room, setRoom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await addDoc(collection(db, 'classes'), {
                grade: grade,
                section: section.toUpperCase(),
                room: room,
                createdAt: serverTimestamp()
            });
            setLoading(false);
            setGrade('');
            setSection('');
            setRoom('');
            onAdded();
            onClose();
        } catch (err) {
            console.error("Error adding class:", err);
            setError("Failed to add class. Check console.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="modal-box" style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ background: 'var(--navy)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Create New Class</h3>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                    {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #F87171' }}>{error}</div>}
                    
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Grade / Standard</label>
                        <input type="text" value={grade} onChange={e => setGrade(e.target.value)} required placeholder="e.g. 10th Standard" style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Section</label>
                        <input type="text" value={section} onChange={e => setSection(e.target.value)} required placeholder="e.g. A" style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }} />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>Room Number (Optional)</label>
                        <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Room 101" style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button type="button" onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: '#f1f5f9', color: 'var(--navy)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.2rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Creating...' : 'Create Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClassModal;
