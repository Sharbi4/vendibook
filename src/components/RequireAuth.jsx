import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useRequireAuth.js';

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading, redirectQuery } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Checking your access…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/signin${redirectQuery}`} replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node,
};
