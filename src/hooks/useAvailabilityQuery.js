import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_AVAILABILITY_STATE = {
  unavailableDates: [],
  rules: null
};

export function useAvailabilityQuery({ listingId, startDate, endDate } = {}) {
  const [state, setState] = useState(() => ({ ...DEFAULT_AVAILABILITY_STATE }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const queryString = useMemo(() => {
    if (!listingId) {
      return '';
    }

    const searchParams = new URLSearchParams({ listingId });
    if (startDate) searchParams.set('startDate', startDate);
    if (endDate) searchParams.set('endDate', endDate);
    return searchParams.toString();
  }, [listingId, startDate, endDate]);

  const refetch = useCallback(() => {
    setRefreshIndex((idx) => idx + 1);
  }, []);

  useEffect(() => {
    if (!listingId || !queryString) {
      return undefined;
    }

    const controller = new AbortController();
    let active = true;

    async function loadAvailability() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/availability?${queryString}`, {
          method: 'GET',
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Availability request failed (status ${response.status})`);
        }

        const payload = await response.json();
        if (payload.success === false) {
          throw new Error(payload.message || payload.error || 'Unable to load availability');
        }

        const unavailableDates = Array.isArray(payload.data?.unavailableDates)
          ? payload.data.unavailableDates
          : [];
        const rules = payload.data?.rules || null;

        if (active) {
          setState({ unavailableDates, rules });
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (active) {
          setError(err);
          setState({ ...DEFAULT_AVAILABILITY_STATE });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      active = false;
      controller.abort();
    };
  }, [listingId, queryString, refreshIndex]);

  return {
    unavailableDates: state.unavailableDates,
    rules: state.rules,
    isLoading,
    isError: Boolean(error),
    error,
    refetch
  };
}
