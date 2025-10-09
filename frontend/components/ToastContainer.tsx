import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Toast } from './ui/Toast';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useAppContext();

    if (!toasts.length) {
        return null;
    }

    return (
        // ✅ FIX: z-index badhaya gaya hai aur positioning ko mobile ke liye adjust kiya gaya hai.
        // 'top-24 sm:top-20' -> Mobile par header ke neeche aur desktop par bhi sahi jagah.
        // 'z-[9999]' -> Yeh ensure karega ki toast hamesha sabse upar dikhe.
        <div className="fixed top-24 sm:top-20 right-0 sm:right-4 z-[9999] w-full max-w-sm px-4 sm:px-0">
            <div className="space-y-2">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
};