import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../utils/api';

const Register = () => {
    const [role, setRole] = useState('Parent');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.role === 'Admin' || user.role === 'SuperAdmin') navigate('/admin');
            else if (user.role === 'Teacher') navigate('/teacher');
            else if (user.role === 'Parent') navigate('/parent');
            else if (user.role === 'Student') navigate('/student');
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

            await api.post('/auth/register', { role }, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            // Navigation handled by useEffect when user state populates via onAuthStateChanged
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.response?.data?.message || err.message || 'Registration failed.');
            await auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            {/* Animated blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.card}>
                {/* Header */}
                <div style={styles.cardHeader}>
                    <div style={styles.logoRow}>
                        <div style={styles.logoIcon}>🏫</div>
                        <div>
                            <div style={styles.logoTitle}>MahaVidya</div>
                            <div style={styles.logoSub}>ZP School Portal</div>
                        </div>
                    </div>
                </div>

                <div style={styles.headingRow}>
                    <h2 style={styles.heading}>Register Account</h2>
                    <p style={styles.subheading}>Join the ZP School Platform</p>
                </div>

                <div style={styles.body}>
                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleGoogleRegister}>
                        <div style={styles.field}>
                            <label style={styles.label}>I am a...</label>
                            <div style={styles.inputWrap}>
                                <span style={styles.inputIcon}>👤</span>
                                <select 
                                    style={{...styles.input, appearance: 'none'}} 
                                    value={role} 
                                    onChange={e => setRole(e.target.value)}
                                >
                                    <option value="Parent" style={{color: '#000'}}>Parent / Guardian</option>
                                    <option value="Student" style={{color: '#000'}}>Student</option>
                                </select>
                                <span style={{position: 'absolute', right: 14, color: '#8BA8C7', pointerEvents: 'none'}}>▼</span>
                            </div>
                            <small style={styles.helperText}>
                                Selecting your role ensures you get the right dashboard and permissions after login.
                            </small>
                        </div>

                        <button type="submit" style={styles.googleBtn} disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={styles.spinner} /> Registering...
                                </span>
                            ) : (
                                <>
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 20 }} />
                                    <span style={{color: '#333'}}>Register with Google</span>
                                </>
                            )}
                        </button>

                        <div style={styles.loginRow}>
                            <span style={{ color: '#8BA8C7' }}>Already have an account? </span>
                            <Link to="/login" style={styles.loginLink}>Log In Securely →</Link>
                        </div>
                    </form>
                </div>

                {/* Security badge */}
                <div style={styles.securityBadge}>
                    <span>🔒</span> 256-bit encrypted · Powered by Firebase Auth
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, #0d1b3e 0%, #0A1628 60%, #080f1e 100%)',
        zIndex: 1000, overflow: 'hidden',
    },
    blob1: {
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        top: '-150px', left: '-150px', pointerEvents: 'none',
        animation: 'blobPulse 8s ease-in-out infinite',
    },
    blob2: {
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%)',
        bottom: '-100px', right: '-100px', pointerEvents: 'none',
        animation: 'blobPulse 10s ease-in-out infinite reverse',
    },
    blob3: {
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)',
        top: '60%', left: '60%', pointerEvents: 'none',
        animation: 'blobPulse 12s ease-in-out infinite',
    },
    card: {
        position: 'relative', width: '100%', maxWidth: 440, borderRadius: 20,
        background: 'rgba(15, 25, 50, 0.85)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,107,0,0.2)',
        boxShadow: '0 0 60px rgba(255,107,0,0.08), 0 30px 80px rgba(0,0,0,0.5)',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '24px 24px 0',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
    logoIcon: { fontSize: '1.8rem', lineHeight: 1 },
    logoTitle: { fontSize: '1rem', fontWeight: 800, color: '#FF6B00', letterSpacing: '-0.02em' },
    logoSub: { fontSize: '0.68rem', color: '#8BA8C7', textTransform: 'uppercase', letterSpacing: '0.06em' },
    
    headingRow: { padding: '20px 24px 10px', textAlign: 'center' },
    heading: { margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#F0F6FF', letterSpacing: '-0.03em' },
    subheading: { margin: '4px 0 0', color: '#8BA8C7', fontSize: '0.85rem' },
    
    body: { padding: '20px 24px 0' },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.3)',
        borderRadius: 10, color: '#e74c3c', fontSize: '0.82rem', marginBottom: 16,
    },
    field: { marginBottom: 20 },
    label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#8BA8C7', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: 14, fontSize: '1rem', pointerEvents: 'none', zIndex: 1 },
    input: {
        width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, outline: 'none',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#F0F6FF', fontSize: '0.95rem', boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
    },
    helperText: { display: 'block', marginTop: '8px', color: '#6B8Aab', fontSize: '0.75rem', lineHeight: 1.4 },
    
    googleBtn: {
        width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: '#fff', fontSize: '0.95rem', fontWeight: 700,
        boxShadow: '0 4px 14px rgba(0,0,0,0.2)', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'transform 0.1s',
    },
    
    loginRow: { textAlign: 'center', marginBottom: 16, fontSize: '0.85rem', padding: '16px 0 0', borderTop: '1px solid rgba(255,255,255,0.06)' },
    loginLink: { color: '#FF6B00', fontWeight: 700, textDecoration: 'none', marginLeft: 4 },
    
    securityBadge: {
        textAlign: 'center', padding: '14px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.72rem', color: '#4A6278', letterSpacing: '0.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    spinner: {
        display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
        animation: 'spin 0.7s linear infinite',
    },
};

// Inject keyframe animations once
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes blobPulse { 0%,100%{transform:scale(1) translate(0,0)} 50%{transform:scale(1.15) translate(20px,-20px)} }
@keyframes spin { to { transform: rotate(360deg); } }
input:focus { border-color: rgba(255,107,0,0.6) !important; box-shadow: 0 0 0 3px rgba(255,107,0,0.12) !important; }
`;
if (!document.head.querySelector('[data-auth-styles]')) {
    styleTag.setAttribute('data-auth-styles', '1');
    document.head.appendChild(styleTag);
}

export default Register;
