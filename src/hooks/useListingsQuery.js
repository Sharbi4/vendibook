import { useCallback, useEffect, useMemo, useState } from 'react';
import { SEARCH_MODE } from '../constants/filters';

const DEFAULT_LIMIT = 12;

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.city) searchParams.set('city', params.city.trim());
  if (params.state) searchParams.set('state', params.state.trim());
  if (params.listingType) searchParams.set('listing_type', params.listingType);
  if (params.mode) searchParams.set('mode', params.mode);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (Number.isFinite(params.latitude)) searchParams.set('lat', String(params.latitude));
  if (Number.isFinite(params.longitude)) searchParams.set('lng', String(params.longitude));
  if (Number.isFinite(params.distanceMiles) && params.distanceMiles > 0) {
    searchParams.set('distance', String(params.distanceMiles));
  }
  // TODO: Wire mode/date/distance filters into Neon queries once backend support lands.

  return searchParams.toString();
};

const sanitizeCoordinateValue = (value, fallback) => {
  if (value === undefined) return fallback;
  if (value === '' || value == null) {
    return '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const sanitizeDistanceValue = (value, fallback) => {
  if (value === undefined) return fallback;
  if (value === '' || value == null) return '';
  if (typeof value === 'number') {
    return value > 0 ? value : fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
};

export function useListingsQuery(initialState = {}) {
  const [queryState, setQueryState] = useState(() => ({
    mode: initialState.mode || SEARCH_MODE.RENT,
    city: initialState.city || '',
    state: initialState.state || '',
    listingType: initialState.listingType || '',
    startDate: initialState.startDate || '',
    endDate: initialState.endDate || '',
    page: Number(initialState.page) > 0 ? Number(initialState.page) : 1,
    limit: initialState.limit || DEFAULT_LIMIT,
    latitude: sanitizeCoordinateValue(initialState.latitude, ''),
    longitude: sanitizeCoordinateValue(initialState.longitude, ''),
    distanceMiles: sanitizeDistanceValue(initialState.distanceMiles, ''),
  }));

  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const queryString = useMemo(() => buildQueryString(queryState), [queryState]);

  const refetch = useCallback(() => {
    setRefreshIndex((idx) => idx + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadListings() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/listings?${queryString}`, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load listings (status ${response.status})`);
        }

        const payload = await response.json();

        if (payload.success === false) {
          throw new Error(payload.error || payload.message || 'Unable to load listings');
        }

        if (!isMounted) return;

        setListings(Array.isArray(payload.data) ? payload.data : []);
        setPagination(payload.pagination || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!isMounted) return;
        setError(err);
        setListings([]);
        setPagination(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [queryString, refreshIndex]);

  const setFilters = useCallback((updates = {}) => {
    setQueryState((prev) => ({
      ...prev,
      mode: updates.mode ?? prev.mode,
      city: updates.city ?? prev.city,
      state: updates.state ?? prev.state,
      listingType: updates.listingType ?? prev.listingType,
      startDate: updates.startDate ?? prev.startDate,
      endDate: updates.endDate ?? prev.endDate,
      latitude: sanitizeCoordinateValue(updates.latitude, prev.latitude),
      longitude: sanitizeCoordinateValue(updates.longitude, prev.longitude),
      distanceMiles: sanitizeDistanceValue(updates.distanceMiles, prev.distanceMiles),
      page: 1,
    }));
  }, []);

  const setPage = useCallback((nextPage) => {
    setQueryState((prev) => ({
      ...prev,
      page: Math.max(1, Number(nextPage) || 1),
    }));
  }, []);

  return {
    listings,
    pagination,
    filters: queryState,
    isLoading,
    isError: Boolean(error),
    error,
    refetch,
    setFilters,
    setPage,
  };
}
