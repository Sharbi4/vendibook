/**
 * API Client - Connected to Real Backend (PHASE 2)
 *
 * All functions now use real API calls to Vercel serverless backend.
 * - Authenticated requests use Bearer tokens from src/utils/auth.js
 * - Error handling with proper HTTP status checking
 * - User-facing error messages
 */

import * as authUtil from './auth';

const REMOTE_API_BASE = 'https://vendibook.vercel.app';

// Prefer explicit env var, otherwise fall back to production API when running on localhost
const envBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '').trim();
const sanitizedBase = envBase ? envBase.replace(/\/$/, '') : '';
const API_BASE = sanitizedBase ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? REMOTE_API_BASE : '');

// ============================================================================
// HELPER: Make authenticated API requests
// ============================================================================

/**
 * Make an authenticated API request with error handling
 * @param {string} path - API path (e.g., '/api/listings')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - Response data
 * @throws {Error} - With error message and status
 */
async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = authUtil.getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  // Handle 401 - unauthorized (token invalid/expired)
  if (response.status === 401) {
    authUtil.clearAuthToken();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  
  // Parse response body
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = { error: 'Invalid server response' };
  }
  
  // Handle error responses
  if (!response.ok) {
    const message = data.message || data.error || `API error: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

// ============================================================================
// AUTHENTICATION API (POST /api/auth/*)
// ============================================================================

/**
 * Register a new user account
 * POST /api/auth/register
 */
export async function registerUser(email, password, name) {
  const data = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name })
  });
  
  // Store token and user
  if (data.token) {
    authUtil.setAuthToken(data.token);
    authUtil.setStoredUser(data.user);
  }
  
  return data;
}

/**
 * Login with email and password
 * POST /api/auth/login
 */
export async function loginUser(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // Store token and user
  if (data.token) {
    authUtil.setAuthToken(data.token);
    authUtil.setStoredUser(data.user);
  }
  
  return data;
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  try {
    const data = await apiRequest('/api/auth/me', {
      method: 'GET'
    });
    
    if (data.user) {
      authUtil.setStoredUser(data.user);
      return data.user;
    }
    
    return null;
  } catch (error) {
    if (error.status === 401) {
      authUtil.clearAuthToken();
      return null;
    }
    throw error;
  }
}

/**
 * Logout user
 * POST /api/auth/logout (optional endpoint)
 */
export async function logoutUser() {
  // Clear local auth
  authUtil.clearAuthToken();
  return { success: true };
}

// ============================================================================
// PUBLIC LISTINGS API (GET /api/listings/*)
// ============================================================================

/**
 * Fetch all listings with optional filters
 * GET /api/listings?listingType=RENT&category=food-trucks&location=Phoenix...
 *
 * @param {object} filters - { listingType, category, location, priceMin, priceMax, verifiedOnly, deliveryOnly }
 * @returns {Promise<object>} - { count, total, listings }
 */
export async function fetchListings(filters = {}, fetchOptions = {}) {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.listingType) params.append('listingType', filters.listingType);
  if (filters.category) params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.priceMin) params.append('priceMin', filters.priceMin);
  if (filters.priceMax) params.append('priceMax', filters.priceMax);
  if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
  if (filters.deliveryOnly) params.append('deliveryOnly', 'true');
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.amenities) {
    const amenities = Array.isArray(filters.amenities) ? filters.amenities : [filters.amenities];
    amenities.filter(Boolean).forEach((amenity) => params.append('amenities', amenity));
  }
  
  const queryString = params.toString();
  const path = `/api/listings${queryString ? '?' + queryString : ''}`;
  
  return apiRequest(path, { method: 'GET', ...fetchOptions });
}

/**
 * Fetch a single listing by ID
 * GET /api/listings/:id
 *
 * @param {string} id - Listing ID
 * @returns {Promise<object>} - Listing object
 */
export async function fetchListingById(id) {
  return apiRequest(`/api/listings/${id}`, { method: 'GET' });
}

/**
 * Search listings with advanced filters
 * POST /api/listings/search
 *
 * @param {object} filters - Complex filter object
 * @returns {Promise<object>} - { count, total, listings }
 */
export async function searchListings(filters = {}) {
  return apiRequest('/api/listings/search', {
    method: 'POST',
    body: JSON.stringify({
      listingType: filters.listingType,
      category: filters.category,
      location: filters.location,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      verifiedOnly: filters.verifiedOnly,
      deliveryOnly: filters.deliveryOnly,
      amenities: filters.amenities,
      search: filters.search,
      limit: filters.limit
    })
  });
}

// ============================================================================
// HOST LISTINGS API (GET|POST /api/host/listings, PATCH /api/host/listings/:id/status)
// ============================================================================

/**
 * Fetch all listings created by current host
 * GET /api/host/listings (requires authentication)
 *
 * @returns {Promise<object>} - { count, listings }
 */
export async function fetchHostListings() {
  return apiRequest('/api/host/listings', { method: 'GET' });
}

/**
 * Create a new listing as a host
 * POST /api/host/listings (requires authentication)
 *
 * @param {object} listingData - Listing details
 * @returns {Promise<object>} - { listing }
 */
export async function createHostListing(listingData) {
  return apiRequest('/api/host/listings', {
    method: 'POST',
    body: JSON.stringify(listingData)
  });
}

/**
 * Get a specific host listing
 * GET /api/host/listings/:id (requires authentication & ownership)
 *
 * @param {string} id - Listing ID
 * @returns {Promise<object>} - { listing }
 */
export async function getHostListing(id) {
  return apiRequest(`/api/host/listings/${id}`, { method: 'GET' });
}

/**
 * Update a host listing (full update)
 * PUT /api/host/listings/:id (requires authentication & ownership)
 *
 * @param {string} id - Listing ID
 * @param {object} updates - Updated listing data
 * @returns {Promise<object>} - { listing }
 */
export async function updateHostListing(id, updates) {
  return apiRequest(`/api/host/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * Partially update a host listing
 * PATCH /api/host/listings/:id (requires authentication & ownership)
 *
 * @param {string} id - Listing ID
 * @param {object} updates - Partial updates
 * @returns {Promise<object>} - { listing }
 */
export async function patchHostListing(id, updates) {
  return apiRequest(`/api/host/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

/**
 * Update listing status
 * PATCH /api/host/listings/:id/status (requires authentication & ownership)
 *
 * @param {string} id - Listing ID
 * @param {string} status - New status: draft|live|paused|sold|archived
 * @returns {Promise<object>} - { listing }
 */
export async function updateListingStatus(id, status) {
  return apiRequest(`/api/host/listings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

/**
 * Delete a host listing
 * DELETE /api/host/listings/:id (requires authentication & ownership)
 *
 * @param {string} id - Listing ID
 * @returns {Promise<object>} - { success: true }
 */
export async function deleteHostListing(id) {
  return apiRequest(`/api/host/listings/${id}`, {
    method: 'DELETE'
  });
}

// ============================================================================
// BOOKING & INQUIRY API (POST /api/listings/:id)
// ============================================================================

/**
 * Create a booking, inquiry, or event request for a listing
 * POST /api/listings/:id (requires authentication)
 *
 * For RENT listings: Creates a booking
 * For SALE listings: Creates an inquiry
 * For EVENT_PRO listings: Creates an event request
 *
 * @param {string} id - Listing ID
 * @param {object} data - Request data (varies by type)
 * @returns {Promise<object>} - { requestId, message }
 */
export async function createListingRequest(id, data) {
  return apiRequest(`/api/listings/${id}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// ============================================================================
// IMAGE UPLOAD API (POST /api/host/upload)
// ============================================================================

/**
 * Upload an image for a listing
 * POST /api/host/upload (requires authentication)
 *
 * Note: This is a stub implementation for Phase 2.
 * Phase 3 will implement real S3 upload with multipart form data.
 *
 * @returns {Promise<object>} - { imageUrl, fileName, message }
 */
export async function uploadListingImage() {
  // Phase 2: Placeholder - returns placeholder URL
  // Phase 3: Implement real multipart/form-data upload
  return apiRequest('/api/host/upload', {
    method: 'POST'
  });
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * @deprecated Use authUtil.setAuthToken() instead
 */
export function setAuthToken(token) {
  authUtil.setAuthToken(token);
}

/**
 * @deprecated Use authUtil.getAuthToken() instead
 */
export function getAuthToken() {
  return authUtil.getAuthToken();
}

/**
 * @deprecated Use authUtil.clearAuthToken() instead
 */
export function clearAuth() {
  authUtil.clearAuthToken();
}

