import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarDays,
  History,
  Heart,
  MessageSquare,
  Search,
  ArrowRight,
  Star,
  CheckCircle,
  AlertCircle,
  Truck,
  Package,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../hooks/useAuth';

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

const formatAmount = (value, currency = 'USD') => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const STATUS_COLORS = {
  Requested: 'bg-amber-50 text-amber-700 border-amber-200',
  HostApproved: 'bg-sky-50 text-sky-700 border-sky-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  InProgress: 'bg-purple-50 text-purple-700 border-purple-200',
  Completed: 'bg-slate-100 text-slate-600 border-slate-200',
  Canceled: 'bg-rose-50 text-rose-600 border-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-sky-50 text-sky-700 border-sky-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IN_PROGRESS: 'bg-purple-50 text-purple-700 border-purple-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200'
};

const getStatusLabel = (status) => {
  const labels = {
    Requested: 'Pending',
    HostApproved: 'Approved',
    Paid: 'Confirmed',
    InProgress: 'Active',
    Completed: 'Completed',
    Canceled: 'Cancelled',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    PAID: 'Confirmed',
    IN_PROGRESS: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };
  return labels[status] || status || 'Pending';
};

// Demo data for display
const DEMO_UPCOMING_BOOKINGS = [
  {
    id: 1,
    listingTitle: 'Vintage Airstream Food Truck',
    listingImage: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=400&q=80',
    status: 'Paid',
    startDate: '2025-02-15',
    endDate: '2025-02-18',
    location: 'Los Angeles, CA',
    totalPrice: 450,
    hostName: 'Sarah M.',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
  },
  {
    id: 2,
    listingTitle: 'Mobile Coffee Bar Trailer',
    listingImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    status: 'HostApproved',
    startDate: '2025-02-22',
    endDate: '2025-02-23',
    location: 'San Diego, CA',
    totalPrice: 200,
    hostName: 'Mike R.',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
  },
  {
    id: 3,
    listingTitle: 'BBQ Smoker Trailer',
    listingImage: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=80',
    status: 'Requested',
    startDate: '2025-03-01',
    endDate: '2025-03-03',
    location: 'Austin, TX',
    totalPrice: 375,
    hostName: 'James T.',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80'
  }
];

const DEMO_PAST_BOOKINGS = [
  {
    id: 101,
    listingTitle: 'Pizza Oven Trailer',
    listingImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    status: 'Completed',
    startDate: '2025-01-10',
    endDate: '2025-01-12',
    location: 'Phoenix, AZ',
    totalPrice: 320,
    hostName: 'Lisa K.',
    rating: 5,
    hasReview: true
  },
  {
    id: 102,
    listingTitle: 'Ice Cream Cart',
    listingImage: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
    status: 'Completed',
    startDate: '2024-12-20',
    endDate: '2024-12-21',
    location: 'Las Vegas, NV',
    totalPrice: 150,
    hostName: 'Tom B.',
    rating: 4,
    hasReview: false
  }
];

