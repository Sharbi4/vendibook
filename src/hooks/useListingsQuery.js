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
  // TODO: Wire mode and date filters into Neon queries once backend support lands.

  return searchParams.toString();
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
    let isActive = true;

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

        setListings(Array.isArray(payload.data) ? payload.data : []);
        setPagination(payload.pagination || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
        setListings([]);
        setPagination(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadListings();
    return () => {
      isActive = false;
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
