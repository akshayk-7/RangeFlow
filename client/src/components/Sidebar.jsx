import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, toggleSidebar, isDarkMode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'ranges', label: 'Manage Ranges', icon: '🏢' },
        { id: 'notes', label: 'All Notes', icon: '📝' },
        { id: 'reset-password', label: 'Reset Password', icon: '🔒' },
    ];

    const handleItemClick = (id) => {
        if (id === 'reset-password') {
            navigate('/admin/reset-password');
        } else {
            // For dashboard tabs
            if (location.pathname === '/admin') {
                if (setActiveTab) setActiveTab(id);
            } else {
                navigate('/admin');
            }
        }
    };

    const bgColor = isDarkMode ? '#1f2937' : 'white';
    const textColor = isDarkMode ? '#f3f4f6' : '#111827';
    const subTextColor = isDarkMode ? '#9ca3af' : '#4b5563';
    const borderColor = isDarkMode ? '#374151' : '#e5e7eb';
    const activeColor = '#4f46e5'; // Keep brand color
    const activeText = isDarkMode ? '#818cf8' : '#2563eb';

    return (
        <div style={{
            width: isOpen ? '260px' : '80px',
            backgroundColor: bgColor,
            borderRight: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s, border-color 0.3s',
            zIndex: 40,
            overflow: 'hidden',
            boxShadow: isDarkMode ? 'none' : '4px 0 24px rgba(0,0,0,0.02)'
        }}>
            {/* Header */}
            <div style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                borderBottom: `1px solid ${borderColor}`,
                justifyContent: isOpen ? 'space-between' : 'center',
                whiteSpace: 'nowrap',
                transition: 'border-color 0.3s'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', overflow: 'hidden' }} onClick={toggleSidebar}>
                    <div style={{
                        minWidth: '32px', height: '32px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '16px',
                        flexShrink: 0
                    }}>
                        A
                    </div>

                    <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: textColor,
                        opacity: isOpen ? 1 : 0,
                        transition: 'opacity 0.2s, color 0.3s',
                        pointerEvents: isOpen ? 'auto' : 'none'
                    }}>
                        Admin<span style={{ color: '#4f46e5' }}>Portal</span>
                    </span>
                </div>

                {isOpen && (
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: subTextColor,
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'color 0.3s'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>☰</span>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ padding: '24px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        title={!isOpen ? item.label : ''}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: activeTab === item.id ? (isDarkMode ? 'rgba(79, 70, 229, 0.15)' : '#eff6ff') : 'transparent',
                            color: activeTab === item.id ? activeText : subTextColor,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            position: 'relative',
                            justifyContent: isOpen ? 'flex-start' : 'center'
                        }}
                        onMouseOver={e => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb';
                                e.currentTarget.style.color = textColor;
                            }
                        }}
                        onMouseOut={e => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = subTextColor;
                            }
                        }}
                    >
                        <span style={{ fontSize: '20px', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>

                        <span style={{
                            fontSize: '15px',
                            fontWeight: activeTab === item.id ? '600' : '500',
                            whiteSpace: 'nowrap',
                            opacity: isOpen ? 1 : 0,
                            width: isOpen ? 'auto' : 0,
                            overflow: 'hidden',
                            transition: 'all 0.2s'
                        }}>
                            {item.label}
                        </span>

                        {activeTab === item.id && !isOpen && (
                            <div style={{
                                position: 'absolute',
                                right: '-8px',
                                width: '4px',
                                height: '20px',
                                backgroundColor: activeColor,
                                borderRadius: '4px'
                            }} />
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer / Sign Out */}
            <div style={{ padding: '24px 12px', borderTop: `1px solid ${borderColor}`, transition: 'border-color 0.3s' }}>
                <button
                    onClick={onLogout}
                    title={!isOpen ? 'Sign Out' : ''}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid transparent',
                        backgroundColor: isOpen ? (isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fff1f2') : 'transparent',
                        color: '#ef4444', // slightly brighter red for dark mode compatibility
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        justifyContent: isOpen ? 'flex-start' : 'center'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = isOpen ? (isDarkMode ? 'rgba(220, 38, 38, 0.1)' : '#fff1f2') : 'transparent'}
                >
                    <span style={{ fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>🚪</span>
                    <span style={{
                        whiteSpace: 'nowrap',
                        opacity: isOpen ? 1 : 0,
                        width: isOpen ? 'auto' : 0,
                        overflow: 'hidden',
                        transition: 'all 0.2s'
                    }}>
                        Sign Out
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
