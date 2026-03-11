import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Staff State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Parent State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/login', { username, password });
            if (res.data.success) {
                login(res.data);
                if (res.data.role === 'Admin' || res.data.role === 'SuperAdmin') navigate('/admin');
                else navigate('/teacher');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!phone) return setError('Please enter a phone number');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/otp/send', { phone });
            setOtpSent(true);
            alert(`Demo OTP sent: ${res.data.otp}`); // For testing purposes
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleParentLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/otp/verify', { phone, otp });
            if (res.data.success) {
                login(res.data);
                navigate('/parent');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
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
                            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                <span>{loading ? 'Authenticating...' : 'Sign In Securely'}</span>
                                <i className="fa-solid fa-arrow-right-to-bracket"></i>
                            </button>
                            <p className="text-center mt-sm text-sm text-muted">Demo: <strong>admin</strong> / <strong>admin123</strong> &nbsp;|&nbsp; <strong>teacher</strong> / <strong>teacher123</strong></p>
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

                        {!otpSent ? (
                            <form onSubmit={handleSendOTP}>
                                <div className="form-group">
                                    <label className="form-label">Mobile Number</label>
                                    <div className="input-with-icon">
                                        <i className="fa-solid fa-phone"></i>
                                        <input type="tel" className="form-input" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                                    <span>{loading ? 'Sending...' : 'Send OTP via SMS'}</span>
                                    <i className="fa-solid fa-paper-plane"></i>
                                </button>
                                <p className="text-xs text-muted mt-sm text-center">OTP sent via <strong>Sandes</strong> Government SMS Gateway</p>
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
