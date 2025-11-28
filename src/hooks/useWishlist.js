import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Wishlist hook for saving/unsaving listings
 * 
 * @example
 * const { isSaved, toggleSave, isLoading } = useWishlist(listingId);
 * 
 * <button onClick={toggleSave} disabled={isLoading}>
 *   {isSaved ? 'Saved' : 'Save'}
 * </button>
 */
export function useWishlist(listingId) {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if listing is in wishlist on mount
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !listingId) {
      setIsSaved(false);
      return;
    }

    const checkSaved = async () => {
      try {
        const response = await fetch(`/api/wishlist`);
        if (response.ok) {
          const data = await response.json();
          // Check if this listing is in the wishlist array
          const wishlistItems = Array.isArray(data) ? data : (data.items || []);
          const found = wishlistItems.some(item => 
            (item.listing_id || item.listingId) === listingId ||
            (item.listing?.id) === listingId
          );
          setIsSaved(found);
        }
      } catch (err) {
        console.warn('Failed to check wishlist status:', err);
      }
    };

    checkSaved();
  }, [user?.id, listingId, isAuthenticated]);

  /**
   * Add listing to wishlist
   */
  const save = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setError('Please sign in to save listings');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          listingId
        })
      });

      if (response.ok) {
        setIsSaved(true);
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save listing');
        return false;
      }
    } catch (err) {
      setError('Failed to save listing');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, listingId, isAuthenticated]);

  /**
   * Remove listing from wishlist
   */
  const unsave = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wishlist?listingId=${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setIsSaved(false);
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove listing');
        return false;
      }
    } catch (err) {
      setError('Failed to remove listing');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, listingId, isAuthenticated]);

  /**
   * Toggle saved status
   */
  const toggleSave = useCallback(async () => {
    if (isSaved) {
      return unsave();
    } else {
      return save();
    }
  }, [isSaved, save, unsave]);

  return {
    isSaved,
    isLoading,
    error,
    save,
    unsave,
    toggleSave,
    canSave: isAuthenticated
  };
}

/**
 * Hook to get full wishlist
 */
export function useWishlistItems() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

  const fetchWishlist = useCallback(async (page = 1) => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/wishlist?userId=${user.id}&page=${page}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
        setPagination(data.pagination || { page: 1, total: 0, pages: 0 });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load wishlist');
      }
    } catch (err) {
      setError('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const refresh = useCallback(() => {
    fetchWishlist(pagination.page);
  }, [fetchWishlist, pagination.page]);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages) {
      fetchWishlist(pagination.page + 1);
    }
  }, [fetchWishlist, pagination]);

  return {
    items,
    isLoading,
    error,
    pagination,
    refresh,
    loadMore,
    hasMore: pagination.page < pagination.pages
  };
}

export default useWishlist;
