import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../shared/hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
    const payload = JSON.parse(atob(padded));
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const token = localStorage.getItem('token');

  if (!isAuthenticated || !token || isTokenExpired(token)) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
