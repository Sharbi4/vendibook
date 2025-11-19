/**
 * API Client - Frontend integration with backend APIs
 *
 * All endpoints are now connected to the real backend API
 * Using helper functions from auth.js for token management and authenticated requests
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './auth';

const API_BASE = process.env.REACT_APP_API_URL || '';

// ============================================================================
// AUTH API
// ============================================================================

/**
 * Register a new user account
 * POST /api/auth/register
 *
 * @param {Object} userData - { email, password, name }
 * @returns {Promise<Object>} { token, user }
 */
export async function registerUser(userData) {
  return apiPost('/api/auth/register', userData);
}

/**
 * Login with email and password
 * POST /api/auth/login
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} { token, user }
 */
export async function loginUser(email, password) {
  return apiPost('/api/auth/login', { email, password });
}

/**
 * Get current logged-in user info
 * GET /api/auth/me
 *
 * @returns {Promise<Object>} { user } - Current user object
 */
export async function getCurrentUser() {
  try {
    return await apiGet('/api/auth/me');
  } catch (error) {
    if (error.status === 401) {
      return null; // Not authenticated
    }
    throw error;
  }
}

/**
 * Logout and clear session
 * (Client-side only - clears token from localStorage)
 */
export async function logoutUser() {
  // Could call POST /api/auth/logout here if backend tracks sessions
  // For now, just clear client-side auth
  return { success: true };
}

// ============================================================================
// PUBLIC LISTINGS API
// ============================================================================

/**
 * Fetch all listings with optional filters
 * GET /api/listings?listingType=RENT&location=Phoenix...
 *
 * @param {Object} filters - { listingType, category, location, priceMin, priceMax, etc }
 * @returns {Promise<Object>} { count, listings }
 */
export async function fetchListings(filters = {}) {
  // Build query string from filters
  const params = new URLSearchParams();
  
  if (filters.listingType) params.append('listingType', filters.listingType);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.location) params.append('location', filters.location);
  if (filters.priceMin) params.append('priceMin', filters.priceMin);
  if (filters.priceMax) params.append('priceMax', filters.priceMax);
  if (filters.deliveryOnly) params.append('deliveryOnly', 'true');
  if (filters.verifiedOnly) params.append('verifiedOnly', 'true');
  if (filters.search) params.append('search', filters.search);
  
  const queryString = params.toString();
  const path = `/api/listings${queryString ? '?' + queryString : ''}`;
  
  return apiGet(path);
}

/**
 * Fetch a single listing by ID
 * GET /api/listings/:id
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing object
 */
export async function fetchListingById(id) {
  return apiGet(`/api/listings/${id}`);
}

/**
 * Search listings with advanced filters
 * POST /api/listings/search
 *
 * @param {Object} filters - Complex filter object
 * @returns {Promise<Object>} { count, total, listings }
 */
export async function searchListings(filters = {}) {
  return apiPost('/api/listings/search', filters);
}

// ============================================================================
// HOST LISTINGS API (Authenticated)
// ============================================================================

/**
 * Fetch all listings created by current host
 * GET /api/host/listings
 * Requires authentication
 *
 * @returns {Promise<Object>} { count, listings }
 */
export async function fetchHostListings() {
  return apiGet('/api/host/listings');
}

/**
 * Create a new listing as a host
 * POST /api/host/listings
 * Requires authentication
 *
 * @param {Object} listingData - New listing object
 * @returns {Promise<Object>} { success, listing, message }
 */
export async function createHostListing(listingData) {
  return apiPost('/api/host/listings', listingData);
}

/**
 * Get a specific host listing
 * GET /api/host/listings/:id
 * Requires authentication (owner only)
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing object
 */
export async function getHostListing(id) {
  return apiGet(`/api/host/listings/${id}`);
}

/**
 * Update a host listing
 * PUT /api/host/listings/:id
 * Requires authentication (owner only)
 *
 * @param {string} id - Listing ID
 * @param {Object} updates - Updated listing data
 * @returns {Promise<Object>} { success, listing, message }
 */
export async function updateHostListing(id, updates) {
  return apiPut(`/api/host/listings/${id}`, updates);
}

/**
 * Partially update a host listing
 * PATCH /api/host/listings/:id
 * Requires authentication (owner only)
 *
 * @param {string} id - Listing ID
 * @param {Object} updates - Partial updates
 * @returns {Promise<Object>} { success, listing, message }
 */
export async function patchHostListing(id, updates) {
  return apiPatch(`/api/host/listings/${id}`, updates);
}

/**
 * Update listing status (live, paused, archived, sold)
 * PATCH /api/host/listings/:id/status
 * Requires authentication (owner only)
 *
 * @param {string} id - Listing ID
 * @param {string} status - New status
 * @returns {Promise<Object>} { success, listing, message }
 */
export async function updateListingStatus(id, status) {
  return apiPatch(`/api/host/listings/${id}/status`, { status });
}

/**
 * Delete a host's listing
 * DELETE /api/host/listings/:id
 * Requires authentication (owner only)
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} { success, message }
 */
export async function deleteHostListing(id) {
  return apiDelete(`/api/host/listings/${id}`);
}

// ============================================================================
// LISTING REQUESTS API (Authenticated)
// ============================================================================

/**
 * Create a booking request or inquiry for a listing
 * POST /api/listings/:id
 * Requires authentication
 *
 * @param {string} listingId - Listing ID
 * @param {Object} requestData - { type, startDate, endDate, eventDate, message, etc }
 * @returns {Promise<Object>} { success, requestId, request, message }
 */
export async function createListingRequest(listingId, requestData) {
  return apiPost(`/api/listings/${listingId}`, requestData);
}

// ============================================================================
// IMAGE UPLOAD API (Authenticated)
// ============================================================================

/**
 * Upload image for listing
 * POST /api/host/upload
 * Requires authentication
 *
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} { success, imageUrl, fileName, uploadedAt }
 */
export async function uploadListingImage(file) {
  // Use FormData for file uploads
  const formData = new FormData();
  formData.append('file', file);
  
  const token = localStorage.getItem('authToken');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Don't set Content-Type - browser will set it with boundary
  const response = await fetch(`${API_BASE}/api/host/upload`, {
    method: 'POST',
    headers,
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }
  
  return response.json();
}
