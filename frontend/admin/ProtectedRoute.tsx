import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// --- BADLAV: children prop ki ab zaroorat nahi hai, Outlet istemal karenge ---
export const ProtectedRoute: React.FC = () => {
  // --- BADLAV: currentUser ki jagah 'user' istemal karein ---
  const { user } = useAppContext();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Agar user admin hai, to nested routes (jaise AdminPage) ko render karein
  return <Outlet />;
};
