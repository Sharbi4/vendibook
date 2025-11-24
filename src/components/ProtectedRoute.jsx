<<<<<<< HEAD
export { default } from './RequireAuth.jsx';
=======
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../api/client';

/**
 * ProtectedRoute - Redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated();
    setAuthenticated(authenticated);
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
>>>>>>> parent of aea4d91 (feat: implement authentication system)
