import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { Lock, User, CheckCircle, AlertTriangle } from 'lucide-react';
import RangeService from '../services/rangeService';

const API = import.meta.env.VITE_API_URL;

const AdminResetPassword = () => {
    const { user } = useContext(AuthContext);
    const [ranges, setRanges] = useState([]);
    const [selectedRange, setSelectedRange] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Theme (Reuse logic or context if available, hardcoding for now based on AdminDashboard)
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    const theme = {
        bg: isDarkMode ? '#111827' : '#f3f4f6',
        text: isDarkMode ? '#f3f4f6' : '#111827',
        subText: isDarkMode ? '#9ca3af' : '#6b7280',
        cardBg: isDarkMode ? '#1f2937' : 'white',
        border: isDarkMode ? '#374151' : '#e5e7eb',
        inputBg: isDarkMode ? '#374151' : '#f9fafb'
    };

    useEffect(() => {
        loadRanges();
    }, []);

    const loadRanges = async () => {
        try {
            const data = await RangeService.getRanges();
            setRanges(data);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }



        if (!selectedRange) {
            toast.error('Please select a user');
            return;
        }

        setIsLoading(true);
        try {
            const token = user.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post(`${API}/api/ranges/reset-password`, {
                userId: selectedRange,
                newPassword
            }, config);

            toast.success('Password reset successfully');
            setNewPassword('');
            setConfirmPassword('');
            setSelectedRange('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: theme.bg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} activeTab="reset-password" />

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>

                    <div style={{ marginBottom: '32px' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Reset User Password</h1>
                        <p style={{ color: theme.subText }}>Securely reset credentials for any user.</p>
                    </div>

                    <div style={{
                        backgroundColor: theme.cardBg,
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${theme.border}`
                    }}>
                        <div style={{
                            backgroundColor: '#fff7ed',
                            color: '#c2410c',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            border: '1px solid #ffedd5',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Warning:</strong> This will immediately invalidate the user's current password.
                                They will be forced to change it upon next login.
                            </div>
                        </div>

                        <form onSubmit={handleReset}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                                    Select User
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.subText }} />
                                    <select
                                        value={selectedRange}
                                        onChange={(e) => setSelectedRange(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.border}`,
                                            backgroundColor: theme.inputBg,
                                            color: theme.text,
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                        required
                                    >
                                        <option value="">-- Select a User --</option>
                                        {ranges.map(range => (
                                            <option key={range._id} value={range._id}>
                                                {range.rangeName} ({range.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                                    New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.subText }} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.border}`,
                                            backgroundColor: theme.inputBg,
                                            color: theme.text,
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                                    Confirm New Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: theme.subText }} />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 14px 14px 44px',
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.border}`,
                                            backgroundColor: theme.inputBg,
                                            color: theme.text,
                                            outline: 'none',
                                            fontSize: '15px'
                                        }}
                                        placeholder="Re-enter password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.7 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                }}
                            >
                                {isLoading ? 'Resetting...' : <><CheckCircle size={20} /> Reset Password</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default AdminResetPassword;
