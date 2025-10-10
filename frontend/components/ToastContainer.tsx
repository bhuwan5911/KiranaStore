// src/components/ToastContainer.tsx
import React, { useState, useEffect } from "react";
import { Toast } from "./ui/Toast";

interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContainerProps {
  setAddToast: (fn: (message: string, type: ToastMessage["type"]) => void) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ setAddToast }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage["type"]) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    setAddToast(addToast);
  }, [setAddToast]);

  return (
    <div className="fixed top-5 right-5 flex flex-col gap-2 z-[9999]">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};
