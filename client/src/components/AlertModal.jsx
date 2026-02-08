import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const AlertModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info', // 'info', 'success', 'warning', 'error'
    confirmLabel = 'OK',
    cancelLabel,
    checkboxLabel,
    onConfirm
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setIsChecked(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 200);
    };

    const handleConfirm = () => {
        setIsClosing(true);
        setTimeout(() => {
            if (onConfirm) onConfirm();
            onClose();
            setIsClosing(false);
        }, 200);
    };

    if (!isOpen && !isClosing) return null;

    // Theme & Styles
    const getTheme = () => {
        switch (type) {
            case 'success': return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle size={28} /> };
            case 'error': return { color: '#ef4444', bg: '#fef2f2', icon: <XCircle size={28} /> };
            case 'warning': return { color: '#f59e0b', bg: '#fffbeb', icon: <AlertCircle size={28} /> };
            default: return { color: '#3b82f6', bg: '#eff6ff', icon: <Info size={28} /> };
        }
    };

    const theme = getTheme();

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '400px',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: isClosing ? 'scale(0.95)' : 'scale(1)',
        opacity: isClosing ? 0 : 1,
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        margin: '16px',
        border: '1px solid rgba(0,0,0,0.05)'
    };

    const btnBase = {
        padding: '10px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        flex: 1,
        transition: 'all 0.2s'
    };

    return (
        <div style={overlayStyle} onClick={cancelLabel ? handleClose : undefined}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

                    <div style={{
                        marginBottom: '16px',
                        color: theme.color,
                        backgroundColor: theme.bg,
                        padding: '12px',
                        borderRadius: '50%'
                    }}>
                        {theme.icon}
                    </div>

                    <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827'
                    }}>
                        {title}
                    </h3>

                    <p style={{
                        margin: '0 0 24px 0',
                        fontSize: '15px',
                        color: '#6b7280',
                        lineHeight: '1.5'
                    }}>
                        {message}
                    </p>



                    {checkboxLabel && (
                        <div style={{
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left',
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <input
                                type="checkbox"
                                id="alert-checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer',
                                    accentColor: type === 'error' ? '#dc2626' : '#4f46e5'
                                }}
                            />
                            <label
                                htmlFor="alert-checkbox"
                                style={{
                                    fontSize: '14px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    fontWeight: '500'
                                }}
                            >
                                {checkboxLabel}
                            </label>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        {cancelLabel && (
                            <button
                                onClick={handleClose}
                                style={{
                                    ...btnBase,
                                    backgroundColor: 'transparent',
                                    border: '1px solid #e5e7eb',
                                    color: '#374151'
                                }}
                                onMouseEnter={e => e.target.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                            >
                                {cancelLabel}
                            </button>
                        )}

                        <button
                            onClick={handleConfirm}
                            disabled={checkboxLabel && !isChecked}
                            style={{
                                ...btnBase,
                                backgroundColor: checkboxLabel && !isChecked
                                    ? '#e5e7eb'
                                    : (type === 'error' ? '#dc2626' : '#4f46e5'),
                                color: checkboxLabel && !isChecked ? '#9ca3af' : 'white',
                                cursor: checkboxLabel && !isChecked ? 'not-allowed' : 'pointer',
                                boxShadow: (checkboxLabel && !isChecked) ? 'none' : (type === 'error'
                                    ? '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
                                    : '0 4px 6px -1px rgba(79, 70, 229, 0.3)')
                            }}
                            onMouseEnter={e => {
                                if (!(checkboxLabel && !isChecked)) {
                                    e.target.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                        >
                            {confirmLabel}
                        </button>
                    </div>

                </div>
            </div>
        </div >
    );
};

export default AlertModal;
