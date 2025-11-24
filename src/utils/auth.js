/**
 * Authentication utilities for frontend
 * Manages token storage, API calls with auth headers, and user context
 */

// Token storage key
const TOKEN_KEY = 'vendibook_auth_token';
const USER_KEY = 'vendibook_auth_user';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Get stored authentication token
 * @returns {string|null} - Auth token or null if not logged in
 */
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error reading auth token:', error);
    return null;
  }
}

/**
 * Store authentication token
 * @param {string} token - Auth token to store
 */
export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if auth token exists
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

// ============================================================================
// USER STORAGE
// ============================================================================

/**
 * Get stored user data
 * @returns {object|null} - User object or null
 */
export function getStoredUser() {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error reading stored user:', error);
    return null;
  }
}

/**
 * Store user data
 * @param {object} user - User object to store
 */
export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

// ============================================================================
// API REQUEST HELPERS
// ============================================================================

/**
 * Get Authorization header for API requests
 * @returns {object} - Headers object with Authorization header if authenticated
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response JSON
 */
export async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
  
  // Handle 401 Unauthorized - clear auth and redirect to login
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/login';
  }
  
  // Parse response
  const data = await response.json();
  
  // Throw error if response not OK
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

// ============================================================================
// AUTHENTICATION FLOW
// ============================================================================

/**
 * Register a new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User full name
 * @returns {Promise<object>} - {user, token}
 */
export async function registerUser(payloadOrEmail, password, name) {
  const body =
    typeof payloadOrEmail === 'object'
      ? payloadOrEmail
      : { email: payloadOrEmail, password, firstName: name };

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Registration failed');
  }

  const user = data.data?.user || data.user;
  const token = data.data?.token || data.token;

  if (token) {
    setAuthToken(token);
  }
  if (user) {
    setStoredUser(user);
  }

  return { user, token };
}

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - {user, token}
 */
export async function loginUser(credentialsOrEmail, password) {
  const body =
    typeof credentialsOrEmail === 'object'
      ? credentialsOrEmail
      : { email: credentialsOrEmail, password };

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Login failed');
  }

  const user = data.data?.user || data.user;
  const token = data.data?.token || data.token;

  if (token) {
    setAuthToken(token);
  }
  if (user) {
    setStoredUser(user);
  }

  return { user, token };
}

/**
 * Request an email verification link
 * @param {string} email - Target email address
 */
export async function requestVerificationEmail(email) {
  const response = await fetch('/api/auth/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || 'Unable to send verification email');
  }

  return data;
}

/**
 * Get current authenticated user
 * @returns {Promise<object>} - Current user object
 */
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      if (response.status === 401) {
        clearAuthToken();
        setStoredUser(null);
        return null;
      }

      throw new Error(data.message || data.error || 'Failed to fetch current user');
    }

    const user = data.data?.user || data.user || null;
    if (user) {
      setStoredUser(user);
    }

    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Logout user and clear session
 */
export async function logoutUser() {
  try {
    // Optional: Call logout endpoint if it exists
    // await authenticatedFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Error during logout:', error);
  }
  
  // Always clear local auth
  clearAuthToken();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize auth state on app startup
 * Validates stored token and loads current user
 * @returns {Promise<object|null>} - Current user or null
 */
export async function initializeAuth() {
  const token = getAuthToken();
  if (!token) {
    return null;
  }
  
  // Verify token is still valid
  return getCurrentUser();
}
