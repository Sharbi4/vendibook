import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import AuthContext from '../context/authContext.js';
import { getStoredUser, setStoredUser } from '../utils/auth.js';

function sanitizeRedirectPath(value) {
  if (!value) {
    return '/listings';
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const url = new URL(value);
      return `${url.pathname}${url.search}` || '/listings';
    } catch (error) {
      return '/listings';
    }
  }
  return value.startsWith('/') ? value : `/${value}`;
}

function AuthProvider({ children }) {
  const { isLoaded: isClerkAuthLoaded, isSignedIn, getToken, signOut, sessionId } = useClerkAuth();
  const { user: clerkUser, isLoaded: isClerkUserLoaded } = useUser();

  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isStartingConnect, setIsStartingConnect] = useState(false);
  const [isStartingIdentity, setIsStartingIdentity] = useState(false);

  const lastSyncedClerkId = useRef(null);

  const isClerkReady = isClerkAuthLoaded && isClerkUserLoaded;
  const clerkUserId = clerkUser?.id || null;
  const primaryEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    null;

  const updateGlobalAuthCache = useCallback((nextToken, nextClerkId) => {
    if (typeof window === 'undefined') {
      return;
    }
    window.__vendibookAuthCache = {
      ...(window.__vendibookAuthCache || {}),
      token: nextToken || null,
      clerkId: nextClerkId || null,
    };
  }, []);

  const requestClerkToken = useCallback(async () => {
    if (!isSignedIn) {
      return null;
    }

    try {
      const templateToken = await getToken({ template: 'vendibook' });
      if (templateToken) {
        return templateToken;
      }
    } catch (templateError) {
      console.warn('Optional Clerk token template "vendibook" unavailable:', templateError?.message || templateError);
    }

    return getToken({ skipCache: true });
  }, [getToken, isSignedIn]);

  const ensureSessionToken = useCallback(
    async ({ force = false } = {}) => {
      if (!isSignedIn) {
        setToken(null);
        updateGlobalAuthCache(null, clerkUserId);
        return null;
      }

      if (!force && token) {
        return token;
      }

      try {
        const nextToken = await requestClerkToken();
        setToken(nextToken || null);
        updateGlobalAuthCache(nextToken || null, clerkUserId);
        return nextToken || null;
      } catch (error) {
        console.error('Failed to fetch Clerk session token:', error);
        setToken(null);
        updateGlobalAuthCache(null, clerkUserId);
        return null;
      }
    },
    [clerkUserId, isSignedIn, requestClerkToken, token, updateGlobalAuthCache]
  );

  useEffect(() => {
    updateGlobalAuthCache(token, clerkUserId);
  }, [token, clerkUserId, updateGlobalAuthCache]);

  useEffect(() => {
    if (!isSignedIn) {
      setToken(null);
      updateGlobalAuthCache(null, null);
      return;
    }
    ensureSessionToken({ force: true }).catch((error) => {
      console.warn('Unable to refresh Clerk session token:', error);
    });
  }, [ensureSessionToken, isSignedIn, sessionId, updateGlobalAuthCache]);

  const authorizedFetch = useCallback(
    async (path, options = {}) => {
      const headers = new Headers(options.headers || {});
      const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
      if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      if (clerkUserId) {
        headers.set('x-clerk-id', clerkUserId);
      }

      const sessionToken = await ensureSessionToken();
      if (sessionToken) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
      }

      const response = await fetch(path, { ...options, headers: Object.fromEntries(headers.entries()) });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        const message = data.message || data.error || 'Request failed';
        const error = new Error(message);
        error.status = response.status;
        error.payload = data;
        throw error;
      }

      return data;
    },
    [clerkUserId, ensureSessionToken]
  );

  const fetchCurrentUser = useCallback(async () => {
    if (!clerkUserId) {
      setUser(null);
      setStoredUser(null);
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const data = await authorizedFetch('/api/users/me', { method: 'GET' });
      const nextUser = data.data || data.user || data;
      setUser(nextUser);
      setStoredUser(nextUser);
      return nextUser;
    } catch (error) {
      if (error.status === 404) {
        setUser(null);
        setStoredUser(null);
        lastSyncedClerkId.current = null;
        return null;
      }
      setSyncError(error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [authorizedFetch, clerkUserId]);

  const syncUserProfile = useCallback(async () => {
    if (!clerkUserId || !clerkUser) {
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const payload = {
        clerkId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        displayName: clerkUser.fullName || clerkUser.username || null,
        businessName: clerkUser?.publicMetadata?.businessName || null,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
        imageUrl: clerkUser.imageUrl || null,
        role: clerkUser?.publicMetadata?.role || undefined,
      };

      await authorizedFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      lastSyncedClerkId.current = clerkUser.id;
      return fetchCurrentUser();
    } catch (error) {
      setSyncError(error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [authorizedFetch, clerkUser, clerkUserId, fetchCurrentUser, primaryEmail]);

  useEffect(() => {
    if (!isClerkReady) {
      return;
    }

    if (!isSignedIn || !clerkUserId) {
      setUser(null);
      setStoredUser(null);
      setToken(null);
      updateGlobalAuthCache(null, null);
      lastSyncedClerkId.current = null;
      return;
    }

    let cancelled = false;

    async function hydrate() {
      if (lastSyncedClerkId.current === clerkUserId && user) {
        try {
          await fetchCurrentUser();
        } catch (error) {
          console.warn('Failed to refresh user profile:', error);
        }
        return;
      }

      try {
        await syncUserProfile();
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to sync Clerk user with Vendibook backend:', error);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, [clerkUserId, fetchCurrentUser, isClerkReady, isSignedIn, syncUserProfile, updateGlobalAuthCache, user]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
      setStoredUser(null);
      setToken(null);
      updateGlobalAuthCache(null, null);
      lastSyncedClerkId.current = null;
    }
  }, [signOut, updateGlobalAuthCache]);

  const handleSendVerification = useCallback(async () => {
    const targetEmail = user?.email || primaryEmail;
    if (!targetEmail) {
      throw new Error('Email address required to send verification.');
    }

    setIsSendingVerification(true);
    try {
      await authorizedFetch('/api/auth/send-verification', {
        method: 'POST',
        body: JSON.stringify({ email: targetEmail }),
      });
      await fetchCurrentUser();
      return { success: true };
    } finally {
      setIsSendingVerification(false);
    }
  }, [authorizedFetch, fetchCurrentUser, primaryEmail, user?.email]);

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

      await fetchCurrentUser();
      return linkResponse.data?.url || linkResponse.url;
    } finally {
      setIsStartingConnect(false);
    }
  }, [authorizedFetch, fetchCurrentUser]);

  const startIdentityVerification = useCallback(async () => {
    setIsStartingIdentity(true);
    try {
      const response = await authorizedFetch('/api/stripe/create-identity-session', {
        method: 'POST',
      });
      await fetchCurrentUser();
      return response.data?.url || response.url;
    } finally {
      setIsStartingIdentity(false);
    }
  }, [authorizedFetch, fetchCurrentUser]);

  const isAuthenticated = Boolean(isSignedIn && clerkUserId);
  const isLoading = !isClerkReady || isSyncing;

  const value = useMemo(
    () => ({
      user,
      clerkUser,
      token,
      clerkUserId,
      sessionId,
      isAuthenticated,
      isVerified: Boolean(user?.is_verified),
      needsVerification: Boolean(user && !user?.is_verified),
      isHostVerified: Boolean(user?.is_host_verified),
      needsHostVerification: Boolean(user && !user?.is_host_verified),
      hostVerificationStatus: user?.host_verification_status || null,
      isLoading,
      error: syncError,
      logout: handleLogout,
      refreshUser: fetchCurrentUser,
      syncUserProfile,
      sendVerification: handleSendVerification,
      isSendingVerification,
      startConnectOnboarding,
      startIdentityVerification,
      isStartingConnect,
      isStartingIdentity,
      getToken: ensureSessionToken,
      authorizedFetch,
      defaultRedirect: sanitizeRedirectPath,
    }),
    [
      authorizedFetch,
      clerkUser,
      clerkUserId,
      ensureSessionToken,
      fetchCurrentUser,
      handleLogout,
      handleSendVerification,
      isAuthenticated,
      isLoading,
      isSendingVerification,
      isStartingConnect,
      isStartingIdentity,
      sessionId,
      startConnectOnboarding,
      startIdentityVerification,
      syncError,
      syncUserProfile,
      token,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export default AuthProvider;
