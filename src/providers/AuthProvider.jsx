import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AuthContext from '../context/authContext.js';
import {
  getAuthToken,
  getStoredUser,
  getCurrentUser,
  loginUser,
  registerUser,
  clearAuthToken,
  setStoredUser,
  requestVerificationEmail,
} from '../utils/auth.js';

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isStartingConnect, setIsStartingConnect] = useState(false);
  const [isStartingIdentity, setIsStartingIdentity] = useState(false);

  const applyAuthState = useCallback((authResult) => {
    if (!authResult) {
      return { user: null, token: null };
    }
    const nextUser = authResult.user || null;
    const nextToken = authResult.token || null;
    setStoredUser(nextUser);
    setUser(nextUser);
    setToken(nextToken);
    return { user: nextUser, token: nextToken };
  }, []);

  const resetSession = useCallback(() => {
    clearAuthToken();
    setStoredUser(null);
    setUser(null);
    setToken(null);
  }, []);

  const refreshUserProfile = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      if (current) {
        setStoredUser(current);
        setUser(current);
        return current;
      }

      resetSession();
      return null;
    } catch (err) {
      console.error('Error refreshing auth profile:', err);
      setError(err);
      resetSession();
      throw err;
    }
  }, [resetSession]);

  const bootstrap = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    try {
      return await refreshUserProfile();
    } catch (err) {
      // refreshUserProfile already handled logging/reset
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token, refreshUserProfile]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleLogin = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loginUser(credentials);
        const applied = applyAuthState(result);
        await refreshUserProfile();
        return applied;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthState, refreshUserProfile]
  );

  const handleSignup = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await registerUser(payload);
        const applied = applyAuthState(result);
        await refreshUserProfile();
        return applied;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthState, refreshUserProfile]
  );

  const handleLogout = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const handleSendVerification = useCallback(
    async (targetEmail) => {
      const email = targetEmail || user?.email;
      if (!email) {
        throw new Error('Email address required to send verification.');
      }

      setIsSendingVerification(true);
      try {
        await requestVerificationEmail(email);
        await refreshUserProfile();
        return { success: true };
      } finally {
        setIsSendingVerification(false);
      }
    },
    [refreshUserProfile, user?.email]
  );

  const authorizedFetch = useCallback(
    async (path, options = {}) => {
      if (!token) {
        throw new Error('You must be signed in to continue.');
      }

      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };

      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      if (!headers['Content-Type'] && !isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(path, { ...options, headers });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    },
    [token]
  );

  const startConnectOnboarding = useCallback(async () => {
    setIsStartingConnect(true);
    try {
      const accountResponse = await authorizedFetch('/api/stripe/create-connect-account', {
        method: 'POST',
      });
      const accountId =
        accountResponse.data?.accountId ||
        accountResponse.accountId ||
        accountResponse?.account?.id;

      if (!accountId) {
        throw new Error('Unable to determine Stripe account id.');
      }

      const linkResponse = await authorizedFetch('/api/stripe/create-account-link', {
        method: 'POST',
        body: JSON.stringify({ connectAccountId: accountId }),
      });

      await refreshUserProfile();
      return linkResponse.data?.url || linkResponse.url;
    } finally {
      setIsStartingConnect(false);
    }
  }, [authorizedFetch, refreshUserProfile]);

  const startIdentityVerification = useCallback(async () => {
    setIsStartingIdentity(true);
    try {
      const response = await authorizedFetch('/api/stripe/create-identity-session', {
        method: 'POST',
      });
      await refreshUserProfile();
      return response.data?.url || response.url;
    } finally {
      setIsStartingIdentity(false);
    }
  }, [authorizedFetch, refreshUserProfile]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isVerified: Boolean(user?.is_verified),
      needsVerification: Boolean(user && !user?.is_verified),
      isHostVerified: Boolean(user?.is_host_verified),
      needsHostVerification: Boolean(user && !user?.is_host_verified),
      hostVerificationStatus: user?.host_verification_status || null,
      isLoading,
      error,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      refreshUser: refreshUserProfile,
      setUser,
      sendVerification: handleSendVerification,
      isSendingVerification,
      startConnectOnboarding,
      startIdentityVerification,
      isStartingConnect,
      isStartingIdentity,
    }),
    [
      user,
      token,
      isLoading,
      error,
      handleLogin,
      handleSignup,
      handleLogout,
      refreshUserProfile,
      handleSendVerification,
      isSendingVerification,
      startConnectOnboarding,
      startIdentityVerification,
      isStartingConnect,
      isStartingIdentity,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
