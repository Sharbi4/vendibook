import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, MapPin, SlidersHorizontal, X } from 'lucide-react';
import ListingCard from '../components/ListingCard';
import { useListingsQuery } from '../hooks/useListingsQuery';
import AppLayout from '../layouts/AppLayout.jsx';
import {
  SEARCH_MODE,
  buildSearchParamsFromFilters,
  formatDateRange,
  getCategoryLabel,
  getCategoryOptionsForMode,
  getModeLabel,
  parseFiltersFromSearchParams
} from '../constants/filters';

const MODE_PILLS = [
  { id: SEARCH_MODE.RENT, label: 'Rent equipment' },
  { id: SEARCH_MODE.BUY, label: 'Buy equipment' },
  { id: SEARCH_MODE.EVENT_PRO, label: 'Book event pros' },
  { id: SEARCH_MODE.VENDOR_MARKET, label: 'Vendor markets' }
];

const AMENITY_OPTIONS = [
  { id: 'power', label: 'Power available' },
  { id: 'water', label: 'Water access' },
  { id: 'delivery', label: 'Delivery available' },
  { id: 'indoor', label: 'Indoor friendly' },
  { id: 'outdoor', label: 'Outdoor ready' }
];

function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  const [formFilters, setFormFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    amenities: AMENITY_OPTIONS.reduce((acc, amenity) => ({ ...acc, [amenity.id]: false }), {})
  });
  // TODO connect advanced filters to /api/listings once backend and Neon schema support these fields.

  const {
    listings,
    pagination,
    filters,
    isLoading,
    isError,
    error,
    refetch,
    setFilters,
    setPage
  } = useListingsQuery(initialFilters);

  const safeListings = Array.isArray(listings) ? listings : [];
  const currentPage = pagination?.page || filters.page || appliedFilters.page || 1;
  const totalPages = pagination?.pages || 1;
  const totalResults = pagination?.total ?? safeListings.length;

  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All categories' }, ...getCategoryOptionsForMode(formFilters.mode)],
    [formFilters.mode]
  );

  const pushFiltersToUrl = (filtersToPush) => {
    const params = buildSearchParamsFromFilters(filtersToPush);
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    setFormFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setFilters(initialFilters);
    if (initialFilters.page && initialFilters.page > 1) {
      setPage(initialFilters.page);
    }
  }, [initialFilters, setFilters, setPage]);

  const commitFilters = (updater) => {
    setAppliedFilters((prev) => {
      const draft = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      const next = {
        ...draft,
        page: 1
      };
      next.locationText = draft.locationText ?? [next.city, next.state].filter(Boolean).join(', ');
      setFormFilters((formPrev) => ({ ...formPrev, ...next }));
      setFilters({
        mode: next.mode,
        city: next.city,
        state: next.state,
        listingType: next.listingType,
        startDate: next.startDate,
        endDate: next.endDate
      });
      pushFiltersToUrl(next);
      return next;
    });
  };

  const handleModeChange = (mode) => {
    setFormFilters((prev) => ({ ...prev, mode, listingType: '' }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'state' ? value.toUpperCase().slice(0, 2) : value;
    setFormFilters((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    setFormFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    const trimmedCity = formFilters.city.trim();
    const trimmedState = formFilters.state.trim().slice(0, 2).toUpperCase();
    commitFilters({
      ...formFilters,
      city: trimmedCity,
      state: trimmedState
    });
  };

  const handlePagination = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    setAppliedFilters((prev) => {
      const next = { ...prev, page: nextPage };
      pushFiltersToUrl(next);
      return next;
    });
    setFormFilters((prev) => ({ ...prev, page: nextPage }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleChipRemove = (key) => {
    if (key === 'mode') {
      commitFilters({ mode: SEARCH_MODE.RENT, listingType: '' });
      return;
    }
    if (key === 'location') {
      commitFilters({ city: '', state: '', locationText: '' });
      return;
    }
    if (key === 'category') {
      commitFilters({ listingType: '' });
      return;
    }
    if (key === 'dates') {
      commitFilters({ startDate: '', endDate: '' });
    }
  };

  const handleAdvancedPriceChange = (event) => {
    const { name, value } = event.target;
    setAdvancedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenityId) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenityId]: !prev.amenities[amenityId]
      }
    }));
  };

  const activeChips = [];
  const locationLabel = [appliedFilters.city, appliedFilters.state].filter(Boolean).join(', ');
  const categoryLabel = getCategoryLabel(appliedFilters.mode, appliedFilters.listingType);

  if (appliedFilters.mode) {
    activeChips.push({ key: 'mode', label: getModeLabel(appliedFilters.mode) });
  }
  if (locationLabel) {
    activeChips.push({ key: 'location', label: locationLabel });
  }
  if (appliedFilters.listingType) {
    activeChips.push({ key: 'category', label: categoryLabel });
  }
  if (appliedFilters.startDate || appliedFilters.endDate) {
    activeChips.push({ key: 'dates', label: formatDateRange(appliedFilters.startDate, appliedFilters.endDate) });
  }

  return (
    <AppLayout fullWidth contentClassName="bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">The marketplace</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Browse available mobile food assets</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600">
            Filter by city, state, mode, and business type to find rentals, event pros, vendor markets, or for-sale listings.
          </p>
        </div>
      </header>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <form onSubmit={handleFilterSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {MODE_PILLS.map((pill) => (
                <button
                  type="button"
                  key={pill.id}
                  onClick={() => handleModeChange(pill.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    formFilters.mode === pill.id
                      ? 'bg-orange-500 text-white shadow'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                  aria-pressed={formFilters.mode === pill.id}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr_1fr_1fr_1fr]">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                City
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formFilters.city}
                    onChange={handleInputChange}
                    placeholder="Phoenix"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                State
                <input
                  type="text"
                  name="state"
                  value={formFilters.state}
                  onChange={handleInputChange}
                  placeholder="AZ"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-base uppercase tracking-wide text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  maxLength={2}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Category
                <select
                  name="listingType"
                  value={formFilters.listingType}
                  onChange={(event) => setFormFilters((prev) => ({ ...prev, listingType: event.target.value }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                Start date
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="startDate"
                    value={formFilters.startDate}
                    onChange={handleDateChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                End date
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="endDate"
                    value={formFilters.endDate}
                    onChange={handleDateChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Update results
              </button>
              <button
                type="button"
                onClick={() => setAdvancedOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <SlidersHorizontal className="h-4 w-4" />
                More filters
              </button>
            </div>

            {advancedOpen && (
              <div className="space-y-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Min price ($)
                    <input
                      type="number"
                      name="minPrice"
                      value={advancedFilters.minPrice}
                      onChange={handleAdvancedPriceChange}
                      placeholder="Any"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                    Max price ($)
                    <input
                      type="number"
                      name="maxPrice"
                      value={advancedFilters.maxPrice}
                      onChange={handleAdvancedPriceChange}
                      placeholder="Any"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map((amenity) => (
                    <label
                      key={amenity.id}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        advancedFilters.amenities[amenity.id]
                          ? 'border-orange-500 bg-white text-orange-600'
                          : 'border-gray-300 bg-white text-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={advancedFilters.amenities[amenity.id]}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="sr-only"
                      />
                      {amenity.label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  TODO connect advanced filters to /api/listings once backend and Neon schema support these fields.
                </p>
              </div>
            )}
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {activeChips.length === 0 ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">All listings</span>
            ) : (
              activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-700"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={() => handleChipRemove(chip.key)}
                    className="text-gray-400 transition hover:text-gray-700"
                    aria-label={`Remove ${chip.label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-600">
            Showing <span className="font-semibold text-gray-900">{totalResults}</span> listing{totalResults === 1 ? '' : 's'}
          </p>
          {pagination && (
            <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
          )}
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-gray-200 bg-white/90 p-10 text-center text-gray-600">
              Loading listings…
            </div>
          )}

          {!isLoading && isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-lg font-semibold text-red-700">Unable to load listings</p>
              <p className="mt-2 text-sm text-red-600">{error?.message || 'Something went wrong. Please try again.'}</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && safeListings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-gray-900">No listings match your filters</p>
              <p className="mt-2 text-sm text-gray-600">Try adjusting your city, mode, or category to broaden your search.</p>
              <button
                type="button"
                onClick={() => commitFilters({
                  mode: SEARCH_MODE.RENT,
                  city: '',
                  state: '',
                  listingType: '',
                  startDate: '',
                  endDate: ''
                })}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Reset filters
              </button>
            </div>
          )}

          {!isLoading && !isError && safeListings.length > 0 && (
            <div className="grid gap-6 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {safeListings.map((listing, index) => (
                <ListingCard
                  key={listing.id ?? `${listing.title ?? 'listing'}-${index}`}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </div>

        {pagination && totalPages > 1 && (
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => handlePagination(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                currentPage <= 1
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>

            <button
              type="button"
              onClick={() => handlePagination(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                currentPage >= totalPages
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

export default ListingsPage;