export default function RenterDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState(DEMO_UPCOMING_BOOKINGS);
  const [pastBookings, setPastBookings] = useState(DEMO_PAST_BOOKINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Summary stats
  const stats = useMemo(() => ({
    upcomingCount: upcomingBookings.length,
    pastCount: pastBookings.length,
    totalSpent: [...upcomingBookings, ...pastBookings].reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    wishlistCount: 5
  }), [upcomingBookings, pastBookings]);

  const summaryCards = [
    {
      label: 'Upcoming Bookings',
      value: stats.upcomingCount,
      subtext: 'Next 30 days',
      icon: CalendarDays,
      accent: 'bg-emerald-500/10 text-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100/50',
      href: '/bookings?status=upcoming'
    },
    {
      label: 'Past Bookings',
      value: stats.pastCount,
      subtext: 'All time',
      icon: History,
      accent: 'bg-slate-500/10 text-slate-600',
      bgGradient: 'from-slate-50 to-slate-100/50',
      href: '/bookings?status=completed'
    },
    {
      label: 'Total Spent',
      value: formatAmount(stats.totalSpent),
      subtext: 'This year',
      icon: Wallet,
      accent: 'bg-[#FF5124]/10 text-[#FF5124]',
      bgGradient: 'from-orange-50 to-orange-100/50',
      href: '/bookings',
      isAmount: true
    },
    {
      label: 'Saved Items',
      value: stats.wishlistCount,
      subtext: 'In your wishlist',
      icon: Heart,
      accent: 'bg-rose-500/10 text-rose-600',
      bgGradient: 'from-rose-50 to-rose-100/50',
      href: '/wishlist'
    }
  ];

  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex gap-4">
            <div className="h-24 w-32 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-3/4 rounded bg-slate-100" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-1/4 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBookingCard = (booking, isPast = false) => {
    const status = booking.status || booking.state;
    const statusColor = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600 border-slate-200';

    return (
      <div
        key={booking.id}
        onClick={() => navigate(`/listing/${booking.listingId || booking.id}`)}
        className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5"
      >
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {booking.listingImage ? (
              <img
                src={booking.listingImage}
                alt={booking.listingTitle}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Truck className="h-8 w-8 text-slate-300" />
              </div>
            )}
            {isPast && booking.rating && (
              <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-full bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {booking.rating}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-[#FF5124] transition-colors">
                  {booking.listingTitle}
                </h3>
                <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {booking.location}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatAmount(booking.totalPrice)}</p>
            </div>

            {/* Host info or review prompt */}
            {!isPast && booking.hostName && (
              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-100">
                {booking.hostAvatar && (
                  <img src={booking.hostAvatar} alt={booking.hostName} className="h-6 w-6 rounded-full object-cover" />
                )}
                <span className="text-sm text-slate-600">Hosted by <span className="font-medium text-slate-800">{booking.hostName}</span></span>
              </div>
            )}

            {isPast && !booking.hasReview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Open review modal
                  console.log('Leave review for:', booking.id);
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#FF5124] hover:text-[#E5481F] transition-colors"
              >
                <Star className="h-4 w-4" />
                Leave a review
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center rounded-full bg-[#FF5124]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#FF5124]">
                My Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="mt-2 text-base text-slate-600">Manage your bookings and discover new listings</p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5124] to-[#FF8C00] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              Find Rentals
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                onClick={() => navigate(card.href)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bgGradient} p-5 shadow-sm border border-white/60 transition-all hover:shadow-lg hover:-translate-y-0.5 text-left`}
              >
                <div className="flex items-start justify-between">
                  <div className={`inline-flex items-center justify-center rounded-xl ${card.accent} p-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:text-slate-600" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">{card.label}</p>
                <p className={`text-3xl font-bold tracking-tight text-slate-900 ${card.isAmount ? 'text-2xl' : ''}`}>{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.subtext}</p>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Left Column - Bookings */}
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upcoming Bookings</h2>
                  <p className="text-sm text-slate-500">Your scheduled rentals and reservations</p>
                </div>
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-sm font-semibold text-[#FF5124] hover:text-[#E5481F] transition-colors flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                renderSkeleton()
              ) : upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5124]/10">
                    <CalendarDays className="h-7 w-7 text-[#FF5124]" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">No upcoming bookings</p>
                  <p className="mt-1 text-sm text-slate-600">Start exploring to find your next rental</p>
                  <button
                    onClick={() => navigate('/listings')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]"
                  >
                    <Search className="h-4 w-4" />
                    Browse Listings
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => renderBookingCard(booking, false))}
                </div>
              )}
            </section>

            {/* Past Bookings */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Past Bookings</h2>
                  <p className="text-sm text-slate-500">Your rental history</p>
                </div>
                <button
                  onClick={() => navigate('/bookings?status=completed')}
                  className="text-sm font-semibold text-[#FF5124] hover:text-[#E5481F] transition-colors flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {isLoading ? (
                renderSkeleton()
              ) : pastBookings.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-600">
                  No past bookings yet. Once you complete a rental, it will appear here.
                </p>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => renderBookingCard(booking, true))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Browse listings', icon: Search, href: '/listings' },
                  { label: 'View wishlist', icon: Heart, href: '/wishlist' },
                  { label: 'Messages', icon: MessageSquare, href: '/messages' },
                  { label: 'Edit profile', icon: TrendingUp, href: '/profile' }
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.href)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-left text-sm font-medium text-slate-800 transition-all hover:border-slate-200 hover:bg-white"
                  >
                    <span>{action.label}</span>
                    <action.icon className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>

            {/* Messages Preview */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Messages</h2>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5124]/10">
                  <MessageSquare className="h-4 w-4 text-[#FF5124]" />
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Stay in touch with hosts and get quick responses to your questions.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-4xl font-bold tracking-tight text-slate-900">0</p>
                <p className="text-sm text-slate-500">unread</p>
              </div>
              <button
                onClick={() => navigate('/messages')}
                className="mt-5 w-full rounded-xl bg-[#FF5124]/10 px-4 py-3 text-sm font-semibold text-[#FF5124] transition-all hover:bg-[#FF5124]/20"
              >
                Open inbox
              </button>
            </section>

            {/* Tip Card */}
            <section className="rounded-3xl bg-gradient-to-br from-[#FF5124] to-[#FF8C00] p-6 text-white">
              <h3 className="text-lg font-bold">Looking for something specific?</h3>
              <p className="mt-2 text-sm text-white/90">
                Use our advanced search filters to find the perfect food truck, trailer, or equipment for your next event.
              </p>
              <button
                onClick={() => navigate('/rent')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/30"
              >
                Explore rentals
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
