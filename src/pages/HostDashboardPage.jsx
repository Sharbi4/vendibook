import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  UserRound,
  Settings,
  ArrowRight,
  Search,
  MapPin,
  X,
  Truck,
  Store,
  Users,
  Calendar,
  ShoppingCart,
  Sparkles,
  DollarSign,
  ChefHat,
  Music,
  Camera,
  Tent,
  TreePine
} from 'lucide-react';
import { useHostDashboardData } from '../hooks/useHostDashboardData';
import { USER_ROLE_LABELS, USER_ROLES } from '../constants/roles';
import { useCurrentRole } from '../hooks/useCurrentRole';
import AppLayout from '../layouts/AppLayout.jsx';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const formatPrice = (value) => {
  if (!Number.isFinite(value)) return '—';
  return currency.format(value);
};

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
};

// Listing creation options for different types
const LISTING_CREATE_OPTIONS = [
  {
    id: 'rental',
    title: 'Rental Listing',
    subtitle: 'Rent out your food truck, trailer, or kitchen space',
    icon: Truck,
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    href: '/host/onboarding?type=rental'
  },
  {
    id: 'sale',
    title: 'For Sale Listing',
    subtitle: 'Sell your truck, trailer, or equipment',
    icon: DollarSign,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/host/onboarding?type=seller'
  },
  {
    id: 'event-pro',
    title: 'Event Pro Profile',
    subtitle: 'Offer catering, DJ, photo, or event services',
    icon: Sparkles,
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/host/onboarding?type=eventPro'
  },
  {
    id: 'farmers-market',
    title: 'Farmers Market / Night Market',
    subtitle: 'Create a vendor event with booth spaces',
    icon: TreePine,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    href: '/host/onboarding?type=vendor_space'
  },
  {
    id: 'pop-up',
    title: 'Pop-up Event',
    subtitle: 'Host a one-time or recurring vendor event',
    icon: Tent,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    href: '/host/onboarding?type=vendor_space&subtype=popup'
  }
];

