import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const Register = () => {
    const [role, setRole] = useState('Parent');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'Admin' || user.role === 'SuperAdmin') navigate('/admin');
            else if (user.role === 'Teacher') navigate('/teacher');
            else if (user.role === 'Parent') navigate('/parent');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const res = await axios.post('http://localhost:8000/api/auth/register', { role }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });

            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.message || err.message || 'Registration failed.');
            auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', background: 'rgba(26, 35, 126, 0.8)' }}>
            <div className="modal-card" style={{ transform: 'translateY(0)', opacity: 1, width: '400px' }}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-primary font-bold">Register Yourself</h2>
                        <p className="text-xs text-muted">Join the ZP School Platform</p>
                    </div>
                </div>

                <div className="modal-panel" style={{ padding: '2rem' }}>
                    {error && (
                        <div className="alert-error" style={{ display: 'flex', marginBottom: '1rem' }}>
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleGoogleRegister}>
                        <div className="form-group mb-md">
                            <label className="form-label" style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem', display: 'block' }}>I am a...</label>
                            <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.8rem', fontSize: '1rem', background: '#f8fafc', border: '1.5px solid var(--border)', borderRadius: '8px', width: '100%' }}>
                                <option value="Parent">Parent / Guardian</option>
                                <option value="Student">Student</option>
                            </select>
                            <small style={{ display: 'block', marginTop: '0.6rem', color: 'var(--muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                                Selecting your role ensures you get the right dashboard and permissions after login.
                            </small>
                        </div>
                        
                        <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '1.5rem', background: '#fff', color: '#333', border: '1px solid #ccc' }}>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                            <span>{loading ? 'Registering...' : 'Register with Google'}</span>
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <span style={{ color: 'var(--muted)' }}>Already have an account? </span>
                        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
