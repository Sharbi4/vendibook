import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import PageShell from '../components/layout/PageShell';
import ListSkeleton from '../components/ListSkeleton';
import { useAuth } from '../hooks/useAuth';
import { useAppStatus } from '../hooks/useAppStatus';

const HOST_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

const STATUS_PARAM_MAP = {
  UPCOMING: 'PENDING,APPROVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-rose-100 text-rose-700',
  DECLINED: 'bg-rose-100 text-rose-700'
};

const TIMELINE_BADGES = {
  upcoming: 'bg-slate-100 text-slate-700',
  active: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700'
};

const BOOKING_MODE_LABELS = {
  daily: 'Daily booking',
  'daily-with-time': 'Daily w/ time',
  hourly: 'Hourly booking'
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
  return `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}`;
};

const buildTimelineBadge = (booking) => {
  if (booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
    return { label: 'Cancelled', className: TIMELINE_BADGES.cancelled };
  }

  const now = Date.now();
  const start = new Date(booking.startDateTime || booking.startDate).getTime();
  const end = new Date(booking.endDateTime || booking.endDate).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { label: 'Scheduled', className: TIMELINE_BADGES.upcoming };
  }

  if (now < start) {
    return { label: 'Upcoming', className: TIMELINE_BADGES.upcoming };
  }

  if (now >= start && now <= end) {
    return { label: 'In progress', className: TIMELINE_BADGES.active };
  }

  return { label: 'Completed', className: TIMELINE_BADGES.completed };
};

export function HostBookingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, token, isAuthenticated } = useAuth();
  const { setGlobalLoading, setGlobalError } = useAppStatus();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const initialFilter = HOST_FILTERS.some((filter) => filter.value === searchParams.get('status'))
    ? searchParams.get('status')
    : 'ALL';
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  const clerkId = useMemo(
    () => user?.clerkId || user?.clerk_id || user?.clerkID || null,
    [user]
  );
  const hostUserId = useMemo(
    () => user?.id || user?._id || user?.userId || null,
    [user]
  );

  useEffect(() => {
    if (!isAuthenticated || !hostUserId) {
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
      params.set('role', 'host');
      const statusParam = STATUS_PARAM_MAP[statusFilter];
      if (statusParam) {
        params.set('status', statusParam);
      }

      let endpoint = '/api/bookings/me';
      if (!clerkId) {
        endpoint = '/api/bookings';
        if (hostUserId) {
          params.set('userId', hostUserId);
        }
        params.set('role', 'host');
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
          throw new Error(payload.message || payload.error || 'Failed to load host bookings');
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
        setGlobalError(error.message || 'Failed to load host bookings');
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
  }, [statusFilter, isAuthenticated, hostUserId, clerkId, token, setGlobalLoading, setGlobalError]);

  const filteredBookings = useMemo(() => {
    if (statusFilter !== 'UPCOMING') {
      return bookings;
    }
    const now = Date.now();
    return bookings.filter((booking) => {
      if (booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
        return false;
      }
      const start = new Date(booking.startDateTime || booking.startDate).getTime();
      return !Number.isNaN(start) && start >= now;
    });
  }, [bookings, statusFilter]);

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

    if (filteredBookings.length === 0) {
      return (
        <EmptyState
          title={isAuthenticated ? 'No bookings for this filter' : 'Sign in to manage bookings'}
          description={
            isAuthenticated
              ? 'Bookings that match this status will appear here as soon as renters send new requests.'
              : 'Log in to review renter requests and manage your calendar.'
          }
          action={{
            label: isAuthenticated ? 'View Listings' : 'Sign In',
            onClick: () => navigate(isAuthenticated ? '/host/dashboard' : '/login')
          }}
        />
      );
    }

    return (
      <ul className="space-y-4" aria-label="Host bookings list">
        {filteredBookings.map((booking) => {
          const timelineBadge = buildTimelineBadge(booking);
          const renterName =
            booking.renter?.displayName || booking.renter?.firstName || booking.renter?.email || 'Renter pending';
          return (
            <li
              key={booking.id}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md focus-within:ring-2 focus-within:ring-orange-400"
              onClick={() => handleRowClick(booking)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      {booking.listing?.listingType || 'Listing'}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {booking.listing?.title || 'Listing removed'}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {booking.listing
                        ? `${booking.listing.city || 'City'}, ${booking.listing.state || 'State'}`
                        : 'Location TBA'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      STATUS_COLORS[booking.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {booking.status || 'PENDING'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>{renterName}</span>
                  </div>
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
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-slate-700">
                    {booking.bookingMode ? BOOKING_MODE_LABELS[booking.bookingMode] || booking.bookingMode : 'Booking'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${timelineBadge.className}`}>
                    {timelineBadge.label}
                  </span>
                  <span className="text-base font-semibold text-slate-900">
                    {formatAmount(booking.totalPrice, booking.currency)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <PageShell
      title="Host bookings"
      subtitle="Monitor renter requests, timelines, and payouts in one place"
      maxWidth="max-w-5xl"
      action={{ label: 'Host Dashboard', onClick: () => navigate('/host/dashboard') }}
    >
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter bookings by status">
        {HOST_FILTERS.map((filter) => (
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

