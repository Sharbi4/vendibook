import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, X, Star, 
  Truck, DollarSign, Grid3X3, Map as MapIcon, Tag
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import VendibookMap from '../components/VendibookMap';
import ListingCardModern from '../components/ListingCardModern';
import { useListings } from '../hooks/useListings';

// Sample for-sale listings
const SAMPLE_FOR_SALE = [
  {
    id: 'sale-1',
    title: 'BBQ Smoker Trailer',
    description: 'Professional BBQ smoker trailer, used for 2 seasons. Includes offset smoker and warming box.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    price: 28500,
    priceUnit: null,
    city: 'Tempe',
    state: 'AZ',
    latitude: 33.4152,
    longitude: -111.8315,
    rating: 4.7,
    reviews: 8,
    host: 'Smoke Ring BBQ',
    isVerified: false,
    deliveryAvailable: true,
    features: ['Offset smoker', 'Warming box', 'Low mileage'],
    category: 'trailers',
    condition: 'used',
    year: 2022
  },
  {
    id: 'sale-2',
    title: 'Ice Cream Truck - Vintage Style',
    description: 'Classic 1985 ice cream truck fully restored. Working soft serve machine and freezer units.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    price: 42000,
    priceUnit: null,
    city: 'Mesa',
    state: 'AZ',
    latitude: 33.3528,
    longitude: -111.7890,
    rating: 4.5,
    reviews: 12,
    host: 'Cool Treats AZ',
    isVerified: true,
    deliveryAvailable: false,
    features: ['Soft serve', 'Freezer units', 'Restored classic'],
    category: 'food-trucks',
    condition: 'restored',
    year: 1985
  },
  {
    id: 'sale-3',
    title: "Sarah's Sweet Treats Cart",
    description: 'Custom dessert cart with display case and refrigeration. Perfect for farmers markets.',
    image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80',
    price: 8500,
    priceUnit: null,
    city: 'Gilbert',
    state: 'AZ',
    latitude: 33.3062,
    longitude: -111.8413,
    rating: 4.6,
    reviews: 5,
    host: "Sarah's Sweets",
    isVerified: false,
    deliveryAvailable: false,
    features: ['Display case', 'Refrigerated', 'Custom build'],
    category: 'carts',
    condition: 'like-new',
    year: 2023
  },
  {
    id: 'sale-4',
    title: 'Commercial Food Truck - Turn Key',
    description: 'Fully equipped commercial food truck ready to operate. Includes all kitchen equipment.',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=800&q=80',
    price: 65000,
    priceUnit: null,
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4484,
    longitude: -112.074,
    rating: 4.9,
    reviews: 3,
    host: 'AZ Food Truck Sales',
    isVerified: true,
    deliveryAvailable: true,
    features: ['Turn key', 'Full kitchen', 'Ready to operate'],
    category: 'food-trucks',
    condition: 'new',
    year: 2024
  },
  {
    id: 'sale-5',
    title: 'Mobile Coffee Trailer',
    description: 'Beautiful mobile coffee trailer with La Marzocco espresso machine and cold brew system.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    price: 35000,
    priceUnit: null,
    city: 'Scottsdale',
    state: 'AZ',
    latitude: 33.4942,
    longitude: -111.9261,
    rating: 5.0,
    reviews: 7,
    host: 'Caffeine Dreams',
    isVerified: true,
    deliveryAvailable: true,
    features: ['La Marzocco', 'Cold brew', 'Premium build'],
    category: 'trailers',
    condition: 'like-new',
    year: 2023
  }
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'food-trucks', label: 'Food Trucks' },
  { value: 'trailers', label: 'Trailers' },
  { value: 'carts', label: 'Carts & Kiosks' },
  { value: 'equipment', label: 'Equipment' }
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any Price' },
  { value: '0-20000', label: 'Under $20,000' },
  { value: '20000-50000', label: '$20,000 – $50,000' },
  { value: '50000-100000', label: '$50,000 – $100,000' },
  { value: '100000+', label: '$100,000+' }
];

const CONDITION_OPTIONS = [
  { value: '', label: 'Any Condition' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'restored', label: 'Restored' }
];

export default function ForSalePage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const listingRefs = useRef({});

  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    priceRange: searchParams.get('price') || '',
    condition: searchParams.get('condition') || '',
    delivery: searchParams.get('delivery') || ''
  });

  const { listings: apiListings, loading } = useListings({ mode: 'sale', ...filters });
  const listings = apiListings.length > 0 ? apiListings : SAMPLE_FOR_SALE;

  // Apply filters
  const filteredListings = listings.filter(listing => {
    if (filters.category && listing.category !== filters.category) return false;
    if (filters.condition && listing.condition !== filters.condition) return false;
    if (filters.delivery === 'yes' && !listing.deliveryAvailable) return false;
    if (filters.priceRange) {
      const price = listing.price;
      if (filters.priceRange === '0-10000' && price >= 10000) return false;
      if (filters.priceRange === '10000-30000' && (price < 10000 || price >= 30000)) return false;
      if (filters.priceRange === '30000-50000' && (price < 30000 || price >= 50000)) return false;
      if (filters.priceRange === '50000+' && price < 50000) return false;
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
      condition: '',
      delivery: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <AppLayout fullWidth contentClassName="bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Tag className="h-6 w-6" />
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              For Sale
            </span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Buy Food Trucks & Equipment
          </h1>
          <p className="max-w-2xl text-lg text-white/90">
            Find your perfect mobile business setup. Verified sellers, financing options available, and buyer protection on every purchase.
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
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Price */}
            <select
              value={filters.priceRange}
              onChange={(e) => updateFilter('priceRange', e.target.value)}
              className="min-w-[160px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              {PRICE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Condition */}
            <select
              value={filters.condition}
              onChange={(e) => updateFilter('condition', e.target.value)}
              className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              {CONDITION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Delivery */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:border-slate-300">
              <input
                type="checkbox"
                checked={filters.delivery === 'yes'}
                onChange={(e) => updateFilter('delivery', e.target.checked ? 'yes' : '')}
                className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              Delivery included
            </label>

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
                <span key={key} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  {value}
                  <button onClick={() => updateFilter(key, '')} className="ml-1 hover:text-amber-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-sm font-medium text-amber-600 hover:underline">
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
            <span className="font-semibold text-slate-900">{filteredListings.length}</span> listings for sale
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <DollarSign className="h-4 w-4" />
            Financing available on select listings
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
            <Tag className="mb-4 h-16 w-16 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No listings found</h3>
            <p className="mb-6 max-w-md text-slate-500">
              Try adjusting your filters or check back later for new listings.
            </p>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </AppLayout>
  );
}
