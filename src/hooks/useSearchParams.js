import { useState, useEffect } from 'react';
import { useSearchParams as useRouterSearchParams } from 'react-router-dom';
import { LISTING_TYPES } from '../data/listings';

/**
 * Hook for managing search parameters across the application
 * Syncs state with URL query parameters
 */
export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useRouterSearchParams();

  // Initialize state from URL or defaults
  const [state, setState] = useState(() => ({
    listingType: searchParams.get('type') || LISTING_TYPES.RENT,
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || 'all',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    amenities: searchParams.get('amenities') ? searchParams.get('amenities').split(',') : [],
    deliveryOnly: searchParams.get('deliveryOnly') === 'true',
    verifiedOnly: searchParams.get('verifiedOnly') === 'true'
  }));

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();

    if (state.listingType && state.listingType !== LISTING_TYPES.RENT) {
      params.set('type', state.listingType);
    }
    if (state.location) params.set('location', state.location);
    if (state.category && state.category !== 'all') params.set('category', state.category);
    if (state.startDate) params.set('startDate', state.startDate);
    if (state.endDate) params.set('endDate', state.endDate);
    if (state.priceMin) params.set('priceMin', state.priceMin);
    if (state.priceMax) params.set('priceMax', state.priceMax);
    if (state.amenities && state.amenities.length > 0) {
      params.set('amenities', state.amenities.join(','));
    }
    if (state.deliveryOnly) params.set('deliveryOnly', 'true');
    if (state.verifiedOnly) params.set('verifiedOnly', 'true');

    setSearchParams(params, { replace: true });
  }, [state, setSearchParams]);

  const updateSearch = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetSearch = () => {
    setState({
      listingType: LISTING_TYPES.RENT,
      location: '',
      category: 'all',
      startDate: '',
      endDate: '',
      priceMin: '',
      priceMax: '',
      amenities: [],
      deliveryOnly: false,
      verifiedOnly: false
    });
  };

  const clearFilter = (filterName) => {
    setState(prev => {
      const newState = { ...prev };
      if (filterName === 'location') newState.location = '';
      else if (filterName === 'category') newState.category = 'all';
      else if (filterName === 'dates') {
        newState.startDate = '';
        newState.endDate = '';
      }
      else if (filterName === 'price') {
        newState.priceMin = '';
        newState.priceMax = '';
      }
      else if (filterName === 'deliveryOnly') newState.deliveryOnly = false;
      else if (filterName === 'verifiedOnly') newState.verifiedOnly = false;
      else if (filterName === 'amenities') newState.amenities = [];
      return newState;
    });
  };

  const hasActiveFilters = () => {
    return state.location ||
           (state.category && state.category !== 'all') ||
           state.startDate ||
           state.endDate ||
           state.priceMin ||
           state.priceMax ||
           state.deliveryOnly ||
           state.verifiedOnly ||
           (state.amenities && state.amenities.length > 0);
  };

  return {
    ...state,
    updateSearch,
    resetSearch,
    clearFilter,
    hasActiveFilters: hasActiveFilters()
  };
};
