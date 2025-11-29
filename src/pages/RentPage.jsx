import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Calendar, SlidersHorizontal, X, Star, 
  Truck, ChevronDown, Grid3X3, Map as MapIcon, Heart
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import VendibookMap from '../components/VendibookMap';
import ListingCardModern from '../components/ListingCardModern';
import { useListings } from '../hooks/useListings';

// Sample rental listings for demo
const SAMPLE_RENTALS = [
  {
    id: 'rent-1',
    title: 'Taco Express Food Truck',
    description: 'Fully equipped taco truck with commercial kitchen, seats 2 operators. Perfect for events and festivals.',
    image: 'https://images.unsplash.com/photo-1567129937968-cdad8f07d5f3?auto=format&fit=crop&w=800&q=80',
    price: 350,
    priceUnit: 'day',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4484,
    longitude: -112.074,
    rating: 4.8,
    reviews: 24,
    host: "Maria's Trucks LLC",
    isVerified: true,
    deliveryAvailable: true,
    features: ['Commercial kitchen', 'Generator included', '2 operators'],
    category: 'food-trucks'
  },
  {
    id: 'rent-2',
    title: 'Gourmet Burger Trailer',
    description: 'Premium burger trailer with flat-top grill, fryer, and refrigeration. Great for pop-up events.',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
    price: 275,
    priceUnit: 'day',
    city: 'Tucson',
    state: 'AZ',
    latitude: 32.2226,
    longitude: -110.9747,
    rating: 4.6,
    reviews: 18,
    host: 'Arizona Mobile Eats',
    isVerified: true,
    deliveryAvailable: false,
    features: ['Flat-top grill', 'Deep fryer', 'Refrigeration'],
    category: 'trailers'
  },
  {
    id: 'rent-3',
    title: 'Coffee Cart - Espresso Ready',
    description: 'Compact espresso cart perfect for corporate events, weddings, and farmers markets.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    price: 150,
    priceUnit: 'day',
    city: 'Scottsdale',
    state: 'AZ',
    latitude: 33.4942,
    longitude: -111.9261,
    rating: 4.9,
    reviews: 31,
    host: 'Desert Bean Co',
    isVerified: true,
    deliveryAvailable: true,
    features: ['Espresso machine', 'Grinder', 'Portable'],
    category: 'carts'
  },
  {
    id: 'rent-4',
    title: 'Pizza Oven Trailer',
    description: 'Wood-fired pizza oven trailer. Makes authentic Neapolitan pizza. Great for events!',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    price: 400,
    priceUnit: 'day',
    city: 'Glendale',
    state: 'AZ',
    latitude: 33.5722,
    longitude: -112.0891,
    rating: 4.9,
    reviews: 15,
    host: 'Fired Up Pizza Co',
    isVerified: true,
    deliveryAvailable: true,
    features: ['Wood-fired', 'Neapolitan style', 'Event ready'],
    category: 'trailers'
  },
  {
    id: 'rent-5',
    title: 'Mobile Bar Trailer',
    description: 'Fully licensed mobile bar trailer with tap system and refrigeration. Perfect for weddings.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
    price: 500,
    priceUnit: 'day',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4373,
    longitude: -112.0078,
    rating: 4.7,
    reviews: 22,
    host: 'Pour House Mobile',
    isVerified: true,
    deliveryAvailable: true,
    features: ['Tap system', 'Refrigeration', 'Licensed'],
    category: 'trailers'
  },
  {
    id: 'rent-6',
    title: 'Shaved Ice Trailer',
    description: 'Colorful shaved ice trailer with commercial ice shaver. 20+ flavor syrups included.',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    price: 200,
    priceUnit: 'day',
    city: 'Fountain Hills',
    state: 'AZ',
    latitude: 33.6189,
    longitude: -111.8978,
    rating: 4.4,
    reviews: 9,
    host: 'Chill Zone AZ',
    isVerified: false,
    deliveryAvailable: true,
    features: ['Ice shaver', '20+ flavors', 'Event ready'],
    category: 'trailers'
  }
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'food-trucks', label: 'Food Trucks' },
  { value: 'trailers', label: 'Trailers' },
  { value: 'ghost-kitchens', label: 'Ghost Kitchens' },
  { value: 'carts', label: 'Carts' },
  { value: 'equipment', label: 'Equipment' }
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '0-200', label: 'Under $200/day' },
  { value: '200-400', label: '$200 - $400/day' },
  { value: '400+', label: '$400+/day' }
];

export default function RentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const listingRefs = useRef({});

  // Filter state
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    priceRange: searchParams.get('price') || '',
    delivery: searchParams.get('delivery') || '',
    startDate: searchParams.get('start') || '',
    endDate: searchParams.get('end') || ''
  });

  // Use API listings with fallback to samples
  const { listings: apiListings, loading } = useListings({ mode: 'rent', ...filters });
  const listings = apiListings.length > 0 ? apiListings : SAMPLE_RENTALS;

  // Apply filters
  const filteredListings = listings.filter(listing => {
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.delivery === 'yes' && !listing.deliveryAvailable) return false;
    if (filters.priceRange) {
      const price = listing.price;
      if (filters.priceRange === '0-200' && price >= 200) return false;
      if (filters.priceRange === '200-400' && (price < 200 || price >= 400)) return false;
      if (filters.priceRange === '400+' && price < 400) return false;
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
      category: '',
      priceRange: '',
      delivery: '',
      startDate: '',
      endDate: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <AppLayout fullWidth contentClassName="bg-slate-50">
      {/* Hero/Header */}
      <section className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Rent Food Trucks & Equipment
          </h1>
          <p className="text-lg text-slate-600">
            Find verified food trucks, trailers, ghost kitchens, and commercial equipment for your next event or business launch.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
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
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#FF5A5F] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
              />
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="min-w-[160px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#FF5A5F] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Price */}
            <select
              value={filters.priceRange}
              onChange={(e) => updateFilter('priceRange', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#FF5A5F] focus:outline-none focus:ring-2 focus:ring-[#FF5A5F]/20"
            >
              {PRICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Delivery Toggle */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-300">
              <input
                type="checkbox"
                checked={filters.delivery === 'yes'}
                onChange={(e) => updateFilter('delivery', e.target.checked ? 'yes' : '')}
                className="h-4 w-4 rounded border-slate-300 text-[#FF5A5F] focus:ring-[#FF5A5F]"
              />
              Delivery available
            </label>

            {/* More Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-300"
            >
              <SlidersHorizontal className="h-4 w-4" />
              More filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A5F] text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

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
              {filters.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {filters.location}
                  <button onClick={() => updateFilter('location', '')} className="ml-1 hover:text-slate-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {CATEGORY_OPTIONS.find(c => c.value === filters.category)?.label}
                  <button onClick={() => updateFilter('category', '')} className="ml-1 hover:text-slate-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-sm font-medium text-[#FF5A5F] hover:underline">
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{filteredListings.length}</span> rentals available
            {filters.location && ` near ${filters.location}`}
          </p>
        </div>

        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <ListingCardModern key={listing.id} listing={listing} variant="featured" />
            ))}
          </div>
        ) : (
          /* Map View */
          <div className="flex gap-6 h-[calc(100vh-280px)]">
            {/* Listings sidebar */}
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
            {/* Map */}
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

        {/* Empty state */}
        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Truck className="mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No rentals found</h3>
            <p className="mb-6 max-w-md text-slate-500">
              Try adjusting your filters or search for a different location.
            </p>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#E04E52]"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
