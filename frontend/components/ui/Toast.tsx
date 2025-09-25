import React, { useEffect } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="text-green-500" />,
  info: <Info className="text-blue-500" />,
  error: <AlertCircle className="text-red-500" />,
};

const colors = {
    success: 'bg-green-50 border-green-400 text-green-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    error: 'bg-red-50 border-red-400 text-red-800',
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
    <div
      className={`relative flex items-start p-4 mb-4 rounded-lg border shadow-lg max-w-sm w-full animate-fade-in-right ${colors[type]}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 rounded-md hover:bg-black/10 transition-colors"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};