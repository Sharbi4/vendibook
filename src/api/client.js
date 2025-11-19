/**
 * API helper functions for frontend
 * Provides a client-side interface to backend endpoints
 */

const API_BASE = typeof window !== 'undefined' ? '' : 'http://localhost:3000';

// Helper to get stored auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Helper to get Authorization header
function getAuthHeader() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Listings API
export async function fetchListings(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const url = `/api/listings${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch listings: ${response.statusText}`);
  }
  const data = await response.json();
  return data.listings || [];
}

export async function fetchListingById(id) {
  const response = await fetch(`/api/listings/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch listing: ${response.statusText}`);
  }
  return response.json();
}

export async function searchListings(filters = {}) {
  const response = await fetch('/api/listings/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(filters)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to search listings: ${response.statusText}`);
  }
  const data = await response.json();
  return data.listings || [];
}

export async function createListingRequest(listingId, requestData) {
  const response = await fetch(`/api/listings/${listingId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create request: ${response.statusText}`);
  }
  return response.json();
}

// Host Listings API
export async function createHostListing(listingData) {
  const response = await fetch('/api/host/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(listingData)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create listing: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchHostListings() {
  const response = await fetch('/api/host/listings', {
    method: 'GET',
    headers: {
      ...getAuthHeader()
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch host listings: ${response.statusText}`);
  }
  const data = await response.json();
  return data.listings || [];
}

export async function updateHostListing(listingId, updates) {
  const response = await fetch(`/api/host/listings/${listingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update listing: ${response.statusText}`);
  }
  return response.json();
}

export async function updateHostListingStatus(listingId, status) {
  const response = await fetch(`/api/host/listings/${listingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update listing status: ${response.statusText}`);
  }
  return response.json();
}

// Authentication API
export async function register(email, password, name) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  return data.user;
}

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  const data = await response.json();
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  return data.user;
}

export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', {
    headers: {
      ...getAuthHeader()
    }
  });
  
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export function logout() {
  localStorage.removeItem('authToken');
}

export function isAuthenticated() {
  return !!getAuthToken();
}

// Upload API
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/host/upload', {
    method: 'POST',
    headers: {
      ...getAuthHeader()
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.statusText}`);
  }
  const data = await response.json();
  return data.imageUrl;
}

// Unified API client object for convenience
export const apiClient = {
  async get(endpoint) {
    const response = await fetch(API_BASE + endpoint, {
      method: 'GET',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  },

  async post(endpoint, data = {}) {
    const response = await fetch(API_BASE + endpoint, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  },

  async put(endpoint, data = {}) {
    const response = await fetch(API_BASE + endpoint, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(API_BASE + endpoint, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    return response.json();
  }
};
