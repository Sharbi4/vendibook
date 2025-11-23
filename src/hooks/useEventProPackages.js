import { useCallback, useEffect, useState } from 'react';

export function useEventProPackages(listingId) {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(listingId));
  const [error, setError] = useState(null);

  const fetchPackages = useCallback(async () => {
    if (!listingId) {
      setPackages([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/event-pro-packages?listingId=${encodeURIComponent(listingId)}`);
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || payload?.error || 'Unable to load packages');
      }
      setPackages(Array.isArray(payload?.data) ? payload.data : []);
    } catch (err) {
      setPackages([]);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    if (listingId) {
      fetchPackages();
    } else {
      setIsLoading(false);
    }
  }, [listingId, fetchPackages]);

  return {
    packages,
    isLoading,
    isError: Boolean(error),
    error,
    refetch: fetchPackages
  };
}
