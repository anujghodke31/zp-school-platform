import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, Smartphone, Loader2 } from 'lucide-react';

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

    const handleSendOTP = async () => {
        if (!phone) return setError('Please enter a phone number');
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/otp/send', { phone });
            setOtpSent(true);
            alert(`Dummy OTP sent: ${res.data.otp}`); // For testing purposes
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
        <div className="login-overlay active" style={{ position: 'relative', height: '100vh', display: 'flex' }}>
            <div className="login-modal glow" style={{ margin: 'auto' }}>
                <div className="login-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('staff'); setError(''); }}
                    >
                        <KeyRound size={16} /> Staff Login
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'parent' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('parent'); setError(''); }}
                    >
                        <Smartphone size={16} /> Parent Login
                    </button>
                </div>

                {error && <div style={{ color: '#FF4D4D', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

                {activeTab === 'staff' ? (
                    <form onSubmit={handleStaffLogin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : 'Secure Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleParentLogin}>
                        <div className="form-group">
                            <label>Registered Mobile Number</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="tel"
                                    placeholder="10-digit number"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={otpSent}
                                    style={{ flex: 1 }}
                                />
                                {!otpSent && (
                                    <button
                                        type="button"
                                        className="login-submit"
                                        style={{ width: 'auto', padding: '0 1rem', marginTop: 0 }}
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                    >
                                        Get OTP
                                    </button>
                                )}
                            </div>
                        </div>

                        {otpSent && (
                            <div className="form-group slide-in">
                                <label>Enter OTP</label>
                                <input
                                    type="text"
                                    placeholder="6-digit verification code"
                                    required
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                <button type="submit" className="login-submit" style={{ marginTop: '1.5rem' }} disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                                </button>
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
