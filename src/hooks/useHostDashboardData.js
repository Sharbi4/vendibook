import { useCallback, useEffect, useState } from 'react';

const ENDPOINTS = {
  summary: '/api/host/dashboard/summary',
  listings: '/api/host/dashboard/listings',
  bookings: '/api/host/dashboard/bookings'
};

async function requestJson(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `Request failed for ${url}`);
  }
  return payload?.data ?? null;
}

export function useHostDashboardData() {
  const [data, setData] = useState({ summary: null, listings: [], bookings: [] });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    const [summary, listings, bookings] = await Promise.all([
      requestJson(ENDPOINTS.summary),
      requestJson(ENDPOINTS.listings),
      requestJson(ENDPOINTS.bookings)
    ]);

    return {
      summary: summary || null,
      listings: Array.isArray(listings) ? listings : [],
      bookings: Array.isArray(bookings) ? bookings : []
    };
  }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    setError('');
    try {
      const nextState = await fetchDashboard();
      setData(nextState);
      setStatus('success');
    } catch (err) {
      console.error('Failed to fetch host dashboard data', err);
      setError(err.message || 'Unable to load dashboard data');
      setStatus('error');
    }
  }, [fetchDashboard]);

  useEffect(() => {
    let isActive = true;
    const initialize = async () => {
      try {
        setStatus('loading');
        setError('');
        const nextState = await fetchDashboard();
        if (!isActive) return;
        setData(nextState);
        setStatus('success');
      } catch (err) {
        if (!isActive) return;
        console.error('Failed to initialize host dashboard data', err);
        setError(err.message || 'Unable to load dashboard data');
        setStatus('error');
      }
    };

    initialize();
    return () => {
      isActive = false;
    };
  }, [fetchDashboard]);

  return {
    data,
    status,
    error,
    refetch: load
  };
}
