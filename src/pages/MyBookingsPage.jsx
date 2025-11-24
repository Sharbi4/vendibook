import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import ListSkeleton from '../components/ListSkeleton';
import { useAuth } from '../hooks/useAuth';
import { useAppStatus } from '../hooks/useAppStatus';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const BOOKING_MODE_LABELS = {
  daily: 'Daily rental',
  'daily-with-time': 'Daily rental + times',
  hourly: 'Hourly event',
  package: 'Event package'
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-rose-100 text-rose-700',
  DECLINED: 'bg-rose-100 text-rose-700'
};

const formatDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatAmount = (value, currency = 'USD') => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const buildRangeLabel = (booking) => {
  if (!booking) return 'Dates TBA';
  if (booking.bookingMode === 'hourly') {
    const dateLabel = formatDate(booking.startDate || booking.startDateTime);
    const startTime = formatTime(booking.startDateTime);
    const endTime = formatTime(booking.endDateTime);
    if (startTime && endTime) {
      return `${dateLabel} • ${startTime} - ${endTime}`;
    }
    return dateLabel;
  }
  return `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`;
};

const buildLocationLabel = (listing) => {
  if (!listing) return 'Location TBA';
  if (listing.city && listing.state) {
    return `${listing.city}, ${listing.state}`;
  }
  return listing.city || listing.state || 'Location TBA';
};

const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-slate-100 text-slate-700';

export function MyBookingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const { setGlobalLoading, setGlobalError } = useAppStatus();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const initialStatus = STATUS_FILTERS.some((filter) => filter.value === searchParams.get('status'))
    ? searchParams.get('status')
    : 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const clerkId = useMemo(
    () => user?.clerkId || user?.clerk_id || user?.clerkID || null,
    [user]
  );
  const renterUserId = useMemo(
    () => user?.id || user?._id || user?.userId || null,
    [user]
  );

  useEffect(() => {
    if (!isAuthenticated || !renterUserId) {
      setIsLoading(false);
      setBookings([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadBookings() {
      setIsLoading(true);
      setErrorMessage(null);
      setGlobalLoading(true);

      const params = new URLSearchParams();
      params.set('role', 'renter');
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }

      let endpoint = '/api/bookings/me';
      if (!clerkId) {
        endpoint = '/api/bookings';
        if (renterUserId) {
          params.set('userId', renterUserId);
        }
      }

      const queryString = params.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      if (clerkId) {
        headers['x-clerk-id'] = clerkId;
      }

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || payload.error || 'Failed to load bookings');
        }

        if (!cancelled) {
          const data = Array.isArray(payload.data) ? payload.data : payload.bookings || [];
          setBookings(data);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (!cancelled) {
          setBookings([]);
          setErrorMessage(error.message);
        }
        setGlobalError(error.message || 'Failed to load bookings');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
        setGlobalLoading(false);
      }
    }

    loadBookings();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [statusFilter, isAuthenticated, renterUserId, clerkId, token, setGlobalLoading, setGlobalError]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'ALL') {
      nextParams.delete('status');
    } else {
      nextParams.set('status', value);
    }
    setSearchParams(nextParams);
  };

  const handleRowClick = (booking) => {
    if (booking?.listingId) {
      navigate(`/listing/${booking.listingId}`);
    }
  };

  const renderBookings = () => {
    if (isLoading) {
      return <ListSkeleton count={3} />;
    }

    if (bookings.length === 0) {
      return (
        <EmptyState
          title={isAuthenticated ? 'No bookings yet' : 'Sign in to view bookings'}
          description={
            isAuthenticated
              ? 'You have not requested any rentals yet. Explore listings to get started.'
              : 'Create an account or sign in to manage your booking requests.'
          }
          action={{
            label: isAuthenticated ? 'Browse Listings' : 'Sign In',
            onClick: () => navigate(isAuthenticated ? '/listings' : '/login')
          }}
        />
      );
    }

    return (
      <ul className="space-y-4" aria-label="Bookings list">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-orange-400"
            onClick={() => handleRowClick(booking)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {BOOKING_MODE_LABELS[booking.bookingMode] || 'Booking'}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {booking.listing?.title || 'Listing removed'}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {buildLocationLabel(booking.listing)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}>
                  {booking.status || 'PENDING'}
                </span>
              </div>

              <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>{buildRangeLabel(booking)}</span>
                </div>
                {booking.bookingMode === 'hourly' && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span>
                      {formatTime(booking.startDateTime)}
                      {booking.endDateTime ? ` - ${formatTime(booking.endDateTime)}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:col-span-2">
                  Total {formatAmount(booking.totalPrice, booking.currency)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <PageShell
      title="My Bookings"
      subtitle="Track every request and reservation in one place"
      maxWidth="max-w-5xl"
      action={{ label: 'Browse Listings', onClick: () => navigate('/listings') }}
    >
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter bookings by status">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleStatusChange(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-orange-400/60 ${
              statusFilter === filter.value ? 'bg-orange-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            aria-pressed={statusFilter === filter.value}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {renderBookings()}
    </PageShell>
  );
}

