import { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [loginInput, setLoginInput] = useState(''); // Username or Email
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/forgotpassword', { loginInput });
            setMessage(data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
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
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(12px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .forgot-card { 
                         display: flex;
                         flex-direction: column;
                         width: 100%;
                         max-width: 480px;
                         background-color: white;
                         border-radius: 24px;
                         box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                         overflow: hidden;
                         animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                         padding: 40px;
                    }
                    .input-field:focus {
                        border-color: #6366f1;
                        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
                    }
                `}
            </style>

            <div className="forgot-card">
                <Link to="/login" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: '#6b7280',
                    textDecoration: 'none',
                    marginBottom: '32px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} />
                    Back to Login
                </Link>

                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: '#e0e7ff',
                        color: '#4f46e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <Mail size={24} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                        Forgot password?
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.5' }}>
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                {message ? (
                    <div style={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        border: '1px solid #d1fae5',
                        fontWeight: '500',
                        marginBottom: '24px'
                    }}>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fef2f2',
                                color: '#991b1b',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '14px',
                                border: '1px solid #fee2e2',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                                Username or Email
                            </label>
                            <input
                                className="input-field"
                                type="text"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    outline: 'none',
                                    fontSize: '15px',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f9fafb',
                                    color: '#1f2937'
                                }}
                                placeholder="Enter your username or email"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1,
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
