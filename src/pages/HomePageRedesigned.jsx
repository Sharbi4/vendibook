/**
 * HomePageRedesigned.jsx
 * Modern Webflow-inspired homepage matching Rental X template aesthetic
 * Features: Full-width hero, floating search, category cards, featured listings, trust section
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Store,
  Truck,
  Users,
  ShoppingCart,
  UtensilsCrossed,
  Sparkles,
  SlidersHorizontal,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Play,
  Shield,
  CreditCard,
  Clock,
  ArrowRight,
  CheckCircle2,
  Heart,
  Phone,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

// Hero background
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=2400&q=80';
const HERO_VIDEO_URL = '';

// Demo listings for sample data
const SAMPLE_LISTINGS = [
  {
    id: 'sample-1',
    title: 'Modern Taco Truck - Fully Equipped',
    type: 'food-trucks',
    category: 'food-trucks',
    listingType: 'rent',
    lat: 33.4484,
    lng: -112.0740,
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 275,
    priceUnit: 'day',
    description: 'Fully equipped taco truck with commercial kitchen. Perfect for catering events, festivals, and daily operations.',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 47,
    host: 'Carlos M.',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Full kitchen', 'Generator included', 'Health certified']
  },
  {
    id: 'sample-2',
    title: 'Vintage Airstream Coffee Bar',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    lat: 33.5091,
    lng: -111.8986,
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 350,
    priceUnit: 'day',
    description: 'Beautifully restored Airstream converted to mobile coffee bar. Perfect for weddings and corporate events.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviews: 23,
    host: 'Sarah T.',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Espresso machine', 'Vintage aesthetic', 'Wedding ready']
  },
  {
    id: 'sample-3',
    title: 'BBQ Smoker Trailer - Competition Ready',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    lat: 33.4255,
    lng: -111.9400,
    city: 'Tempe',
    state: 'AZ',
    location: 'Tempe, AZ',
    price: 225,
    priceUnit: 'day',
    description: 'Professional competition BBQ trailer with offset smoker. Perfect for catering and BBQ competitions.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviews: 31,
    host: 'Marcus J.',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Offset smoker', 'Competition setup', 'Holds 200 lbs']
  },
  {
    id: 'sample-4',
    title: 'Ice Cream Truck - Classic Style',
    type: 'food-trucks',
    category: 'food-trucks',
    listingType: 'sale',
    lat: 33.3528,
    lng: -111.7890,
    city: 'Mesa',
    state: 'AZ',
    location: 'Mesa, AZ',
    price: 32000,
    priceUnit: null,
    description: 'Classic ice cream truck for sale. Fully operational with soft serve machine and freezer storage.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviews: 12,
    host: 'Jennifer L.',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Soft serve machine', 'Freezer storage', 'Classic design']
  },
  {
    id: 'sample-5',
    title: 'Mobile Bar Trailer - Full Service',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    lat: 33.4942,
    lng: -111.9261,
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 450,
    priceUnit: 'day',
    description: 'Fully licensed mobile bar trailer with tap system, refrigeration, and bartending equipment.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviews: 38,
    host: 'Alex B.',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Tap system', 'Licensed', 'Wedding favorite']
  },
  {
    id: 'sample-6',
    title: 'Chef Marco - Italian Catering',
    type: 'event-pro',
    category: 'event-pro',
    listingType: 'event-pro',
    lat: 33.4373,
    lng: -112.0078,
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 500,
    priceUnit: 'event',
    description: 'Professional Italian chef with 15+ years experience. Specializing in wedding catering and private events.',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviews: 64,
    host: 'Chef Marco',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Italian cuisine', '15+ years', 'Weddings']
  }
];

// Category cards for browsing
const BROWSE_CATEGORIES = [
  {
    id: 'food-trucks',
    title: 'Food Trucks',
    description: 'Fully equipped mobile kitchens',
    image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=600&q=80',
    count: '120+ listings',
    link: '/rent?listingType=food-trucks'
  },
  {
    id: 'trailers',
    title: 'Food Trailers',
    description: 'Towable commercial kitchens',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80',
    count: '85+ listings',
    link: '/rent?listingType=trailers'
  },
  {
    id: 'event-pros',
    title: 'Event Pros',
    description: 'Chefs, DJs, photographers & more',
    image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80',
    count: '50+ pros',
    link: '/event-pro'
  },
  {
    id: 'for-sale',
    title: 'For Sale',
    description: 'Buy your own equipment',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    count: '40+ listings',
    link: '/for-sale'
  }
];

// How it works steps
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Discover',
    description: 'Browse hundreds of verified food trucks, trailers, and event pros. Filter by location, price, and availability.',
    icon: Search
  },
  {
    step: '02',
    title: 'Book Instantly',
    description: 'Reserve with confidence. Secure payments, verified hosts, and instant confirmation for your dates.',
    icon: Calendar
  },
  {
    step: '03',
    title: 'Start Serving',
    description: 'Pick up your equipment or have it delivered. Get ongoing support as you grow your mobile business.',
    icon: Zap
  }
];

// Trust stats
const TRUST_STATS = [
  { value: '500+', label: 'Verified Hosts' },
  { value: '2,000+', label: 'Successful Bookings' },
  { value: '4.9', label: 'Average Rating' },
  { value: '24/7', label: 'Support Available' }
];

// Reviews
const REVIEWS = [
  {
    quote: "Vendibook made launching my taco truck business so easy. Found the perfect truck, got it delivered, and was serving within a week!",
    author: "Maria Rodriguez",
    role: "Owner, Maria's Tacos",
    location: "Phoenix, AZ",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    quote: "The verification process gives me peace of mind. Every host I've worked with has been professional and the equipment is exactly as described.",
    author: "James Chen",
    role: "Event Coordinator",
    location: "Tempe, AZ",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    quote: "I tested my food concept by renting before buying. Now I own my own truck and still use Vendibook to find event pros for my catering gigs.",
    author: "Sarah Thompson",
    role: "Food Entrepreneur",
    location: "Scottsdale, AZ",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  }
];

function HomePageRedesigned() {
  const navigate = useNavigate();
  const locationObj = useLocation();
  
  // State
  const [searchMode, setSearchMode] = useState('rent');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [hoveredListing, setHoveredListing] = useState(null);

  // Fetch listings
  const { listings: dynamicListings, loading } = useListings({ mode: searchMode });
  const displayListings = dynamicListings.length > 0 ? dynamicListings.slice(0, 6) : SAMPLE_LISTINGS.slice(0, 6);

  // Search handler
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('location', searchLocation);
    if (searchCategory) params.set('listingType', searchCategory);
    
    const route = searchMode === 'sale' ? '/for-sale' : searchMode === 'event-pro' ? '/event-pro' : '/rent';
    navigate(`${route}?${params.toString()}`);
  };

  return (
    <AppLayout fullWidth contentClassName="bg-white">
      {/* ============================================ */}
      {/* HERO SECTION - Full width with search */}
      {/* ============================================ */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={HERO_IMAGE_URL}
            alt="Food truck background"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Arizona's #1 Mobile Food Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                Mobile Kitchen
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl">
              Rent food trucks, buy trailers, or hire event pros. Start your mobile food business today with verified listings and instant booking.
            </p>

            {/* Search Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-2xl">
              {/* Mode Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
                {[
                  { id: 'rent', label: 'For Rent', icon: Truck },
                  { id: 'sale', label: 'For Sale', icon: DollarSign },
                  { id: 'event-pro', label: 'Event Pros', icon: Sparkles }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = searchMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSearchMode(mode.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Fields */}
              <div className="space-y-4">
                {/* Row 1: Location */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="City, state, or zip code"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Row 2: Category + Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">All Categories</option>
                        <option value="food-trucks">Food Trucks</option>
                        <option value="trailers">Food Trailers</option>
                        <option value="carts">Carts & Kiosks</option>
                        <option value="ghost-kitchen">Ghost Kitchens</option>
                        <option value="equipment">Equipment</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Distance</label>
                    <div className="relative">
                      <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">Any distance</option>
                        <option value="5">Within 5 miles</option>
                        <option value="10">Within 10 miles</option>
                        <option value="25">Within 25 miles</option>
                        <option value="50">Within 50 miles</option>
                        <option value="100">Within 100 miles</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Price Range + Date (Optional filters) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price Range</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="">Any price</option>
                        <option value="0-100">Under $100/day</option>
                        <option value="100-250">$100 - $250/day</option>
                        <option value="250-500">$250 - $500/day</option>
                        <option value="500+">$500+/day</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">When</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="date"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
                >
                  <Search className="w-5 h-5" />
                  Search listings
                </button>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">Popular:</span>
                {['Phoenix, AZ', 'Scottsdale', 'Tempe', 'Food Trucks'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchLocation(term)}
                    className="text-sm text-slate-600 hover:text-orange-500 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-8 text-white/70 text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Verified Hosts
              </span>
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Instant Booking
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* BROWSE CATEGORIES */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-2">Browse Categories</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                What are you looking for?
              </h2>
            </div>
            <Link
              to="/rent"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              View all listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BROWSE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={category.link}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* 30% overlay tint for text readability */}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                    {category.count}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-1">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-slate-700" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURED LISTINGS */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-2">Featured Listings</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Popular rentals near you
              </h2>
            </div>
            <Link
              to="/rent"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              View all rentals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* 30% overlay tint for text readability */}
                  <div className="absolute inset-0 bg-black/30" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {listing.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {listing.deliveryAvailable && (
                      <span className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        Delivery available
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Heart className="w-5 h-5" />
                  </button>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                    <span className="text-lg font-bold text-slate-900">${listing.price?.toLocaleString()}</span>
                    {listing.priceUnit && (
                      <span className="text-slate-500 text-sm">/{listing.priceUnit}</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Rating & Location */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-900">{listing.rating}</span>
                      {listing.reviews && (
                        <span className="text-sm text-slate-500">({listing.reviews})</span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {listing.location}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {listing.title}
                  </h3>

                  {/* Host */}
                  <p className="text-sm text-slate-500 mb-3">
                    Hosted by <span className="text-slate-700 font-medium">{listing.host}</span>
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {listing.highlights?.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View More CTA */}
          <div className="text-center mt-12">
            <Link
              to="/rent"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Browse all listings
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start your mobile business in 3 simple steps
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              From finding the perfect equipment to serving your first customer, we make it easy.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] w-[calc(100%-120px)] h-px bg-gradient-to-r from-orange-500/50 to-transparent" />
                  )}
                  
                  <div className="text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-orange-500/25">
                      <Icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Step Number */}
                    <div className="inline-block bg-slate-800 text-orange-400 text-sm font-bold px-4 py-1 rounded-full mb-4">
                      Step {step.step}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              to="/rent"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/25"
            >
              Start browsing
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TRUST STATS */}
      {/* ============================================ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-orange-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {TRUST_STATS.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Loved by entrepreneurs
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Join thousands of food entrepreneurs who've launched their businesses with Vendibook.
            </p>
          </div>

          {/* Reviews Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {REVIEWS.map((review, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-6">"{review.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={review.image}
                    alt={review.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{review.author}</div>
                    <div className="text-sm text-slate-500">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=2400&q=80')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to start your mobile food business?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who've launched their dreams with Vendibook. Find equipment, book instantly, start serving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rent"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-500/25"
            >
              Browse Equipment
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/host"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 font-semibold px-8 py-4 rounded-full transition-all"
            >
              Become a Host
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
                Vendibook
              </Link>
              <p className="text-slate-400 text-sm mb-6">
                The marketplace for mobile food entrepreneurs. Find, book, and launch your business.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Rent */}
            <div>
              <h4 className="font-semibold text-white mb-4">Rent</h4>
              <ul className="space-y-3">
                <li><Link to="/rent?listingType=food-trucks" className="text-slate-400 hover:text-white text-sm transition-colors">Food Trucks</Link></li>
                <li><Link to="/rent?listingType=trailers" className="text-slate-400 hover:text-white text-sm transition-colors">Food Trailers</Link></li>
                <li><Link to="/rent" className="text-slate-400 hover:text-white text-sm transition-colors">All Rentals</Link></li>
              </ul>
            </div>

            {/* Buy */}
            <div>
              <h4 className="font-semibold text-white mb-4">Buy</h4>
              <ul className="space-y-3">
                <li><Link to="/for-sale" className="text-slate-400 hover:text-white text-sm transition-colors">For Sale</Link></li>
                <li><Link to="/for-sale" className="text-slate-400 hover:text-white text-sm transition-colors">Financing</Link></li>
              </ul>
            </div>

            {/* Host */}
            <div>
              <h4 className="font-semibold text-white mb-4">Host</h4>
              <ul className="space-y-3">
                <li><Link to="/host" className="text-slate-400 hover:text-white text-sm transition-colors">Become a Host</Link></li>
                <li><Link to="/host/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Host Dashboard</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link to="/help" className="text-slate-400 hover:text-white text-sm transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
                <li><Link to="/how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors">How It Works</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 Vendibook LLC. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-white text-sm transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}

export default HomePageRedesigned;