function HostDashboardPage() {
  const navigate = useNavigate();
  const { data, status, error, refetch } = useHostDashboardData();
  const { currentRole, setCurrentRole, isHost, isSeller, isVendorOrganizer } = useCurrentRole();
  const summary = data.summary || {};
  const listings = data.listings || [];
  const bookings = data.bookings || [];
  const isLoading = status === 'loading';

  // Compact search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState({ label: '', lat: null, lng: null });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const kpis = useMemo(() => ([
    {
      label: 'Total listings',
      value: summary.totalListings ?? 0,
      accent: 'bg-[#FF5124]/10 text-[#FF5124]',
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
  ]), [summary]);

  const roleCopy = {
    [USER_ROLES.HOST]: {
      badge: 'Host Dashboard',
      title: 'Welcome back',
      subtitle: 'Track your rentals, listings, and bookings',
      listingSectionTitle: 'Your listings',
      listingEmptyTitle: "You haven't added any listings yet",
      listingEmptySubtitle: 'Create your first listing to start earning.',
      bookingsTitle: 'Recent bookings'
    },
    [USER_ROLES.EVENT_PRO]: {
      badge: 'Event Pro Dashboard',
      title: 'Event Pro Hub',
      subtitle: 'Showcase your event packages and bookings',
      listingSectionTitle: 'Your Event Pro offerings',
      listingEmptyTitle: 'No Event Pro offerings yet',
      listingEmptySubtitle: 'Add your first package to attract hosts.',
      bookingsTitle: 'Recent bookings'
    },
    [USER_ROLES.SELLER]: {
      badge: 'Seller Dashboard',
      title: 'Seller Hub',
      subtitle: 'Manage your trucks and trailers for sale',
      listingSectionTitle: 'Your for-sale listings',
      listingEmptyTitle: 'No vehicles listed yet',
      listingEmptySubtitle: 'Add a truck or trailer so buyers can reach out.',
      bookingsTitle: 'Recent inquiries'
    },
    [USER_ROLES.VENDOR_ORGANIZER]: {
      badge: 'Market Organizer',
      title: 'Market Organizer Hub',
      subtitle: 'Create events, manage vendor spaces, and track bookings',
      listingSectionTitle: 'Your events & markets',
      listingEmptyTitle: 'No events created yet',
      listingEmptySubtitle: 'Create your first farmers market or pop-up event.',
      bookingsTitle: 'Vendor bookings'
    }
  };

  const activeRoleCopy = roleCopy[currentRole] || roleCopy[USER_ROLES.HOST];

  const handleViewListing = (listingId) => navigate(\`/listing/\${listingId}\`);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (searchLocation.label) params.set('location', searchLocation.label);
    navigate(\`/listings?\${params.toString()}\`);
  };

  const safeBookings = bookings.slice(0, 6);
  const safeListings = listings.slice(0, 8);

  const renderRoleSwitcher = () => (
    <div className="flex flex-wrap gap-2">
      {Object.values(USER_ROLES).map((role) => {
        const isActive = currentRole === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => setCurrentRole(role)}
            className={\`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 \${
              isActive
                ? 'bg-[#FF5124] text-white shadow-lg shadow-[#FF5124]/25'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-[#FF5124]/40 hover:bg-slate-50'
            }\`}
          >
            {USER_ROLE_LABELS[role]}
          </button>
        );
      })}
    </div>
  );

  const renderKpiSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl bg-white p-5 shadow-sm animate-pulse">
          <div className="h-10 w-10 rounded-full bg-slate-100" />
          <div className="mt-4 h-4 w-24 rounded bg-slate-100" />
          <div className="mt-2 h-8 w-16 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  const renderListingsSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-3 h-4 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout>
      {/* Compact Search Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Compact search bar */}
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-xl">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 transition-all focus-within:border-[#FF5124] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF5124]/20">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your listings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <div className="hidden h-5 w-px bg-slate-200 sm:block" />
                  <div className="hidden items-center gap-2 sm:flex">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={searchLocation.label}
                      onChange={(e) => setSearchLocation({ ...searchLocation, label: e.target.value })}
                      className="w-28 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-full bg-[#FF5124] p-2.5 text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-xl"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Create new listing button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5124] to-[#FF8C00] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4" />
              Create Listing
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Header */}
      <header className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full bg-[#FF5124]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#FF5124]">
                {activeRoleCopy.badge}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {activeRoleCopy.title}
              </h1>
              <p className="mt-2 text-base text-slate-600">{activeRoleCopy.subtitle}</p>
            </div>
            {renderRoleSwitcher()}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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

        {/* KPI Cards */}
        {isLoading ? renderKpiSkeleton() : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="group rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-slate-200">
                <div className={\`inline-flex items-center justify-center rounded-xl \${kpi.accent} p-3\`}>
                  {kpi.icon}
                </div>
                <p className="mt-4 text-sm font-medium text-slate-500">{kpi.label}</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Create Cards - Farmers Market / Event Focus */}
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create a new listing</h2>
              <p className="text-sm text-slate-600">Choose what you want to list on Vendibook</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {LISTING_CREATE_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => navigate(option.href)}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-1"
                >
                  <div className={\`mb-4 inline-flex items-center justify-center rounded-xl \${option.bgColor} p-3\`}>
                    <Icon className={\`h-6 w-6 \${option.iconColor}\`} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{option.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{option.subtitle}</p>
                  <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-slate-300 transition-all group-hover:text-[#FF5124] group-hover:translate-x-1" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          {/* Listings Section */}
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeRoleCopy.listingSectionTitle}</h2>
                  <p className="text-sm text-slate-500">Manage and edit your active listings</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="text-sm font-semibold text-[#FF5124] hover:text-[#E5481F] transition-colors"
                >
                  + Add new
                </button>
              </div>

              {isLoading ? renderListingsSkeleton() : (
                safeListings.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5124]/10">
                      <ClipboardList className="h-7 w-7 text-[#FF5124]" />
                    </div>
                    <p className="text-base font-semibold text-slate-800">{activeRoleCopy.listingEmptyTitle}</p>
                    <p className="mt-1 text-sm text-slate-600">{activeRoleCopy.listingEmptySubtitle}</p>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(true)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Create your first listing
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {safeListings.map((listing) => (
                      <div key={listing.id} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        {/* Thumbnail */}
                        <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {listing.imageUrl ? (
                            <img src={listing.imageUrl} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Store className="h-6 w-6 text-slate-300" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-slate-900 truncate">{listing.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              {listing.listingType?.replace(/_/g, ' ') || 'Listing'}
                            </span>
                            {listing.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {listing.city}{listing.state ? \`, \${listing.state}\` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {listing.price != null ? formatPrice(Number(listing.price)) : '—'}
                          </p>
                          {listing.priceUnit && (
                            <p className="text-xs text-slate-500">/ {listing.priceUnit}</p>
                          )}
                        </div>
                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => handleViewListing(listing.id)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 opacity-0 transition-all group-hover:opacity-100 hover:border-[#FF5124] hover:text-[#FF5124]"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </section>

            {/* Bookings Section */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeRoleCopy.bookingsTitle}</h2>
                  <p className="text-sm text-slate-500">Track incoming requests and confirmations</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/host/bookings')}
                  className="text-sm font-semibold text-[#FF5124] hover:text-[#E5481F] transition-colors"
                >
                  View all →
                </button>
              </div>

              {isLoading ? renderListingsSkeleton() : (
                safeBookings.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600">
                    No bookings to show yet. Once requests arrive, they will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {safeBookings.map((booking) => {
                      const statusKey = (booking.status || '').toLowerCase();
                      const badgeColor = STATUS_COLORS[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200';
                      const dateDisplay = booking.startDate && booking.endDate
                        ? \`\${booking.startDate} → \${booking.endDate}\`
                        : booking.startDate || 'Date TBD';
                      return (
                        <div key={booking.id} className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 transition-all hover:bg-white hover:border-slate-200">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{booking.listingTitle || 'Booking'}</p>
                              <p className="text-xs text-slate-500">{dateDisplay}</p>
                            </div>
                            <span className={\`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold \${badgeColor}\`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <p className="text-slate-500">
                              {booking.city && \`\${booking.city}\${booking.state ? \`, \${booking.state}\` : ''}\`}
                            </p>
                            <p className="font-semibold text-slate-900">
                              {booking.totalPrice != null ? formatPrice(Number(booking.totalPrice)) : '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Messages Card */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Messages</h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5124]/10">
                  <MessageSquare className="h-5 w-5 text-[#FF5124]" />
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Stay responsive to keep your reliability score high.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-4xl font-bold tracking-tight text-slate-900">{summary.unreadMessages ?? 0}</p>
                <p className="text-sm text-slate-500">unread</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="mt-5 w-full rounded-xl bg-[#FF5124]/10 px-4 py-3 text-sm font-semibold text-[#FF5124] transition-all hover:bg-[#FF5124]/20"
              >
                Open inbox
              </button>
            </section>

            {/* Quick Actions */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
              <div className="mt-4 space-y-2">
                {[
                  { label: 'View analytics', icon: TrendingUp, href: '/analytics' },
                  { label: 'Edit profile', icon: UserRound, href: '/profile' },
                  { label: 'Settings', icon: Settings, href: '/profile?tab=settings' }
                ].map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => navigate(action.href)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-all hover:border-slate-200 hover:bg-white"
                  >
                    <span>{action.label}</span>
                    <action.icon className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>

            {/* Tip Card */}
            <section className="rounded-3xl bg-gradient-to-br from-[#FF5124] to-[#FF8C00] p-6 text-white">
              <h3 className="text-lg font-bold">Pro tip</h3>
              <p className="mt-2 text-sm text-white/90">
                Add multiple high-quality photos to your listings. Listings with 5+ images get 40% more bookings!
              </p>
              <button
                type="button"
                onClick={() => navigate('/host/listings')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/30"
              >
                Manage listings
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </div>
        </div>
      </main>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl mx-4 rounded-3xl bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">What would you like to create?</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a listing type to get started</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {LISTING_CREATE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      navigate(option.href);
                    }}
                    className="group flex items-start gap-4 rounded-2xl border border-slate-200 p-4 text-left transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
                  >
                    <div className={\`flex-shrink-0 rounded-xl \${option.bgColor} p-3\`}>
                      <Icon className={\`h-5 w-5 \${option.iconColor}\`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-[#FF5124]">{option.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-500">{option.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default HostDashboardPage;
