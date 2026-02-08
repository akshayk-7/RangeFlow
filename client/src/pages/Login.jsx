import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(username, password);
            if (userData.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            padding: '20px',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* CSS Animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes float {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-6px); }
                        100% { transform: translateY(0); }
                    }
                    .login-card { 
                         display: flex;
                         width: 100%;
                         max-width: 960px;
                         background-color: white;
                         border-radius: 24px;
                         box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                         overflow: hidden;
                         min-height: 640px;
                         animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                    }
                    .login-panel-left {
                        flex: 1;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        padding: 60px;
                        overflow: hidden;
                    }
                    .login-panel-right {
                        flex: 1.2;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        padding: 80px;
                    }
                    
                    /* Responsive Adjustments */
                    @media (max-width: 768px) {
                        .login-card {
                            flex-direction: column;
                            min-height: auto;
                        }
                        .login-panel-left {
                            padding: 40px;
                            min-height: 200px;
                        }
                        .login-panel-right {
                            padding: 40px 24px;
                        }
                    }

                    .logo-float { animation: float 6s ease-in-out infinite; }
                    .input-field:focus {
                        border-color: #6366f1;
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    }
                    .primary-btn {
                        transform: translateY(0);
                        transition: all 0.2s;
                    }
                    .primary-btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
                    }
                    .primary-btn:active {
                        transform: translateY(0) scale(0.98);
                    }
                    .password-toggle {
                        position: absolute;
                        right: 12px;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        color: #9ca3af;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 4px;
                        transition: color 0.2s ease;
                        z-index: 10;
                    }
                    .password-toggle:hover {
                        color: #4f46e5;
                    }
                `}
            </style>

            <div className="login-card">
                {/* Left Side - Branding */}
                <div className="login-panel-left">
                    {/* Subtle Noise/Texture Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        opacity: 0.4,
                        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)'
                    }} />

                    <div style={{ position: 'relative', textAlign: 'center', width: '100%', zIndex: 10 }}>
                        {/* Glass Container for Logo */}
                        <div className="logo-float" style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(12px)',
                            padding: '40px',
                            borderRadius: '32px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'inline-block',
                            marginBottom: '32px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}>
                            <img
                                src="/assets/phadke_logo.png"
                                alt="AVP Logo"
                                style={{
                                    width: '100%',
                                    maxWidth: '220px',
                                    height: 'auto',
                                    display: 'block',
                                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                                }}
                            />
                        </div>

                        <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '15px', fontWeight: '500', letterSpacing: '0.02em' }}>
                            Internal Task & Range Management System
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="login-panel-right">
                    <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>

                        <div style={{ marginBottom: '48px' }}>
                            <h1 style={{
                                fontSize: '36px',
                                fontWeight: '800',
                                color: '#111827',
                                marginBottom: '12px',
                                letterSpacing: '-0.03em'
                            }}>
                                Welcome Back.
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.5' }}>
                                Please login to access your account dashboard.
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                color: '#991b1b',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '32px',
                                fontSize: '14px',
                                border: '1px solid #fee2e2',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Username
                                </label>
                                <input
                                    className="input-field"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        outline: 'none',
                                        fontSize: '15px',
                                        transition: 'all 0.2s',
                                        backgroundColor: '#f9fafb',
                                        color: '#1f2937'
                                    }}
                                    placeholder="Enter your range username"
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151'
                                }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input-field"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            paddingRight: '25px',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e7eb',
                                            outline: 'none',
                                            fontSize: '15px',
                                            transition: 'all 0.2s',
                                            backgroundColor: '#f9fafb',
                                            color: '#1f2937'
                                        }}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setShowPassword(!showPassword)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                setShowPassword(!showPassword);
                                            }
                                        }}
                                        className="password-toggle"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
                                <span style={{
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                }}>
                                    Contact administrator for access issues
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="primary-btn"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1)'
                                }}
                            >
                                Sign In
                            </button>
                        </form>

                        <div style={{ marginTop: '60px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                                Internal Office System &copy; {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
