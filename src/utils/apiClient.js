/**
 * API Client Placeholder
 *
 * This module provides a unified interface for all API requests.
 * Currently uses mock data but will be connected to real backend in next phase.
 *
 * PHASE 2 (Backend Integration):
 * - Replace mock data functions with real fetch() calls
 * - Add error handling and retry logic
 * - Implement request/response interceptors
 * - Add loading and error states
 */

import { listings } from '../data/listings';

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Configuration for API requests
 * Will be used for real API calls in phase 2
 */
const apiConfig = {
  baseURL: API_BASE,
  timeout: 10000,
  retries: 3,
  cache: true
};

// ============================================================================
// AUTH API - PHASE 2: Implement real authentication
// ============================================================================

/**
 * Register a new user account
 * [FUTURE] POST /api/auth/register
 */
export async function registerUser(userData) {
  // PLACEHOLDER: Mock implementation
  // TODO: Replace with real API call
  console.log('[PHASE 2] TODO: Implement POST /api/auth/register', userData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "user_" + Date.now(),
        email: userData.email,
        name: userData.name,
        token: "mock_token_" + Date.now()
      });
    }, 500);
  });
}

/**
 * Login with email and password
 * [FUTURE] POST /api/auth/login
 */
export async function loginUser(email, password) {
  // PLACEHOLDER: Mock implementation
  // TODO: Replace with real API call
  console.log('[PHASE 2] TODO: Implement POST /api/auth/login', { email });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user_1',
        email,
        name: 'John Doe',
        token: 'mock_token_' + Date.now()
      });
    }, 500);
  });
}

/**
 * Get current logged-in user info
 * [FUTURE] GET /api/auth/me
 */
export async function getCurrentUser() {
  // PLACEHOLDER: Mock implementation
  // TODO: Replace with real API call
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  console.log('[PHASE 2] TODO: Implement GET /api/auth/me');
  return {
    id: 'user_1',
    email: 'user@example.com',
    name: 'John Doe'
  };
}

/**
 * Logout and clear session
 * [FUTURE] POST /api/auth/logout
 */
export async function logoutUser() {
  // PLACEHOLDER: Mock implementation
  // TODO: Replace with real API call
  console.log('[PHASE 2] TODO: Implement POST /api/auth/logout');
  localStorage.removeItem('authToken');
  return { success: true };
}

// ============================================================================
// LISTINGS API - PHASE 2: Fetch from backend
// ============================================================================

/**
 * Fetch all listings with optional filters
 * [FUTURE] GET /api/listings?type=RENT&location=Phoenix&category=food-trucks...
 *
 * @param {Object} filters - { listingType, location, category, priceMin, priceMax, deliveryOnly, verifiedOnly }
 * @returns {Promise<Array>} Array of listing objects
 */
export async function fetchListings(filters = {}) {
  // CURRENT: Returns mock data
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with GET /api/listings', { filters });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(listings);
    }, 200);
  });
}

/**
 * Fetch a single listing by ID
 * [FUTURE] GET /api/listings/:id
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing object or null
 */
export async function fetchListingById(id) {
  // CURRENT: Returns mock data
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with GET /api/listings/:id', { id });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const listing = listings.find(l => l.id === id);
      resolve(listing || null);
    }, 200);
  });
}

/**
 * Search listings with advanced filters
 * [FUTURE] POST /api/listings/search
 *
 * @param {Object} filters - Complex filter object
 * @returns {Promise<Array>} Filtered listings
 */
export async function searchListings(filters = {}) {
  // CURRENT: Returns mock data
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with POST /api/listings/search', { filters });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(listings);
    }, 200);
  });
}

// ============================================================================
// HOST LISTINGS API - PHASE 2: Replace localStorage with backend
// ============================================================================

/**
 * Fetch all listings created by current host
 * [FUTURE] GET /api/host/listings
 *
 * @returns {Promise<Array>} Host's listings
 */
