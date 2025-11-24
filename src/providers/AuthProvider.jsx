import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import AuthContext from '../context/authContext.js';

const defaultAuthState = {
  currentUser: null,
  loading: true,
};

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(defaultAuthState.currentUser);
  const [loading, setLoading] = useState(defaultAuthState.loading);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        setCurrentUser(null);
        return null;
      }
      const payload = await response.json();
      const user = payload?.data?.user || payload?.user || null;
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err);
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (form) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = payload.message || payload.error || 'Login failed';
      throw new Error(message);
    }
    await fetchUser();
  }, [fetchUser]);

  const register = useCallback(async (form) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const message = payload.message || payload.error || 'Signup failed';
      throw new Error(message);
    }
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setCurrentUser(null);
  }, []);

  const authorizedFetch = useCallback(async (path, options = {}) => {
    const response = await fetch(path, { ...options, credentials: 'include' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      const message = data.message || data.error || 'Request failed';
      const err = new Error(message);
      err.status = response.status;
      err.payload = data;
      throw err;
    }
    return data;
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const value = useMemo(() => ({
    user: currentUser,
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading: loading,
    error,
    login,
    register,
    logout,
    refreshUser: fetchUser,
    authorizedFetch,
    needsVerification: false,
    isSendingVerification: false,
    sendVerification: async () => ({ success: false }),
  }), [authorizedFetch, currentUser, error, fetchUser, loading, login, logout, register]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
