/**
 * Authentication utilities for token management
 *
 * Handles storing, retrieving, and clearing authentication tokens
 * Provides helper functions for API requests with automatic token injection
 */

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

/**
 * Store authentication token in localStorage
 * @param {string} token - Auth token from API response
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Store user data in localStorage
 * @param {object} user - User object from API response
 */
export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get stored authentication token
 * @returns {string|null} - Token if available, null otherwise
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user data
 * @returns {object|null} - User object if available, null otherwise
 */
export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} - True if authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Clear authentication (logout)
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get Authorization header for API requests
 * @returns {object|null} - Headers object with Authorization, or null if not authenticated
 */
export function getAuthHeaders() {
  const token = getToken();
  if (!token) return null;
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Make an authenticated API request
 * @param {string} path - API endpoint path (e.g., '/api/listings')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} - Response JSON
 */
export async function apiRequest(path, options = {}) {
  const baseURL = process.env.REACT_APP_API_URL || '';
  const url = baseURL + path;
  
  const headers = getAuthHeaders() || { 'Content-Type': 'application/json' };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    clearAuth();
    // Could emit a logout event here or trigger a redirect to login
  }
  
  if (!response.ok) {
    const error = await response.json();
    const err = new Error(error.message || error.error || 'API Error');
    err.status = response.status;
    err.data = error;
    throw err;
  }
  
  return response.json();
}

/**
 * Make a GET request
 * @param {string} path - API endpoint
 * @returns {Promise<object>} - Response JSON
 */
export function apiGet(path) {
  return apiRequest(path, { method: 'GET' });
}

/**
 * Make a POST request
 * @param {string} path - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<object>} - Response JSON
 */
export function apiPost(path, data) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/**
 * Make a PUT request
 * @param {string} path - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<object>} - Response JSON
 */
export function apiPut(path, data) {
  return apiRequest(path, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

/**
 * Make a PATCH request
 * @param {string} path - API endpoint
 * @param {object} data - Request body
 * @returns {Promise<object>} - Response JSON
 */
export function apiPatch(path, data) {
  return apiRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

/**
 * Make a DELETE request
 * @param {string} path - API endpoint
 * @returns {Promise<object>} - Response JSON
 */
export function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' });
}
