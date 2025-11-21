import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AuthContext from '../context/authContext.js';
import { getAuthToken, getStoredUser, getCurrentUser, loginUser, logoutUser, clearAuthToken, setStoredUser } from '../utils/auth.js';

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // If no token, just use the stored user and finish loading
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // FRONTEND ONLY: Skip API call for now, just use stored user
        // TODO: Uncomment when backend /api/auth/me is ready
        // const current = await getCurrentUser();
        // if (cancelled) return;
        // setUser(current);
        
        // For now, trust the stored user if we have a token
        if (cancelled) return;
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Token exists but no user - clear everything
          clearAuthToken();
          setToken(null);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error bootstrapping auth:', err);
        setError(err);
        clearAuthToken();
        setStoredUser(null);
        setUser(null);
        setToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      setUser(data.user || null);
      setToken(data.token || null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error during logout:', err);
    }
    clearAuthToken();
    setStoredUser(null);
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
