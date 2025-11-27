import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import { useListingsQuery } from '../hooks/useListingsQuery';
import AppHeader from '../components/AppHeader';

const LISTING_TYPE_OPTIONS = [
  { label: 'All listing types', value: '' },
  { label: 'For rent • mobile kitchens', value: 'RENT' },
  { label: 'For sale inventory', value: 'SALE' },
  { label: 'Event professionals', value: 'EVENT_PRO' },
];

function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(() => ({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    listingType: searchParams.get('listingType') || '',
    page: Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  const [formFilters, setFormFilters] = useState({
    city: initialFilters.city,
    state: initialFilters.state,
    listingType: initialFilters.listingType,
  });

  const {
    listings,
    pagination,
    filters,
    isLoading,
    isError,
    error,
    refetch,
    setFilters,
    setPage,
  } = useListingsQuery(initialFilters);

  const safeListings = Array.isArray(listings) ? listings : [];
  const currentPage = pagination?.page || filters.page || 1;
  const totalPages = pagination?.pages || 1;
  const totalResults = pagination?.total ?? safeListings.length;

  const handleFormChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === 'state') {
      value = value.toUpperCase().slice(0, 2);
    }

    setFormFilters((prev) => ({ ...prev, [name]: value }));
  };

  const syncSearchParams = (next = {}) => {
    const params = new URLSearchParams();
    const merged = {
      city: next.city ?? filters.city ?? '',
      state: next.state ?? filters.state ?? '',
      listingType: next.listingType ?? filters.listingType ?? '',
      page: next.page ?? filters.page ?? 1,
    };

    if (merged.city) params.set('city', merged.city);
    if (merged.state) params.set('state', merged.state);
    if (merged.listingType) params.set('listingType', merged.listingType);
    if (merged.page && merged.page !== 1) params.set('page', String(merged.page));

    setSearchParams(params, { replace: true });
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();

    const trimmedFilters = {
      city: formFilters.city.trim(),
      state: formFilters.state.trim(),
      listingType: formFilters.listingType,
    };

    setFilters(trimmedFilters);
    syncSearchParams({ ...trimmedFilters, page: 1 });
  };

  const handlePagination = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    syncSearchParams({ page: nextPage });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">The marketplace</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Browse available mobile food assets</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600">
            Filter by city, state, and business type to find trucks, trailers, kitchens, or event pros that fit your next activation.
          </p>
        </div>
      </header>

      <section className="bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <form
            onSubmit={handleFilterSubmit}
            className="grid gap-4 rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm md:grid-cols-[1fr_140px_200px_auto]"
          >
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              City
              <input
                type="text"
                name="city"
                value={formFilters.city}
                onChange={handleFormChange}
                placeholder="e.g., Phoenix"
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              State
              <input
                type="text"
                name="state"
                value={formFilters.state}
                onChange={handleFormChange}
                placeholder="AZ"
                className="rounded-lg border border-gray-300 px-3 py-2 text-base uppercase tracking-wide text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                maxLength={2}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Listing type
              <select
                name="listingType"
                value={formFilters.listingType}
                onChange={handleFormChange}
                className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {LISTING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                Apply filters
              </button>
            </div>
          </form>
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
              <p className="mt-2 text-sm text-gray-600">Try adjusting your city, state, or type to broaden your search.</p>
              <button
                type="button"
                onClick={() => {
                  setFormFilters({ city: '', state: '', listingType: '' });
                  setFilters({ city: '', state: '', listingType: '' });
                  syncSearchParams({ city: '', state: '', listingType: '', page: 1 });
                }}
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
                  key={listing.id ?? `${listing.title ?? 'listing'}-${listing.city ?? 'city'}-${index}`}
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

            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>

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
    </div>
  );
}

export default ListingsPage;
