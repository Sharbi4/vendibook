import { useEffect, useMemo, useState } from 'react';
import { fetchListings } from '../utils/apiClient';

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x600?text=Vendibook+Listing';

export function useListings(filters = {}) {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { normalizedFilters, queryString } = useMemo(() => {
    const params = new URLSearchParams();
    const normalized = {};

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        const cleaned = value.filter((item) => item !== undefined && item !== null && item !== '' && item !== false);
        if (cleaned.length) {
          normalized[key] = cleaned;
          cleaned.forEach((entry) => params.append(key, entry));
        }
      } else if (value !== undefined && value !== null && value !== '' && value !== false) {
        normalized[key] = value;
        params.set(key, value);
      }
    });

    return { normalizedFilters: normalized, queryString: params.toString() };
  }, [filters]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const json = await fetchListings(normalizedFilters, { signal: controller.signal });
        const data = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.listings)
            ? json.listings
            : [];
        const mapped = data.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category || 'misc',
          listingType: row.listing_type || row.listingType || 'RENT',
          city: row.city || '',
          state: row.state || '',
          location: row.location || [row.city, row.state].filter(Boolean).join(', '),
          price: Number(row.price) || 0,
          priceUnit: row.price_unit || row.priceUnit || 'per day',
          image: row.image_url || row.imageUrl || DEFAULT_IMAGE,
          imageUrls: row.imageUrls || row.image_urls || [],
          tags: row.tags || [],
          highlights: row.highlights || [],
          isVerified: Boolean(row.isVerified ?? row.is_verified ?? false),
          deliveryAvailable: Boolean(row.deliveryAvailable ?? row.delivery_available ?? false),
          host: row.hostName || row.host_name || 'Host',
          rating: Number(row.rating) || 0,
          reviewCount: row.reviewCount || row.review_count || 0,
        }));

        setListings(mapped);
        setPagination(json.pagination || json.meta?.pagination || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load listings');
        setListings([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [queryString, normalizedFilters]);

  return { listings, pagination, isLoading, error };
}