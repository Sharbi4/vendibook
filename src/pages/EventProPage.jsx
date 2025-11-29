import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, SlidersHorizontal, X, Star, 
  Users, Sparkles, Grid3X3, Map as MapIcon, Music, Camera, ChefHat, Mic2
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import VendibookMap from '../components/VendibookMap';
import ListingCardModern from '../components/ListingCardModern';
import { useListings } from '../hooks/useListings';

// Sample event pro listings
const SAMPLE_EVENT_PROS = [
  {
    id: 'pro-1',
    title: 'Chef Marco - Italian Catering',
    description: 'Professional Italian chef available for private events, weddings, and corporate catering. 15+ years experience.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    price: 500,
    priceUnit: 'event',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4255,
    longitude: -111.9400,
    rating: 5.0,
    reviews: 42,
    host: 'Chef Marco',
    isVerified: true,
    features: ['Italian cuisine', '15+ years', 'Weddings'],
    category: 'catering',
    serviceType: 'catering'
  },
  {
    id: 'pro-2',
    title: 'DJ Beats - Mobile Entertainment',
    description: 'Professional DJ with full sound system and lighting. Weddings, parties, corporate events.',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=800&q=80',
    price: 350,
    priceUnit: 'event',
    city: 'Tucson',
    state: 'AZ',
    latitude: 32.2540,
    longitude: -110.9742,
    rating: 4.8,
    reviews: 67,
    host: 'DJ Beats Entertainment',
    isVerified: true,
    features: ['Sound system', 'Lighting', 'All events'],
    category: 'entertainment',
    serviceType: 'dj'
  },
  {
    id: 'pro-3',
    title: 'Event Photographer - Premium',
    description: 'Professional event photographer with 10+ years experience. Weddings, corporate, parties.',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&q=80',
    price: 750,
    priceUnit: 'event',
    city: 'Scottsdale',
    state: 'AZ',
    latitude: 33.5091,
    longitude: -111.8986,
    rating: 4.9,
    reviews: 89,
    host: 'Lens Master Photography',
    isVerified: true,
    features: ['10+ years', 'All events', 'Same-day preview'],
    category: 'photography',
    serviceType: 'photographer'
  },
  {
    id: 'pro-4',
    title: 'Taco Truck Catering',
    description: 'Authentic Mexican food truck available for events. Fresh tacos, burritos, and more.',
    image: 'https://images.unsplash.com/photo-1567129937968-cdad8f07d5f3?auto=format&fit=crop&w=800&q=80',
    price: 600,
    priceUnit: 'event',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4484,
    longitude: -112.074,
    rating: 4.7,
    reviews: 35,
    host: "Maria's Food Truck",
    isVerified: true,
    features: ['Mexican cuisine', 'On-site cooking', '50-200 guests'],
    category: 'food-truck',
    serviceType: 'food-truck'
  },
  {
    id: 'pro-5',
    title: 'Mobile Bartending Service',
    description: 'Licensed mobile bartending with full bar setup. Signature cocktails, beer, wine.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
    price: 450,
    priceUnit: 'event',
    city: 'Tempe',
    state: 'AZ',
    latitude: 33.4152,
    longitude: -111.8315,
    rating: 4.9,
    reviews: 28,
    host: 'Cocktail Craftsmen',
    isVerified: true,
    features: ['Full bar', 'Signature cocktails', 'Licensed'],
    category: 'bartending',
    serviceType: 'bartender'
  },
  {
    id: 'pro-6',
    title: 'Live Band - Cover & Originals',
    description: '5-piece live band playing classic rock, pop, and wedding favorites. Full PA system included.',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    price: 1200,
    priceUnit: 'event',
    city: 'Mesa',
    state: 'AZ',
    latitude: 33.3528,
    longitude: -111.7890,
    rating: 5.0,
    reviews: 19,
    host: 'Desert Groove Band',
    isVerified: true,
    features: ['5-piece band', 'PA included', 'All genres'],
    category: 'entertainment',
    serviceType: 'band'
  }
];

const SERVICE_OPTIONS = [
  { value: '', label: 'All Services' },
  { value: 'catering', label: 'Catering' },
  { value: 'food-truck', label: 'Food Truck' },
  { value: 'bartender', label: 'Bartending' },
  { value: 'dj', label: 'DJ' },
  { value: 'band', label: 'Live Band' },
  { value: 'photographer', label: 'Photography' },
  { value: 'other', label: 'Other' }
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Any Budget' },
  { value: '0-300', label: 'Under $300' },
  { value: '300-500', label: '$300 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000+', label: '$1,000+' }
];

