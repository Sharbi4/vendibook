import { useCallback, useEffect, useMemo, useState } from 'react';

const INITIAL_STATE = {
  data: null,
  error: null,
  isLoading: true
};

export function useAdminSummary(rangeDays = 30) {
  const [state, setState] = useState(INITIAL_STATE);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/admin/summary?range=${rangeDays}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Unable to load admin summary');
        }

        const payload = await response.json();
        setState({
          data: payload?.data || null,
          error: null,
          isLoading: false
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        setState({ data: null, error: error.message || 'Failed to load admin summary', isLoading: false });
      }
    }

    load();
    return () => controller.abort();
  }, [rangeDays, refreshIndex]);

  const refetch = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  return useMemo(() => ({
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch
  }), [state.data, state.isLoading, state.error, refetch]);
}
