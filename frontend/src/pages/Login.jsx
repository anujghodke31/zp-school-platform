import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Login = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Staff State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Parent State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Navigate on successful login
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
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Add domain for username if it's not an email
            const email = username.includes('@') ? username : `${username}@zp.local`;
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation handled by useEffect when user state populates
        } catch (err) {
            setError('Login failed. Please check your credentials.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                auth.signOut();
                setError('Account not found. Please Register first.');
                setLoading(false);
                return;
            }
            // Navigation handled by useEffect
        } catch (err) {
            console.error('Google Sign-In Error:', err);
            setError(`Google Sign-In failed: ${err.message || err.code || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            auth.useDeviceLanguage();
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!phone) return setError('Please enter a phone number');
        setError('');
        setLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const phoneNumber = phone.startsWith('+') ? phone : `+91${phone}`;
            
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to send OTP');
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleParentLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await window.confirmationResult.confirm(otp);
            // Navigation handled by useEffect
        } catch (err) {
            setError('Invalid OTP');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', opacity: 1, visibility: 'visible', background: 'rgba(26, 35, 126, 0.8)' }}>
            <div className="modal-card" style={{ transform: 'translateY(0)', opacity: 1 }}>
                <div className="modal-header">
                    <div>
                        <h2 className="text-primary font-bold">Secure Portal Login</h2>
                        <p className="text-xs text-muted">Teachers, Principals & Administrators</p>
                    </div>
                    <button onClick={() => navigate('/')} className="icon-btn" aria-label="Close"><i className="fa-solid fa-xmark"></i></button>
                </div>

                <div className="modal-tabs" role="tablist">
                    <button className={`modal-tab ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => { setActiveTab('staff'); setError(''); }}>
                        <i className="fa-solid fa-id-card"></i> Staff Login
                    </button>
                    <button className={`modal-tab ${activeTab === 'otp' ? 'active' : ''}`} onClick={() => { setActiveTab('otp'); setError(''); }}>
                        <i className="fa-solid fa-mobile-screen"></i> Parent OTP
                    </button>
                </div>

                {activeTab === 'staff' && (
                    <div className="modal-panel">
                        {error && (
                            <div className="alert-error" style={{ display: 'flex' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleStaffLogin}>
                            <div className="form-group">
                                <label className="form-label">Username / Employee ID</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-user"></i>
                                    <input type="text" className="form-input" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-with-icon">
                                    <i className="fa-solid fa-lock"></i>
                                    <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading} style={{ marginBottom: '1rem' }}>
                                <span>{loading ? 'Authenticating...' : 'Sign In Securely'}</span>
                                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            </button>
                            
                            <div className="divider" style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
                                <hr style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                                <span style={{ padding: '0 10px' }}>OR</span>
                                <hr style={{ flex: 1, borderTop: '1px solid var(--border)' }} />
                            </div>

                            <button type="button" className="btn w-100 btn-lg" onClick={handleGoogleSignIn} disabled={loading} style={{ background: '#fff', color: '#333', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
                                <span>Sign in with Google</span>
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                                <span style={{ color: 'var(--muted)' }}>Don't have an account? </span>
                                <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Register Here</Link>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'otp' && (
                    <div className="modal-panel">
                        {error && (
                            <div className="alert-error" style={{ display: 'flex' }}>
                                <i className="fa-solid fa-triangle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div id="recaptcha-container"></div>

                        {!otpSent ? (
                            <form onSubmit={handleSendOTP}>
                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <div className="input-with-icon">
                                        <i className="fa-solid fa-phone"></i>
                                        <input type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
                                    </div>
                                </div>
                                <button type="submit" id="sign-in-button" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    <span>{loading ? 'Sending...' : 'Send OTP via SMS'}</span>
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                                <p className="text-xs text-muted mt-sm text-center">OTP sent via <strong>Firebase Auth</strong> Secure Gateway</p>
                            </form>
                        ) : (
                            <form onSubmit={handleParentLogin}>
                                <p className="text-sm mb-md text-primary"><i className="fa-solid fa-check-circle"></i> OTP sent to your mobile.</p>
                                <div className="form-group">
                                    <label className="form-label">Enter 6-digit OTP</label>
                                    <input type="text" className="form-input text-center font-bold" placeholder="· · · · · ·" maxLength="6" style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }} value={otp} onChange={e => setOtp(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    <span>{loading ? 'Verifying...' : 'Verify & Enter Portal'}</span>
                                    <i className="fa-solid fa-shield-check"></i>
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
