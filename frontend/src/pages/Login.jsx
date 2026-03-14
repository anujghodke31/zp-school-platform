import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    signInWithEmailAndPassword, RecaptchaVerifier,
    signInWithPhoneNumber, signInWithPopup, GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../utils/api';

const Login = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    useEffect(() => {
        if (user) {
            if (user.role === 'Admin' || user.role === 'SuperAdmin') navigate('/admin');
            else if (user.role === 'Teacher') navigate('/teacher');
            else if (user.role === 'Parent') navigate('/parent');
            else if (user.role === 'Student') navigate('/student');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleStaffLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            const email = username.includes('@') ? username : `${username}@zp.local`;
            await signInWithEmailAndPassword(auth, email, password);
        } catch {
            setError('Invalid credentials. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError(''); setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // Get the Firebase ID token and verify via backend (Admin SDK — no offline issues)
            const idToken = await result.user.getIdToken();
            try {
                await api.get('/auth/me', { headers: { Authorization: `Bearer ${idToken}` } });
                // If OK — AuthContext will pick up the user via onAuthStateChanged
            } catch {
                // User not registered in our system
                await auth.signOut();
                setError('Account not found. Please register first.');
                setLoading(false);
            }
        } catch (err) {
            setError(`Google Sign-In failed: ${err.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            auth.useDeviceLanguage();
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', { size: 'invisible' });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault(); if (!phone) return setError('Enter a phone number.'); setError(''); setLoading(true);
        try {
            setupRecaptcha();
            const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
            const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            window.confirmationResult = result; setOtpSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
            if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
        } finally { setLoading(false); }
    };

    const handleParentLogin = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await window.confirmationResult.confirm(otp); }
        catch { setError('Invalid OTP. Please try again.'); setLoading(false); }
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
                    <button onClick={() => navigate('/')} style={styles.closeBtn} aria-label="Close">✕</button>
                </div>

                <div style={styles.headingRow}>
                    <h2 style={styles.heading}>Welcome Back</h2>
                    <p style={styles.subheading}>Sign in to access your portal</p>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {[['staff', '🪪', 'Staff Login'], ['otp', '📱', 'Parent OTP']].map(([id, icon, label]) => (
                        <button key={id} style={{ ...styles.tab, ...(activeTab === id ? styles.tabActive : {}) }}
                            onClick={() => { setActiveTab(id); setError(''); }}>
                            <span>{icon}</span> {label}
                        </button>
                    ))}
                </div>

                <div style={styles.body}>
                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* Staff Tab */}
                    {activeTab === 'staff' && (
                        <form onSubmit={handleStaffLogin}>
                            <div style={styles.field}>
                                <label style={styles.label}>Username / Employee ID</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>👤</span>
                                    <input style={styles.input} type="text" placeholder="e.g. admin or principal01"
                                        value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>🔒</span>
                                    <input style={styles.input} type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)} required />
                                    <button type="button" style={styles.eyeBtn} onClick={() => setShowPass(s => !s)}>
                                        {showPass ? '🙈' : '👁'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                        <span style={styles.spinner} /> Authenticating…
                                    </span>
                                ) : '🔐 Sign In Securely'}
                            </button>

                            <div style={styles.divider}><span style={styles.dividerLine} /><span style={styles.dividerText}>OR</span><span style={styles.dividerLine} /></div>

                            <button type="button" onClick={handleGoogleSignIn} style={styles.googleBtn} disabled={loading}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 20 }} />
                                <span>Continue with Google</span>
                            </button>

                            <div style={styles.registerRow}>
                                <span style={{ color: '#8BA8C7' }}>New to ZP? </span>
                                <Link to="/register" style={styles.registerLink}>Create Account →</Link>
                            </div>
                        </form>
                    )}

                    {/* Parent OTP Tab */}
                    {activeTab === 'otp' && (
                        <div>
                            <div id="recaptcha-container" />
                            {!otpSent ? (
                                <form onSubmit={handleSendOTP}>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Parent's Mobile Number</label>
                                        <div style={styles.inputWrap}>
                                            <span style={styles.inputIcon}>📞</span>
                                            <input style={styles.input} type="tel" placeholder="+91 98765 43210"
                                                value={phone} onChange={e => setPhone(e.target.value)} required />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: '#8BA8C7', marginBottom: 16, textAlign: 'center' }}>
                                        OTP will be sent via Firebase Auth Secure Gateway
                                    </p>
                                    <button type="submit" id="sign-in-button" style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
                                        {loading ? '📤 Sending…' : '📨 Send OTP'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleParentLogin}>
                                    <div style={{ ...styles.errorBox, background: '#27ae6015', borderColor: '#27ae6040', color: '#27ae60', marginBottom: 16 }}>
                                        ✅ OTP sent to your mobile number
                                    </div>
                                    <div style={styles.field}>
                                        <label style={styles.label}>Enter 6-digit OTP</label>
                                        <input style={{ ...styles.input, textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.6rem', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,107,0,0.5)', borderRadius: 12, color: '#F0F6FF', width: '100%', boxSizing: 'border-box' }}
                                            type="text" placeholder="· · · · · ·" maxLength={6}
                                            value={otp} onChange={e => setOtp(e.target.value)} required />
                                    </div>
                                    <button type="submit" style={{ ...styles.primaryBtn, opacity: loading ? 0.75 : 1 }} disabled={loading}>
                                        {loading ? '🔄 Verifying…' : '🛡 Verify & Enter Portal'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 24px 0',
    },
    logoRow: { display: 'flex', alignItems: 'center', gap: 12 },
    logoIcon: { fontSize: '1.8rem', lineHeight: 1 },
    logoTitle: { fontSize: '1rem', fontWeight: 800, color: '#FF6B00', letterSpacing: '-0.02em' },
    logoSub: { fontSize: '0.68rem', color: '#8BA8C7', textTransform: 'uppercase', letterSpacing: '0.06em' },
    closeBtn: {
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#8BA8C7', width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
        fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
    },
    headingRow: { padding: '20px 24px 0', textAlign: 'center' },
    heading: { margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#F0F6FF', letterSpacing: '-0.03em' },
    subheading: { margin: '4px 0 0', color: '#8BA8C7', fontSize: '0.85rem' },
    tabs: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
        margin: '20px 24px 0', padding: 4,
        background: 'rgba(255,255,255,0.04)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
    },
    tab: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
        fontSize: '0.82rem', fontWeight: 600, color: '#8BA8C7', background: 'transparent',
        transition: 'all 0.25s',
    },
    tabActive: {
        background: 'linear-gradient(135deg, #FF6B00, #FF8C2A)',
        color: '#fff', boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
    },
    body: { padding: '20px 24px 0' },
    errorBox: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        background: 'rgba(231,76,60,0.12)', border: '1px solid rgba(231,76,60,0.3)',
        borderRadius: 10, color: '#e74c3c', fontSize: '0.82rem', marginBottom: 16,
    },
    field: { marginBottom: 16 },
    label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#8BA8C7', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: 14, fontSize: '1rem', pointerEvents: 'none', zIndex: 1 },
    input: {
        width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, outline: 'none',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#F0F6FF', fontSize: '0.9rem', boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    eyeBtn: {
        position: 'absolute', right: 14, background: 'transparent', border: 'none',
        cursor: 'pointer', fontSize: '1rem', color: '#8BA8C7',
    },
    primaryBtn: {
        width: '100%', padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C2A 100%)',
        color: '#fff', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.01em',
        boxShadow: '0 6px 20px rgba(255,107,0,0.35)', marginBottom: 16,
        transition: 'transform 0.15s, box-shadow 0.15s',
    },
    divider: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' },
    dividerText: { color: '#4A6278', fontSize: '0.78rem', fontWeight: 600 },
    googleBtn: {
        width: '100%', padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
        color: '#F0F6FF', fontSize: '0.9rem', fontWeight: 600, marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'background 0.2s',
    },
    registerRow: { textAlign: 'center', marginBottom: 16, fontSize: '0.85rem' },
    registerLink: { color: '#FF6B00', fontWeight: 700, textDecoration: 'none', marginLeft: 4 },
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
if (!document.head.querySelector('[data-login-styles]')) {
    styleTag.setAttribute('data-login-styles', '1');
    document.head.appendChild(styleTag);
}

export default Login;