export async function fetchHostListings() {
  // CURRENT: Returns from localStorage
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with GET /api/host/listings');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      const myListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      resolve(myListings);
    }, 200);
  });
}

/**
 * Create a new listing as a host
 * [FUTURE] POST /api/host/listings
 *
 * @param {Object} listingData - New listing object
 * @returns {Promise<Object>} Created listing with ID
 */
export async function createHostListing(listingData) {
  // CURRENT: Saves to localStorage
  // REQUIRES AUTHENTICATION: User must be logged in as host
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with POST /api/host/listings (requires auth)', listingData);
  
  return new Promise((resolve, reject) => {
    try {
      const newListing = {
        ...listingData,
        id: "listing_" + Date.now(),
        createdAt: new Date().toISOString(),
        status: 'live'
      };
      
      const existingListings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      existingListings.push(newListing);
      localStorage.setItem('vendibook_myListings', JSON.stringify(existingListings));
      
      setTimeout(() => {
        resolve(newListing);
      }, 300);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Update listing status (live/paused/archived)
 * [FUTURE] PUT /api/host/listings/:id/status
 *
 * @param {string} id - Listing ID
 * @param {string} status - New status: 'live' | 'paused' | 'archived'
 * @returns {Promise<Object>} Updated listing
 */
export async function updateListingStatus(id, status) {
  // CURRENT: Updates localStorage
  // REQUIRES AUTHENTICATION: User must own this listing
  // TODO: Replace with real fetch call in PHASE 2
  console.log('[PHASE 2] TODO: Replace with PUT /api/host/listings/:id/status (requires auth)', { id, status });
  
  return new Promise((resolve, reject) => {
    try {
      const listings = JSON.parse(localStorage.getItem('vendibook_myListings') || '[]');
      const listing = listings.find(l => l.id === id);
      
      if (!listing) {
        reject(new Error('Listing not found'));
        return;
      }
      
      listing.status = status;
      localStorage.setItem('vendibook_myListings', JSON.stringify(listings));
      
      setTimeout(() => {
        resolve(listing);
      }, 200);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Delete a host's listing
 * [FUTURE] DELETE /api/host/listings/:id
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteHostListing(id) {
  // PLACEHOLDER: Not yet implemented
  // REQUIRES AUTHENTICATION: User must own this listing
  // TODO: Implement in PHASE 2
  console.log('[PHASE 2] TODO: Implement DELETE /api/host/listings/:id (requires auth)', { id });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id });
    }, 200);
  });
}

/**
 * Upload image for listing
 * [FUTURE] POST /api/host/upload
 *
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} { imageUrl, imageId }
 */
export async function uploadListingImage(file) {
  // PLACEHOLDER: Not yet implemented
  // TODO: Implement in PHASE 2 with proper FormData handling
  console.log('[PHASE 2] TODO: Implement POST /api/host/upload', { filename: file.name });
  
  return new Promise((resolve) => {
    // In phase 2, this would upload to S3/CloudStorage
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        resolve({
          imageUrl: reader.result,
          imageId: 'img_' + Date.now()
        });
      }, 500);
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// LISTING REQUESTS API - PHASE 2: Implement booking/inquiry system
// ============================================================================

/**
 * Create a booking request or inquiry for a listing
 * [FUTURE] POST /api/listings/:id/requests
 *
 * @param {string} listingId - Listing ID
 * @param {Object} requestData - { type, startDate, endDate, message }
 * @returns {Promise<Object>} Created request
 */
export async function createListingRequest(listingId, requestData) {
  // PLACEHOLDER: Not yet implemented
  // REQUIRES AUTHENTICATION: User must be logged in
  // TODO: Implement in PHASE 2
  console.log('[PHASE 2] TODO: Implement POST /api/listings/:id/requests (requires auth)', {
    listingId,
    requestData
  });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "req_" + Date.now(),
        listingId,
        status: 'pending',
        ...requestData
      });
    }, 300);
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Set authentication token for subsequent requests
 * [PHASE 2] Use this after login to store JWT
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

/**
 * Get stored authentication token
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}