const HEADCOUNT_OPTIONS = [
  { value: '', label: 'Any Size' },
  { value: '1-50', label: 'Under 50 guests' },
  { value: '50-100', label: '50 - 100 guests' },
  { value: '100-200', label: '100 - 200 guests' },
  { value: '200+', label: '200+ guests' }
];

export default function EventProPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const listingRefs = useRef({});

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    serviceType: searchParams.get('service') || '',
    budget: searchParams.get('budget') || '',
    headcount: searchParams.get('headcount') || '',
    eventDate: searchParams.get('date') || ''
  });

  const { listings: apiListings, loading } = useListings({ mode: 'event-pro', ...filters });
  const listings = apiListings.length > 0 ? apiListings : SAMPLE_EVENT_PROS;

  // Apply filters
  const filteredListings = listings.filter(listing => {
    if (filters.serviceType && listing.serviceType !== filters.serviceType) return false;
    if (filters.budget) {
      const price = listing.price;
      if (filters.budget === '0-300' && price >= 300) return false;
      if (filters.budget === '300-500' && (price < 300 || price >= 500)) return false;
      if (filters.budget === '500-1000' && (price < 500 || price >= 1000)) return false;
      if (filters.budget === '1000+' && price < 1000) return false;
    }
    if (filters.location) {
      const loc = `${listing.city} ${listing.state}`.toLowerCase();
      if (!loc.includes(filters.location.toLowerCase())) return false;
    }
    return true;
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      serviceType: '',
      budget: '',
      headcount: '',
      eventDate: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const getServiceIcon = (type) => {
    switch (type) {
      case 'catering': return ChefHat;
      case 'dj': return Music;
      case 'band': return Mic2;
      case 'photographer': return Camera;
      default: return Sparkles;
    }
  };

  return (
    <AppLayout fullWidth contentClassName="bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              Event Pros
            </span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Book Event Professionals
          </h1>
          <p className="max-w-2xl text-lg text-white/90">
            Find and book verified caterers, DJs, photographers, bartenders, and more for your next event. All professionals are vetted and reviewed.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4 py-4 overflow-x-auto">
            {/* Location */}
            <div className="relative min-w-[200px]">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Service Type */}
            <select
              value={filters.serviceType}
              onChange={(e) => updateFilter('serviceType', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              {SERVICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Budget */}
            <select
              value={filters.budget}
              onChange={(e) => updateFilter('budget', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              {BUDGET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Headcount */}
            <select
              value={filters.headcount}
              onChange={(e) => updateFilter('headcount', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              {HEADCOUNT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Event Date */}
            <div className="relative min-w-[180px]">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={filters.eventDate}
                onChange={(e) => updateFilter('eventDate', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* View Toggle */}
            <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pb-4">
              {Object.entries(filters).filter(([_, v]) => v).map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                  {value}
                  <button onClick={() => updateFilter(key, '')} className="ml-1 hover:text-emerald-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-sm font-medium text-emerald-600 hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredListings.length}</span> event professionals available
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            All pros are verified and reviewed
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCardModern key={listing.id} listing={listing} variant="featured" />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 h-[calc(100vh-280px)]">
            <div className="w-[400px] flex-shrink-0 overflow-y-auto space-y-4 pr-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  ref={(el) => { listingRefs.current[listing.id] = el; }}
                  onMouseEnter={() => setHoveredListingId(listing.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                >
                  <ListingCardModern listing={listing} />
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-hidden rounded-xl border border-slate-200">
              <VendibookMap
                center={{ lat: 33.4484, lng: -112.074 }}
                zoom={10}
                markers={filteredListings.filter(l => l.latitude && l.longitude).map(l => ({
                  id: l.id,
                  lat: l.latitude,
                  lng: l.longitude,
                  title: l.title,
                  price: l.price
                }))}
                activeMarkerId={hoveredListingId}
                onMarkerClick={(id) => {
                  const ref = listingRefs.current[id];
                  if (ref) ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No event pros found</h3>
            <p className="mb-6 max-w-md text-slate-500">
              Try adjusting your filters or search for a different location.
            </p>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
