import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isDangerous = true,
    requireCheckbox = false,
    checkboxText = "I understand this action is irreversible",
    theme
}) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

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
        }, 200); // Match animation duration
    };

    const handleConfirm = () => {
        if (requireCheckbox && !isChecked) return;
        onConfirm();
    };

    if (!isOpen && !isClosing) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme?.modalOverlay || 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.2s ease-out'
    };

    const modalStyle = {
        backgroundColor: theme?.modalBg || 'white',
        color: theme?.text || 'black',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${theme?.border || '#e5e7eb'}`,
        transform: isClosing ? 'scale(0.95)' : 'scale(1)',
        opacity: isClosing ? 0 : 1,
        transition: 'all 0.2s ease-out',
        position: 'relative',
        margin: '16px'
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '16px'
    };

    const iconContainerStyle = {
        backgroundColor: isDangerous ? '#fee2e2' : '#f3f4f6',
        color: isDangerous ? '#dc2626' : '#4b5563',
        padding: '10px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: '700',
        color: theme?.text || '#111827',
        margin: '0 0 8px 0',
        lineHeight: '1.4'
    };

    const messageStyle = {
        fontSize: '14px',
        color: theme?.subText || '#6b7280',
        margin: 0,
        lineHeight: '1.5'
    };

    const checkboxContainerStyle = {
        marginTop: '20px',
        backgroundColor: theme?.hover || '#f9fafb',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${theme?.border || '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const buttonContainerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px'
    };

    const btnBase = {
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        border: 'none',
        transition: 'all 0.2s'
    };

    const cancelBtnStyle = {
        ...btnBase,
        backgroundColor: 'transparent',
        color: theme?.text || '#374151',
        border: `1px solid ${theme?.border || '#d1d5db'}`
    };

    const isConfirmDisabled = (requireCheckbox && !isChecked);

    const confirmBtnStyle = {
        ...btnBase,
        backgroundColor: isDangerous ? '#dc2626' : '#4f46e5',
        color: 'white',
        opacity: isConfirmDisabled ? 0.5 : 1,
        cursor: isConfirmDisabled ? 'not-allowed' : 'pointer'
    };

    return (
        <div style={overlayStyle} onClick={handleClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div style={iconContainerStyle}>
                        {isDangerous ? <AlertTriangle size={24} /> : <Trash2 size={24} />}
                    </div>
                    <div>
                        <h3 style={titleStyle}>{title}</h3>
                        <p style={messageStyle}>{message}</p>
                    </div>
                </div>

                {requireCheckbox && (
                    <div style={checkboxContainerStyle}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            id="confirm-check"
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label
                            htmlFor="confirm-check"
                            style={{ fontSize: '13px', color: theme?.text, cursor: 'pointer', userSelect: 'none' }}
                        >
                            {checkboxText}
                        </label>
                    </div>
                )}



                <div style={buttonContainerStyle}>
                    <button
                        onClick={handleClose}
                        style={cancelBtnStyle}
                        onMouseEnter={(e) => e.target.style.backgroundColor = theme?.hover || '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={confirmBtnStyle}
                        disabled={isConfirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
