import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function buildRedirectParam(location) {
  const path = `${location.pathname || ''}${location.search || ''}${location.hash || ''}`;
  if (!path || path === '/') {
    return '';
  }
  return `?redirectTo=${encodeURIComponent(path)}`;
}

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Checking your access…
      </div>
    );
  }

  if (!isAuthenticated) {
    const param = buildRedirectParam(location);
    return <Navigate to={`/signin${param}`} replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node,
};
