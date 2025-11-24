import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

const DEV_BYPASS = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

function buildRedirectTarget(location, override) {
  if (override) {
    return override;
  }
  const target = `${location.pathname || ''}${location.search || ''}${location.hash || ''}` || '/';
  return target && target !== '' ? target : '/';
}

export function useRequireAuth(options = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoaded: isAuthReady, isSignedIn } = useClerkAuth();
  const { isLoaded: isUserReady } = useUser();

  const redirectTo = useMemo(
    () => buildRedirectTarget(location, options.redirectTo),
    [location, options.redirectTo]
  );

  const redirectQuery = redirectTo && redirectTo !== '/' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
  const redirectUrl = `/signin${redirectQuery}`;

  const isAuthenticated = Boolean(DEV_BYPASS || isSignedIn);
  const isLoading = !DEV_BYPASS && (!isAuthReady || !isUserReady);

  const enforceAuth = () => {
    if (isAuthenticated) {
      return true;
    }
    navigate(redirectUrl, { replace: false, state: { from: redirectTo } });
    return false;
  };

  return {
    isAuthenticated,
    isLoading,
    redirectTo,
    redirectUrl,
    redirectQuery,
    enforceAuth,
    devBypassActive: DEV_BYPASS,
  };
}

export default useRequireAuth;
