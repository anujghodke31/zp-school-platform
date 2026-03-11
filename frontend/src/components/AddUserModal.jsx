import React, { useState } from 'react';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose, type, onUserAdded }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Shared state
    const [name, setName] = useState('');

    // Student Form State
    const [rollNo, setRollNo] = useState('');
    const [className, setClassName] = useState('');
    const [parentPhone, setParentPhone] = useState('');

    // Staff Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Teacher');
    const [contactNumber, setContactNumber] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (type === 'student') {
                const payload = { roll_no: rollNo, name, className, parent_phone: parentPhone };
                await axios.post('http://localhost:8000/api/data/students', payload, config);
            } else {
                const payload = { username, password, name, role, contactNumber };
                await axios.post('http://localhost:8000/api/data/staff', payload, config);
            }

            onUserAdded();
            onClose();
            // Reset state
            setName(''); setRollNo(''); setClassName(''); setParentPhone('');
            setUsername(''); setPassword(''); setRole('Teacher'); setContactNumber('');

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add user. Check permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000 }}>
            <div className="modal-card" style={{ transform: 'translateY(0)', opacity: 1, width: '500px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-primary font-bold">{type === 'student' ? 'Enroll New Student' : 'Register New Staff'}</h2>
                    </div>
                    <button onClick={onClose} className="icon-btn" aria-label="Close"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="modal-panel" style={{ padding: '1.5rem' }}>
                    {error && (
                        <div className="alert-error" style={{ display: 'flex', marginBottom: '1rem' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-sm">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        {type === 'student' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group mb-sm">
                                        <label className="form-label">Roll Number</label>
                                        <input type="text" className="form-input" value={rollNo} onChange={e => setRollNo(e.target.value)} required />
                                    </div>
                                    <div className="form-group mb-sm">
                                        <label className="form-label">Class Section</label>
                                        <input type="text" className="form-input" placeholder="e.g. 7A" value={className} onChange={e => setClassName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group mb-lg">
                                    <label className="form-label">Parent Mobile Number (10 Digits)</label>
                                    <input type="text" className="form-input" placeholder="9876543210" value={parentPhone} onChange={e => setParentPhone(e.target.value)} required />
                                    <small className="text-muted" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>This number acts as the Parent login credential.</small>
                                </div>
                            </>
                        )}

                        {type === 'staff' && (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group mb-sm">
                                        <label className="form-label">System Role</label>
                                        <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
                                            <option value="Teacher">Teacher</option>
                                            <option value="Admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-sm">
                                        <label className="form-label">Employee ID / Username</label>
                                        <input type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-lg">
                                    <div className="form-group mb-sm">
                                        <label className="form-label">Temporary Password</label>
                                        <input type="password" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                                    </div>
                                    <div className="form-group mb-sm">
                                        <label className="form-label">Contact Number</label>
                                        <input type="text" className="form-input" value={contactNumber} onChange={e => setContactNumber(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <i className="fa-solid fa-plus"></i>
                                <span>{loading ? 'Processing...' : 'Add Record'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
