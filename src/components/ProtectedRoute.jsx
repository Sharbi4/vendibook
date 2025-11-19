import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

/**
 * ProtectedRoute Component
 *
 * Wraps routes that require authentication
 * Redirects to login page if user is not authenticated
 */
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Store the attempted URL to redirect back after login
    const currentPath = window.location.pathname;
    sessionStorage.setItem('vendibook_redirect_after_login', currentPath);

    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
