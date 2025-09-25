import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Toast } from './ui/Toast';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useAppContext();

    if (!toasts.length) {
        return null;
    }

    return (
        <div className="fixed top-20 right-4 z-[100] w-full max-w-sm">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};