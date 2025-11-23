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
} from '../utils/auth.js';

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const bootstrap = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const current = await getCurrentUser();
      if (current) {
        setUser(current);
      } else {
        resetSession();
      }
    } catch (err) {
      console.error('Error bootstrapping auth:', err);
      setError(err);
      resetSession();
    } finally {
      setIsLoading(false);
    }
  }, [token, resetSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const handleLogin = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await loginUser(credentials);
        return applyAuthState(result);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthState]
  );

  const handleSignup = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await registerUser(payload);
        return applyAuthState(result);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthState]
  );

  const handleLogout = useCallback(() => {
    resetSession();
  }, [resetSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      login: handleLogin,
      signup: handleSignup,
      logout: handleLogout,
      refreshUser: bootstrap,
      setUser,
    }),
    [user, token, isLoading, error, handleLogin, handleSignup, handleLogout, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
