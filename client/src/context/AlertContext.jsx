import React, { createContext, useContext, useState, useRef } from 'react';
import AlertModal from '../components/AlertModal';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmLabel: 'OK',
        cancelLabel: null,
        checkboxLabel: null
    });

    const awaitRef = useRef(null);

    const showAlert = ({ title, message, type = 'info', confirmLabel = 'OK', cancelLabel = null, checkboxLabel = null }) => {
        return new Promise((resolve) => {
            setAlertState({
                isOpen: true,
                title,
                message,
                type,
                confirmLabel,
                cancelLabel,
                checkboxLabel
            });
            awaitRef.current = { resolve };
        });
    };

    const handleConfirm = () => {
        if (awaitRef.current) {
            awaitRef.current.resolve(true);
        }
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    const handleClose = () => {
        if (awaitRef.current) {
            awaitRef.current.resolve(false);
        }
        setAlertState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                confirmLabel={alertState.confirmLabel}
                cancelLabel={alertState.cancelLabel}
                checkboxLabel={alertState.checkboxLabel}
            />
        </AlertContext.Provider>
    );
};

export default AlertContext;
