import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f7fa',
        color: '#31A7BF',
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}>
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If role is required and doesn't match, redirect to the user's dashboard
  if (requiredRole && user?.role !== requiredRole) {
    const dashboardPath = user?.role === 'admin' ? '/admin/accounts' : 
                         user?.role === 'teacher' ? '/teacher/profile' : 
                         '/student/profile';
    return <Navigate to={dashboardPath} replace />;
  }

  // Authenticated and role matches, render children (via Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
