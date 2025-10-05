import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 *
 * Wraps private routes and ensures only authenticated users can access them.
 * If the user is not logged in, they are redirected to the login page.
 * The original location is preserved so users can be redirected back after login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: '#fff',
      }}>
        Loading...
      </div>
    );
  }

  // If not authenticated, redirect to login page
  // Save the current location so we can redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
