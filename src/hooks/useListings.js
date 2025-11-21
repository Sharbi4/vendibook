import { useEffect, useState } from 'react';

// Fetch listings from API and adapt shape to existing UI expectations
export function useListings(appliedSearch) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/listings', { signal: controller.signal });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        const data = Array.isArray(json.data) ? json.data : [];
        // Map API rows to UI listing structure
        const mapped = data.map(row => ({
          id: row.id,
          title: row.title,
            // Simplistic category inference; adjust when schema expands
          category: row.listing_type === 'food-truck' ? 'food-trucks' : 'misc',
          listingType: row.listing_type || 'rent',
          location: `${row.city || ''}${row.state ? ', ' + row.state : ''}`.trim(),
          price: Number(row.price) || 0,
          priceType: 'day',
          image: row.image || 'https://via.placeholder.com/600x400?text=Listing',
          rating: 0,
          reviews: 0,
          features: [],
          host: 'Host',
          deliveryAvailable: false
        }));
        setListings(mapped);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [appliedSearch]);

  return { listings, loading, error };
}