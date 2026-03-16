import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const AssignTeacherModal = ({ isOpen, onClose, teacher, classes, subjects }) => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAssignments = useCallback(async () => {
        if (!teacher) return;
        setLoading(true);
        try {
            const q = query(collection(db, 'teacher_assignments'), where('teacherId', '==', teacher._id || teacher.id));
            const snap = await getDocs(q);
            setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error fetching assignments:", err);
            setError("Could not load current assignments.");
        } finally {
            setLoading(false);
        }
    }, [teacher]);

    useEffect(() => {
        if (isOpen && teacher) {
            fetchAssignments();
        }
    }, [isOpen, teacher, fetchAssignments]);
    const handleAssign = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedClass || !selectedSubject) {
            setError('Please select both a class and a subject.');
            return;
        }

        setLoading(true);
        try {
            const cls = classes.find(c => c.id === selectedClass);
            const sub = subjects.find(s => s.id === selectedSubject);

            await addDoc(collection(db, 'teacher_assignments'), {
                teacherId: teacher._id || teacher.id,
                teacherName: teacher.name,
                classId: selectedClass,
                className: `${cls.grade} ${cls.section}`,
                subjectId: selectedSubject,
                subjectName: sub.name,
                assignedAt: serverTimestamp()
            });
            
            setSelectedClass('');
            setSelectedSubject('');
            await fetchAssignments();
        } catch (err) {
            console.error("Error assigning:", err);
            setError("Failed to assign.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (assignmentId) => {
        if (!window.confirm("Remove this assignment?")) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'teacher_assignments', assignmentId));
            await fetchAssignments();
        } catch (err) {
            console.error("Error removing:", err);
            setError("Failed to remove assignment.");
            setLoading(false);
        }
    };

    if (!isOpen || !teacher) return null;

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="modal-box" style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                <div style={{ background: 'var(--navy)', color: '#fff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Assign Subject to {teacher.name}</h3>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #F87171' }}>{error}</div>}
                    
                    <form onSubmit={handleAssign} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.3rem' }}>Select Class</label>
                            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <option value="">-- Choose Class --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.3rem' }}>Select Subject</label>
                            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <option value="">-- Choose Subject --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', justifySelf: 'end' }}>
                            <button type="submit" disabled={loading} style={{ background: 'var(--navy)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                <i className="fa-solid fa-plus" style={{ marginRight: '5px' }}></i> Assign
                            </button>
                        </div>
                    </form>

                    <h4 style={{ fontSize: '0.95rem', color: 'var(--navy)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Current Assignments</h4>
                    {loading && assignments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>Loading...</div>
                    ) : assignments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {assignments.map(assign => (
                                <div key={assign.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy)' }}>{assign.subjectName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Class: {assign.className}</div>
                                    </div>
                                    <button onClick={() => handleRemove(assign.id)} disabled={loading} style={{ cursor: 'pointer', background: '#FEE2E2', color: '#991B1B', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '1rem' }}>No classes assigned yet.</div>
                    )}
                </div>
                
                <div style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', textAlign: 'right', background: '#f8fafc' }}>
                    <button onClick={onClose} style={{ padding: '0.6rem 1.2rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default AssignTeacherModal;
