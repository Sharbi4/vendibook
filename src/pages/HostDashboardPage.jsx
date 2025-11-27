import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  UserRound,
  Settings
} from 'lucide-react';
import { useHostDashboardData } from '../hooks/useHostDashboardData';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const formatPrice = (value) => {
  if (!Number.isFinite(value)) return '—';
  return currency.format(value);
};

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  active: 'bg-emerald-50 text-emerald-700',
  accepted: 'bg-emerald-50 text-emerald-700',
  in_progress: 'bg-sky-50 text-sky-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-rose-50 text-rose-600'
};

function HostDashboardPage() {
  const navigate = useNavigate();
  const { data, status, error, refetch } = useHostDashboardData();
  const summary = data.summary || {};
  const listings = data.listings || [];
  const bookings = data.bookings || [];
  const isLoading = status === 'loading';

  const kpis = useMemo(() => (
    [
      {
        label: 'Total listings',
        value: summary.totalListings ?? 0,
        accent: 'bg-orange-500/10 text-orange-600',
        icon: <ClipboardList className="h-5 w-5" />
      },
      {
        label: 'Active bookings',
        value: summary.activeBookings ?? 0,
        accent: 'bg-emerald-500/10 text-emerald-600',
        icon: <CalendarDays className="h-5 w-5" />
      },
      {
        label: 'Upcoming bookings',
        value: summary.upcomingBookings ?? 0,
        accent: 'bg-sky-500/10 text-sky-600',
        icon: <TrendingUp className="h-5 w-5" />
      },
      {
        label: 'Unread messages',
        value: summary.unreadMessages ?? 0,
        accent: 'bg-purple-500/10 text-purple-600',
        icon: <MessageSquare className="h-5 w-5" />
      }
    ]
  ), [summary]);

  const renderKpiSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="mt-4 h-8 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const renderListingsSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-20 rounded bg-slate-100" />
          <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const renderBookingsSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const handleCreateListing = () => navigate('/host/onboarding');

  const handleViewListing = (listingId) => navigate(`/listing/${listingId}`);

  const safeBookings = bookings.slice(0, 6);
  const safeListings = listings.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <header className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Host hub</p>
            <h1 className="text-3xl font-bold text-slate-900">Host dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Track your listings, bookings, and activity in one place.</p>
          </div>
          <button
            type="button"
            onClick={handleCreateListing}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600"
          >
            <PlusCircle className="h-4 w-4" />
            Create new listing
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
            <button
              type="button"
              onClick={refetch}
              className="ml-3 inline-flex items-center text-xs font-semibold text-rose-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? renderKpiSkeleton() : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className={`inline-flex items-center justify-center rounded-full ${kpi.accent} p-3`}>{kpi.icon}</div>
                <p className="mt-4 text-sm font-semibold text-slate-500">{kpi.label}</p>
                <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Your listings</h2>
                  <p className="text-sm text-slate-500">Manage your active rentals and Event Pros.</p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateListing}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Create listing
                </button>
              </div>

              <div className="mt-5">
                {isLoading ? renderListingsSkeleton() : (
                  safeListings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                      <p className="text-base font-semibold text-slate-800">You haven&apos;t added any listings yet</p>
                      <p className="mt-1 text-sm text-slate-600">Launch your first rental or Event Pro offer to start booking.</p>
                      <button
                        type="button"
                        onClick={handleCreateListing}
                        className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Create your first listing
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {safeListings.map((listing) => (
                        <div key={listing.id} className="grid gap-4 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{listing.title}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                                {listing.listingType?.replace(/_/g, ' ') || 'Rental'}
                              </span>
                              {listing.city && (
                                <span>{listing.city}{listing.state ? `, ${listing.state}` : ''}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Starting at</p>
                            <p className="text-lg font-semibold text-slate-900">
                              {listing.price != null ? formatPrice(Number(listing.price)) : '—'}
                            </p>
                          </div>
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleViewListing(listing.id)}
                              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                            >
                              View →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent bookings</h2>
                  <p className="text-sm text-slate-500">Keep tabs on incoming work and what&apos;s on deck.</p>
                </div>
              </div>

              <div className="mt-5">
                {isLoading ? renderBookingsSkeleton() : (
                  safeBookings.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
                      No bookings to show yet. Once requests arrive, they&apos;ll appear here with quick actions.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {safeBookings.map((booking) => {
                        const statusKey = (booking.status || '').toLowerCase();
                        const badgeColor = STATUS_COLORS[statusKey] || 'bg-slate-100 text-slate-700';
                        const dateDisplay = booking.startDate && booking.endDate
                          ? `${booking.startDate} → ${booking.endDate}`
                          : booking.startDate || 'Date TBD';
                        return (
                          <div key={booking.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{booking.listingTitle || 'Booking'}</p>
                                <p className="text-xs text-slate-500">{dateDisplay}</p>
                              </div>
                              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                                {booking.status || 'Pending'}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                              <p>
                                {booking.city && (
                                  <span>{booking.city}{booking.state ? `, ${booking.state}` : ''}</span>
                                )}
                              </p>
                              <p className="font-semibold text-slate-900">{booking.totalPrice != null ? formatPrice(Number(booking.totalPrice)) : '—'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Messages & notifications</h2>
                <MessageSquare className="h-5 w-5 text-orange-500" />
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Stay responsive to keep your reliability score strong.
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-4xl font-bold text-slate-900">{summary.unreadMessages ?? 0}</p>
                <p className="text-sm text-slate-500">unread threads</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100"
              >
                Open inbox
              </button>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-600">Jump into your most-used workflows.</p>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleCreateListing}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:border-orange-200 hover:bg-white"
                >
                  <span>Create new listing</span>
                  <PlusCircle className="h-4 w-4 text-orange-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:border-orange-200 hover:bg-white"
                >
                  <span>View profile</span>
                  <UserRound className="h-4 w-4 text-orange-500" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/profile?tab=settings') /* TODO: sync profile tabs with query params */}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:border-orange-200 hover:bg-white"
                >
                  <span>Manage settings</span>
                  <Settings className="h-4 w-4 text-orange-500" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HostDashboardPage;
