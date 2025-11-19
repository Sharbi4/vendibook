/**
 * Authentication utilities for front-end
 *
 * Handles token storage, API calls, and auth state
 */

const API_BASE = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

const TOKEN_KEY = 'vendibook_token';
const USER_KEY = 'vendibook_user';

/**
 * Get stored token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Get stored user
 */
export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Store user
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove user
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Register new user
 */
export const register = async (email, password, name) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token and user
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  removeToken();
  removeUser();
};

/**
 * Get current user from API
 */
export const getCurrentUser = async () => {
  try {
    const token = getToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear it
        logout();
        return null;
      }
      throw new Error('Failed to fetch user');
    }

    const data = await response.json();
    setUser(data.user);
    return data.user;

  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Token is invalid, logout and redirect
    logout();
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
};

/**
 * Host Listing API calls
 */

export const createHostListing = async (listingData) => {
  const response = await authenticatedFetch(`${API_BASE}/host/listings`, {
    method: 'POST',
    body: JSON.stringify(listingData)
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to create listing');
  }

  return await response.json();
};

export const getHostListings = async () => {
  const response = await authenticatedFetch(`${API_BASE}/host/listings`);

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch listings');
  }

  return await response.json();
};

export const updateHostListing = async (id, updates) => {
  const response = await authenticatedFetch(`${API_BASE}/host/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update listing');
  }

  return await response.json();
};

export const updateListingStatus = async (id, status) => {
  const response = await authenticatedFetch(`${API_BASE}/host/listings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to update status');
  }

  return await response.json();
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const token = getToken();
  const response = await fetch(`${API_BASE}/host/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.imageUrl;
};
