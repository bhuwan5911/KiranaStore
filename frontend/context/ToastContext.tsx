// src/context/ToastContext.tsx
import React, { createContext, useContext, useCallback } from "react";
import { ToastContainer } from "../components/ToastContainer";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let addToastFunction: ((message: string, type: "success" | "error" | "info" | "warning") => void) | null = null;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setAddToast = useCallback((fn: typeof addToastFunction) => {
    addToastFunction = fn;
  }, []);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    if (addToastFunction) addToastFunction(message, type);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* This will render ToastContainer globally */}
      <ToastContainer setAddToast={setAddToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
