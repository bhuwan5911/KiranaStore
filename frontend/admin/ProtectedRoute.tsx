import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAppContext();
  
  // For now, let's allow access for development
  // You can implement proper authentication logic later
  const isAdmin = currentUser?.role === 'admin';
  
  // Temporary: Allow access for development (remove this in production)
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && !isAdmin) {
    // Redirect to login if not authenticated as admin
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};