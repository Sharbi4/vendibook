import { useEffect, useMemo, useRef, useState } from 'react';
import { useListings } from '../hooks/useListings.js';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Mic2,
  ChefHat,
  Music,
  Camera,
  Sparkles,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import VendibookMap from '../components/VendibookMap.jsx';
import {
  ADVANCED_FILTER_PLACEHOLDERS,
  EVENT_PRO_SECONDARY_FILTERS,
  EVENT_TYPES,
  SERVICE_CATEGORIES,
  SEARCH_MODE,
  buildSearchParamsFromFilters,
  deriveCityState,
  formatDateRange,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryOptionsForMode,
  getModeCtaCopy,
  parseFiltersFromSearchParams
} from '../constants/filters';

// Hero background - using a high-quality food truck stock image
// Dark overlay for readability (hero is dark, so tabs use white outlines)
const HERO_IMAGE_URL = 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=2000&q=80';
const HERO_VIDEO_URL = '/videos/hero-mobile-vendors.mp4';
// Hero brightness: 'dark' means we use white outlines/text on inactive tabs
const HERO_BRIGHTNESS = 'dark';
const CATEGORY_COLOR_PALETTE = ['#FF5124', '#4CAF50', '#343434', '#F8F8F8'];

// ============================================================
// SAMPLE LISTINGS DATASET - 10+ realistic listings for demo
// Until backend is fully populated, this serves as search results
// ============================================================
const SAMPLE_LISTINGS = [
  {
    id: 'sample-1',
    title: 'Taco Express Food Truck',
    type: 'food-trucks',
    category: 'food-trucks',
    listingType: 'rent',
    mode: 'rent',
    lat: 33.4484,
    lng: -112.074,
    latitude: 33.4484,
    longitude: -112.074,
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 350,
    priceUnit: 'day',
    description: 'Fully equipped taco truck with commercial kitchen, seats 2 operators. Perfect for events and festivals.',
    image: 'https://images.unsplash.com/photo-1567129937968-cdad8f07d5f3?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    host: 'Maria\'s Trucks LLC',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Commercial kitchen', 'Generator included', '2 operators']
  },
  {
    id: 'sample-2',
    title: 'Gourmet Burger Trailer',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    mode: 'rent',
    lat: 32.2226,
    lng: -110.9747,
    latitude: 32.2226,
    longitude: -110.9747,
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 275,
    priceUnit: 'day',
    description: 'Premium burger trailer with flat-top grill, fryer, and refrigeration. Great for pop-up events.',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    host: 'Arizona Mobile Eats',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Flat-top grill', 'Deep fryer', 'Refrigeration']
  },
  {
    id: 'sample-3',
    title: 'Coffee Cart - Espresso Ready',
    type: 'other',
    category: 'other',
    listingType: 'rent',
    mode: 'rent',
    lat: 33.4942,
    lng: -111.9261,
    latitude: 33.4942,
    longitude: -111.9261,
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 150,
    priceUnit: 'day',
    description: 'Compact espresso cart perfect for corporate events, weddings, and farmers markets.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    host: 'Desert Bean Co',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Espresso machine', 'Grinder', 'Portable']
  },
  {
    id: 'sample-4',
    title: 'BBQ Smoker Trailer',
    type: 'trailers',
    category: 'trailers',
    listingType: 'sale',
    mode: 'sale',
    lat: 33.4152,
    lng: -111.8315,
    latitude: 33.4152,
    longitude: -111.8315,
    city: 'Tempe',
    state: 'AZ',
    location: 'Tempe, AZ',
    price: 28500,
    priceUnit: null,
    description: 'Professional BBQ smoker trailer, used for 2 seasons. Includes offset smoker and warming box.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    host: 'Smoke Ring BBQ',
    isVerified: false,
    deliveryAvailable: true,
    highlights: ['Offset smoker', 'Warming box', 'Low mileage']
  },
  {
    id: 'sample-5',
    title: 'Ice Cream Truck - Vintage Style',
    type: 'food-trucks',
    category: 'food-trucks',
    listingType: 'sale',
    mode: 'sale',
    lat: 33.3528,
    lng: -111.7890,
    latitude: 33.3528,
    longitude: -111.7890,
    city: 'Mesa',
    state: 'AZ',
    location: 'Mesa, AZ',
    price: 42000,
    priceUnit: null,
    description: 'Classic 1985 ice cream truck fully restored. Working soft serve machine and freezer units.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    host: 'Cool Treats AZ',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Soft serve', 'Freezer units', 'Restored classic']
  },
  {
    id: 'sample-6',
    title: 'Chef Marco - Italian Catering',
    type: 'event-pro',
    category: 'event-pro',
    listingType: 'event-pro',
    mode: 'event-pro',
    lat: 33.4255,
    lng: -111.9400,
    latitude: 33.4255,
    longitude: -111.9400,
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 500,
    priceUnit: 'event',
    description: 'Professional Italian chef available for private events, weddings, and corporate catering.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    host: 'Chef Marco',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Italian cuisine', '15+ years', 'Weddings']
  },
  {
    id: 'sample-7',
    title: 'DJ Beats - Mobile Entertainment',
    type: 'event-pro',
    category: 'event-pro',
    listingType: 'event-pro',
    mode: 'event-pro',
    lat: 32.2540,
    lng: -110.9742,
    latitude: 32.2540,
    longitude: -110.9742,
    city: 'Tucson',
    state: 'AZ',
    location: 'Tucson, AZ',
    price: 350,
    priceUnit: 'event',
    description: 'Professional DJ with full sound system and lighting. Weddings, parties, corporate events.',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    host: 'DJ Beats Entertainment',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['Sound system', 'Lighting', 'All events']
  },
  {
    id: 'sample-8',
    title: 'Pizza Oven Trailer',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    mode: 'rent',
    lat: 33.5722,
    lng: -112.0891,
    latitude: 33.5722,
    longitude: -112.0891,
    city: 'Glendale',
    state: 'AZ',
    location: 'Glendale, AZ',
    price: 400,
    priceUnit: 'day',
    description: 'Wood-fired pizza oven trailer. Makes authentic Neapolitan pizza. Great for events!',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    host: 'Fired Up Pizza Co',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Wood-fired', 'Neapolitan style', 'Event ready']
  },
  {
    id: 'sample-9',
    title: 'Mobile Bar Trailer',
    type: 'other',
    category: 'other',
    listingType: 'rent',
    mode: 'rent',
    lat: 33.4373,
    lng: -112.0078,
    latitude: 33.4373,
    longitude: -112.0078,
    city: 'Phoenix',
    state: 'AZ',
    location: 'Phoenix, AZ',
    price: 500,
    priceUnit: 'day',
    description: 'Fully licensed mobile bar trailer with tap system and refrigeration. Perfect for weddings.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    host: 'Pour House Mobile',
    isVerified: true,
    deliveryAvailable: true,
    highlights: ['Tap system', 'Refrigeration', 'Licensed']
  },
  {
    id: 'sample-10',
    title: 'Sarah\'s Sweet Treats Cart',
    type: 'other',
    category: 'other',
    listingType: 'sale',
    mode: 'sale',
    lat: 33.3062,
    lng: -111.8413,
    latitude: 33.3062,
    longitude: -111.8413,
    city: 'Gilbert',
    state: 'AZ',
    location: 'Gilbert, AZ',
    price: 8500,
    priceUnit: null,
    description: 'Custom dessert cart with display case and refrigeration. Perfect for farmers markets.',
    image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    host: 'Sarah\'s Sweets',
    isVerified: false,
    deliveryAvailable: false,
    highlights: ['Display case', 'Refrigerated', 'Custom build']
  },
  {
    id: 'sample-11',
    title: 'Event Photographer - Premium',
    type: 'event-pro',
    category: 'event-pro',
    listingType: 'event-pro',
    mode: 'event-pro',
    lat: 33.5091,
    lng: -111.8986,
    latitude: 33.5091,
    longitude: -111.8986,
    city: 'Scottsdale',
    state: 'AZ',
    location: 'Scottsdale, AZ',
    price: 750,
    priceUnit: 'event',
    description: 'Professional event photographer with 10+ years experience. Weddings, corporate, parties.',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    host: 'Lens Master Photography',
    isVerified: true,
    deliveryAvailable: false,
    highlights: ['10+ years', 'All events', 'Same-day preview']
  },
  {
    id: 'sample-12',
    title: 'Shaved Ice Trailer',
    type: 'trailers',
    category: 'trailers',
    listingType: 'rent',
    mode: 'rent',
    lat: 33.6189,
    lng: -111.8978,
    latitude: 33.6189,
    longitude: -111.8978,
    city: 'Fountain Hills',
    state: 'AZ',
    location: 'Fountain Hills, AZ',
    price: 200,
    priceUnit: 'day',
    description: 'Colorful shaved ice trailer with commercial ice shaver. 20+ flavor syrups included.',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    rating: 4.4,
    host: 'Chill Zone AZ',
    isVerified: false,
    deliveryAvailable: true,
    highlights: ['Ice shaver', '20+ flavors', 'Event ready']
  }
];

// Helper function to filter sample listings based on search criteria
const filterSampleListings = (mode, locationLabel, category, lat, lng) => {
  return SAMPLE_LISTINGS.filter((listing) => {
    // Filter by mode
    const listingMode = listing.listingType || listing.mode;
    if (mode === SEARCH_MODE.RENT && listingMode !== 'rent') return false;
    if (mode === SEARCH_MODE.BUY && listingMode !== 'sale') return false;
    if (mode === SEARCH_MODE.EVENT_PRO && listingMode !== 'event-pro') return false;
    
    // Filter by category if specified
    if (category && listing.category !== category && listing.type !== category) return false;
    
    // Filter by location if specified (fuzzy match on city/state)
    if (locationLabel) {
      const searchTerm = locationLabel.toLowerCase();
      const listingLocation = `${listing.city} ${listing.state}`.toLowerCase();
      // If search doesn't match city/state, check if it's close enough
      if (!listingLocation.includes(searchTerm.split(',')[0].trim())) {
        // If lat/lng provided, filter by distance (within ~50 miles)
        if (lat && lng && listing.lat && listing.lng) {
          const distance = Math.sqrt(
            Math.pow(listing.lat - lat, 2) + Math.pow(listing.lng - lng, 2)
          );
          if (distance > 0.7) return false; // ~50 miles in degree terms
        } else {
          return false;
        }
      }
    }
    
    return true;
  });
};

// Inject global keyframe animations for premium UI
const injectStyles = () => {
  if (typeof document !== 'undefined' && !document.getElementById('vendibook-premium-styles')) {
    const style = document.createElement('style');
    style.id = 'vendibook-premium-styles';
    style.textContent = `
      /* Premium easing curves */
      :root {
        --vb-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        --vb-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
        --vb-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
        --vb-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      @keyframes vbFadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes vbFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes vbScaleUp {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      @keyframes vbSlideDown {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      /* Sparkle animation for tabs - idle state */
      @keyframes sparkleOrbit {
        0% { 
          opacity: 0;
          transform: translate(0, 0) scale(0);
        }
        10% {
          opacity: 1;
          transform: translate(var(--tx1, 3px), var(--ty1, -8px)) scale(1);
        }
        50% {
          opacity: 0.8;
          transform: translate(var(--tx2, -5px), var(--ty2, -15px)) scale(0.8);
        }
        100% {
          opacity: 0;
          transform: translate(var(--tx3, 8px), var(--ty3, -25px)) scale(0);
        }
      }
      
      /* Enhanced sparkle animation for selected tab */
      @keyframes sparkleOrbitActive {
        0% { 
          opacity: 0;
          transform: translate(0, 0) scale(0) rotate(0deg);
        }
        15% {
          opacity: 1;
          transform: translate(var(--tx1, 5px), var(--ty1, -12px)) scale(1.3) rotate(45deg);
        }
        40% {
          opacity: 1;
          transform: translate(var(--tx2, -8px), var(--ty2, -20px)) scale(1) rotate(90deg);
        }
        70% {
          opacity: 0.6;
          transform: translate(var(--tx3, 10px), var(--ty3, -28px)) scale(0.8) rotate(135deg);
        }
        100% {
          opacity: 0;
          transform: translate(var(--tx3, 12px), var(--ty3, -35px)) scale(0) rotate(180deg);
        }
      }
      
      /* Pulse glow for selected tab */
      @keyframes tabPulseGlow {
        0%, 100% {
          box-shadow: 0 0 8px 2px var(--glow-color, rgba(255, 255, 255, 0.3));
        }
        50% {
          box-shadow: 0 0 20px 6px var(--glow-color, rgba(255, 255, 255, 0.5));
        }
      }
      
      /* Tab bounce animation on selection */
      @keyframes tabSelectBounce {
        0% { transform: scale(1); }
        30% { transform: scale(1.08); }
        60% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      
      .sparkle-container {
        position: absolute;
        inset: -8px;
        pointer-events: none;
        overflow: visible;
      }
      
      .sparkle-container-active {
        position: absolute;
        inset: -12px;
        pointer-events: none;
        overflow: visible;
      }
      
      .sparkle-particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.5);
        animation: sparkleOrbit 3s ease-in-out infinite;
      }
      
      .sparkle-particle-idle {
        position: absolute;
        width: 3px;
        height: 3px;
        background: var(--sparkle-color, rgba(255, 81, 36, 0.8));
        border-radius: 50%;
        box-shadow: 0 0 4px 1px var(--sparkle-color, rgba(255, 81, 36, 0.4));
        animation: sparkleOrbit 4s ease-in-out infinite;
      }
      
      .sparkle-particle-active {
        position: absolute;
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 1);
        border-radius: 50%;
        box-shadow: 0 0 10px 3px rgba(255, 255, 255, 0.7);
        animation: sparkleOrbitActive 2s ease-in-out infinite;
      }
      
      .tab-selected-glow {
        animation: tabPulseGlow 2s ease-in-out infinite;
      }
      
      .tab-select-bounce {
        animation: tabSelectBounce 0.4s var(--vb-spring) forwards;
      }
      
      /* Card with premium hover */
      .vb-card {
        transition: transform 0.4s var(--vb-ease-out-expo), box-shadow 0.4s var(--vb-ease-out-expo);
        will-change: transform;
      }
      .vb-card:hover {
        transform: translateY(-6px) scale(1.01);
        box-shadow: 0 24px 48px -12px rgba(0,0,0,0.15), 0 12px 24px -8px rgba(0,0,0,0.1);
      }
      .vb-card:active {
        transform: translateY(-2px) scale(0.995);
        transition-duration: 0.1s;
      }
      
      /* Button with premium press effect */
      .vb-btn {
        transition: all 0.25s var(--vb-ease-out-expo);
        will-change: transform, box-shadow;
      }
      .vb-btn:hover {
        transform: translateY(-2px);
      }
      .vb-btn:active {
        transform: translateY(0) scale(0.98);
        transition-duration: 0.1s;
      }
      
      /* Chip with subtle spring */
      .vb-chip {
        transition: all 0.2s var(--vb-spring);
      }
      .vb-chip:hover {
        transform: scale(1.03);
      }
      .vb-chip:active {
        transform: scale(0.97);
      }
      
      /* Image with smooth zoom */
      .vb-img-zoom {
        transition: transform 0.5s var(--vb-ease-out-expo);
      }
      .vb-img-zoom:hover {
        transform: scale(1.06);
      }
      
      /* Entrance animations */
      .vb-enter-fade-up {
        animation: vbFadeUp 0.6s var(--vb-ease-out-expo) forwards;
      }
      .vb-enter-scale {
        animation: vbScaleUp 0.4s var(--vb-ease-out-expo) forwards;
      }
      .vb-enter-fade {
        animation: vbFadeIn 0.3s ease-out forwards;
      }
      
      /* Stagger delay utilities */
      .vb-delay-1 { animation-delay: 50ms; }
      .vb-delay-2 { animation-delay: 100ms; }
      .vb-delay-3 { animation-delay: 150ms; }
      .vb-delay-4 { animation-delay: 200ms; }
      
      /* Focus ring – accessibility with style */
      .vb-focus:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(255,81,36,0.4);
      }
      
      /* Glassmorphism */
      .vb-glass {
        background: rgba(255,255,255,0.08);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      }
      
      /* Premium shadow layers */
      .vb-shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06); }
      .vb-shadow-md { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03); }
      .vb-shadow-lg { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.06); }
      .vb-shadow-xl { box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12), 0 10px 20px -8px rgba(0,0,0,0.08); }
      .vb-shadow-2xl { box-shadow: 0 30px 60px -15px rgba(0,0,0,0.18), 0 20px 40px -12px rgba(0,0,0,0.1); }
    `;
    document.head.appendChild(style);
  }
};
injectStyles();

// Sparkle particles component for tab borders
// isActive: true for selected tab (enhanced animation), false for idle tabs
// color: the tab's brand color for idle sparkles
const TabSparkles = ({ isActive = false, color = '#FF5124' }) => {
  const sparkles = [];
  
  // More sparkles for active state, fewer for idle
  const positions = isActive ? [
    { left: '5%', top: '0%' },
    { left: '20%', top: '0%' },
    { left: '35%', top: '0%' },
    { left: '50%', top: '0%' },
    { left: '65%', top: '0%' },
    { left: '80%', top: '0%' },
    { left: '95%', top: '0%' },
    { left: '100%', top: '20%' },
    { left: '100%', top: '50%' },
    { left: '100%', top: '80%' },
    { left: '95%', top: '100%' },
    { left: '80%', top: '100%' },
    { left: '65%', top: '100%' },
    { left: '50%', top: '100%' },
    { left: '35%', top: '100%' },
    { left: '20%', top: '100%' },
    { left: '5%', top: '100%' },
    { left: '0%', top: '80%' },
    { left: '0%', top: '50%' },
    { left: '0%', top: '20%' },
  ] : [
    { left: '15%', top: '0%' },
    { left: '50%', top: '0%' },
    { left: '85%', top: '0%' },
    { left: '100%', top: '50%' },
    { left: '85%', top: '100%' },
    { left: '50%', top: '100%' },
    { left: '15%', top: '100%' },
    { left: '0%', top: '50%' },
  ];
  
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const delay = i * (isActive ? 0.1 : 0.3);
    const tx1 = (Math.random() - 0.5) * (isActive ? 15 : 8);
    const ty1 = (Math.random() - 0.5) * (isActive ? 15 : 8);
    const tx2 = (Math.random() - 0.5) * (isActive ? 20 : 12);
    const ty2 = (Math.random() - 0.5) * (isActive ? 20 : 12);
    const tx3 = (Math.random() - 0.5) * (isActive ? 28 : 16);
    const ty3 = (Math.random() - 0.5) * (isActive ? 28 : 16);
    
    sparkles.push(
      <div
        key={i}
        className={isActive ? 'sparkle-particle-active' : 'sparkle-particle-idle'}
        style={{
          left: pos.left,
          top: pos.top,
          animationDelay: `${delay}s`,
          '--tx1': `${tx1}px`,
          '--ty1': `${ty1}px`,
          '--tx2': `${tx2}px`,
          '--ty2': `${ty2}px`,
          '--tx3': `${tx3}px`,
          '--ty3': `${ty3}px`,
          '--sparkle-color': isActive ? 'rgba(255, 255, 255, 0.9)' : color,
        }}
      />
    );
  }
  
  return (
    <div className={isActive ? 'sparkle-container-active' : 'sparkle-container'}>
      {sparkles}
    </div>
  );
};

const VendibookGridIcon = ({ className = 'h-5 w-5 text-charcoal', strokeWidth = 1.75 }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="4" width="6" height="6" rx="1.25" />
    <rect x="14" y="4" width="6" height="6" rx="1.25" />
    <rect x="4" y="14" width="6" height="6" rx="1.25" />
    <rect x="14" y="14" width="6" height="6" rx="1.25" />
  </svg>
);

const CATEGORY_ICON_COMPONENTS = {
  truck: Truck,
  trailer: Truck,
  kitchen: UtensilsCrossed,
  map_pin: MapPin,
  users: Users,
  cart: ShoppingCart,
  store: Store,
  grid: VendibookGridIcon
};

const RECENT_SEARCHES = [
  { id: 'phoenix', label: 'Phoenix, AZ', meta: 'Food truck capitals' },
  { id: 'tucson', label: 'Tucson, AZ', meta: 'Pop-up friendly' },
  { id: 'scottsdale', label: 'Scottsdale, AZ', meta: 'Premium catering' },
  { id: 'tempe', label: 'Tempe, AZ', meta: 'University crowd' }
];

const POPULAR_CITY_CATEGORIES = {
  phoenix: ['Food trucks', 'Kitchen rentals', 'Event pros', 'Vendor markets'],
  tucson: ['Coffee carts', 'Markets', 'BBQ trailers'],
  scottsdale: ['Luxury catering', 'Chef partners', 'Brand activations'],
  default: ['Food trucks', 'Trailers', 'Host kitchens', 'Activation lots']
};

function HomePage() {
  const navigate = useNavigate();
  const locationObj = useLocation();

  const initialFilters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(locationObj.search)),
    [locationObj.search]
  );

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState(initialFilters.mode || SEARCH_MODE.RENT);
  const [quickViewListing, setQuickViewListing] = useState(null);
  
  // State for map marker interactions
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const listingRefs = useRef({});

  useEffect(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  }, [initialFilters]);

  const parseCoordinate = (value) => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (value === '' || value == null) {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const locationSelection = useMemo(() => {
    if (!filters.locationLabel && !filters.locationText) {
      return null;
    }
    const lat = parseCoordinate(filters.latitude);
    const lng = parseCoordinate(filters.longitude);
    return {
      label: filters.locationLabel || filters.locationText,
      placeName: filters.locationText || filters.locationLabel,
      city: filters.city,
      state: filters.state,
      lat: lat ?? undefined,
      lng: lng ?? undefined
    };
  }, [filters.locationLabel, filters.locationText, filters.latitude, filters.longitude, filters.city, filters.state]);

  // Brand colors per tab – strict spec: Rent=red, Sale=orange, EventPro=green
  const TAB_COLORS = {
    [SEARCH_MODE.RENT]: { bg: '#FF5124', text: '#FFFFFF' },
    [SEARCH_MODE.BUY]: { bg: '#FF8C00', text: '#FFFFFF' },
    [SEARCH_MODE.EVENT_PRO]: { bg: '#4CAF50', text: '#FFFFFF' }
  };

  const modeOptions = [
    { id: SEARCH_MODE.RENT, label: 'For Rent', icon: Truck, color: '#FF5124' },
    { id: SEARCH_MODE.BUY, label: 'For Sale', icon: DollarSign, color: '#FF8C00' },
    { id: SEARCH_MODE.EVENT_PRO, label: 'Book an Event Pro', icon: Sparkles, color: '#4CAF50' }
  ];

  // "What" chips – exactly 4: Food Truck, Food Trailer, Other, All (same for all modes)
  const WHAT_OPTIONS = [
    { value: 'food-trucks', label: 'Food Truck' },
    { value: 'trailers', label: 'Food Trailer' },
    { value: 'other', label: 'Other' },
    { value: '', label: 'All' }
  ];

  const mapCategoryOptionsForMode = (mode) => (
    [{ value: '', label: 'All categories', iconName: 'grid' }, ...getCategoryOptionsForMode(mode)].map((option) => {
      const iconName = option.iconName || getCategoryIcon(option.value);
      const Icon = CATEGORY_ICON_COMPONENTS[iconName] || CATEGORY_ICON_COMPONENTS.grid;
      return { ...option, iconName, Icon };
    })
  );

  const modalCategoryOptions = useMemo(
    () => mapCategoryOptionsForMode(filters.mode),
    [filters.mode]
  );

  const appliedCategoryOptions = useMemo(
    () => (
      mapCategoryOptionsForMode(appliedFilters.mode).map((option, index) => ({
        ...option,
        color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length]
      }))
    ),
    [appliedFilters.mode]
  );
  const modalCtaLabel = getModeCtaCopy(filters.mode);
  const appliedCategoryLabel = getCategoryLabel(appliedFilters.mode, appliedFilters.listingType);
  const appliedLocationLabel = appliedFilters.locationLabel || appliedFilters.locationText || [appliedFilters.city, appliedFilters.state].filter(Boolean).join(', ');
  const normalizedCityKey = (filters.city || appliedFilters.city || '').toLowerCase();
  const popularCategoryChips = useMemo(() => {
    const list = POPULAR_CITY_CATEGORIES[normalizedCityKey] || POPULAR_CITY_CATEGORIES.default;
    return Array.isArray(list) ? list : POPULAR_CITY_CATEGORIES.default;
  }, [normalizedCityKey]);

  const recentSearchChips = useMemo(() => {
    if (!appliedLocationLabel) {
      return RECENT_SEARCHES;
    }
    const alreadyTracked = RECENT_SEARCHES.some((chip) => chip.label === appliedLocationLabel);
    if (alreadyTracked) {
      return RECENT_SEARCHES;
    }
    return [{ id: 'active-location', label: appliedLocationLabel }, ...RECENT_SEARCHES].slice(0, 5);
  }, [appliedLocationLabel]);
  const heroSummaryParts = [
    appliedLocationLabel || 'Any location',
    appliedCategoryLabel,
    formatDateRange(appliedFilters.startDate, appliedFilters.endDate)
  ];
  const heroSummary = heroSummaryParts.join(' • ');
  const listingResultsLabel = (() => {
    switch (appliedFilters.mode) {
      case SEARCH_MODE.EVENT_PRO:
        return 'event pros';
      case SEARCH_MODE.BUY:
        return 'listings for sale';
      case SEARCH_MODE.VENDOR_MARKET:
        return 'vendor markets';
      default:
        return 'rentals';
    }
  })();
  const listingsAreaLabel = (() => {
    if (appliedLocationLabel) return `near ${appliedLocationLabel}`;
    return 'near you';
  })();
  const applyAndSyncFilters = (updater) => {
    setAppliedFilters((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      const next = { ...nextState, page: 1 };
      if (!next.locationLabel && (next.city || next.state)) {
        next.locationLabel = [next.city, next.state].filter(Boolean).join(', ');
      }
      setFilters(next);
      return next;
    });
  };

  const handleModeChange = (mode) => {
    setActiveTab(mode);
    setFilters((prev) => ({
      ...prev,
      mode,
      listingType: ''
    }));
  };

  const handleCategoryChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      listingType: value
    }));
  };

  const handleLocationQueryChange = (value) => {
    const derived = deriveCityState(value);
    setFilters((prev) => ({
      ...prev,
      locationText: value,
      city: derived.city,
      state: derived.state,
      locationLabel: value,
      latitude: '',
      longitude: ''
    }));
  };

  const handleLocationSelect = (place) => {
    if (!place) {
      setFilters((prev) => ({
        ...prev,
        locationText: '',
        locationLabel: '',
        city: '',
        state: '',
        latitude: '',
        longitude: ''
      }));
      return;
    }

    setFilters((prev) => ({
      ...prev,
      locationText: place.placeName || place.label || '',
      locationLabel: place.label || place.placeName || '',
      city: place.city || prev.city,
      state: place.state || prev.state,
      latitude: typeof place.lat === 'number' ? place.lat : prev.latitude,
      longitude: typeof place.lng === 'number' ? place.lng : prev.longitude
    }));
  };

  const clearLocationFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      locationText: '',
      locationLabel: '',
      city: '',
      state: '',
      latitude: '',
      longitude: ''
    }));
  };

  const clearCategoryFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      listingType: ''
    }));
  };

  const clearDatesFilter = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      startDate: '',
      endDate: ''
    }));
  };

  const clearAllFilters = () => {
    applyAndSyncFilters((prev) => ({
      ...prev,
      listingType: '',
      locationText: '',
      locationLabel: '',
      city: '',
      state: '',
      latitude: '',
      longitude: '',
      startDate: '',
      endDate: ''
    }));
  };

  const handleCategoryPillClick = (categoryValue) => {
    const nextFilters = {
      ...appliedFilters,
      mode: SEARCH_MODE.RENT,
      listingType: categoryValue
    };
    applyAndSyncFilters(nextFilters);
    const params = buildSearchParamsFromFilters(nextFilters);
    // Clicking hero chips routes directly to /listings for a faster browse handoff.
    navigate(`/listings?${params.toString()}`);
  };

  const activeFilterChips = [];
  const locationChipLabel = appliedLocationLabel;
  if (locationChipLabel) {
    activeFilterChips.push({ key: 'location', label: locationChipLabel, onRemove: clearLocationFilter });
  }
  if (appliedFilters.listingType) {
    activeFilterChips.push({ key: 'category', label: appliedCategoryLabel, onRemove: clearCategoryFilter });
  }
  if (appliedFilters.startDate || appliedFilters.endDate) {
    activeFilterChips.push({ key: 'dates', label: formatDateRange(appliedFilters.startDate, appliedFilters.endDate), onRemove: clearDatesFilter });
  }


  // Fetch dynamic listings from API (Neon) and merge with legacy mock data until fully migrated
  const { listings: dynamicListings, loading: listingsLoading } = useListings(appliedFilters);
  
  // Use sample listings for demo when no backend data
  const useSampleData = dynamicListings.length === 0;
  const sampleResults = useSampleData 
    ? filterSampleListings(
        appliedFilters.mode, 
        appliedLocationLabel, 
        appliedFilters.listingType,
        appliedFilters.latitude,
        appliedFilters.longitude
      )
    : [];
  
  // Filter listings based on applied search (real backend data only)
  const combinedListings = useSampleData ? sampleResults : dynamicListings;
  const locationQuery = (appliedLocationLabel || '').toLowerCase();
  const cityQuery = (appliedFilters.city || '').toLowerCase();
  const stateQuery = (appliedFilters.state || '').toLowerCase();
  const filteredListings = useSampleData ? sampleResults : combinedListings.filter((listing) => {
    const listingMode = String(listing.listingType || '').toLowerCase();
    if (appliedFilters.mode === SEARCH_MODE.RENT && listingMode !== 'rent') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.BUY && listingMode !== 'sale') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.EVENT_PRO && listingMode !== 'event-pro') {
      return false;
    }
    if (appliedFilters.mode === SEARCH_MODE.VENDOR_MARKET && listingMode !== 'vendor-market') {
      return false;
    }

    if (appliedFilters.listingType && listing.category !== appliedFilters.listingType) {
      return false;
    }

    if (locationQuery) {
      const listingLocation = listing.location.toLowerCase();
      if (!listingLocation.includes(locationQuery)) {
        return false;
      }
    }

    if (cityQuery) {
      if (!listing.location.toLowerCase().includes(cityQuery)) {
        return false;
      }
    }

    if (stateQuery) {
      if (!listing.location.toLowerCase().includes(stateQuery)) {
        return false;
      }
    }

    return true;
  });

  const handleSearch = () => {
    const derived = deriveCityState(filters.locationLabel || filters.locationText);
    const nextFilters = {
      ...filters,
      city: filters.city || derived.city,
      state: filters.state || derived.state,
      locationLabel: filters.locationLabel || filters.locationText || [derived.city, derived.state].filter(Boolean).join(', '),
      page: 1
    };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setSearchModalOpen(false);
  };

  const handleOpenQuickView = (listing) => {
    setQuickViewListing(listing);
  };

  const handleCloseQuickView = () => {
    setQuickViewListing(null);
  };

  const getPrimaryCtaLabel = () => {
    if (!quickViewListing) return '';
    const mode = appliedFilters.mode;
    if (mode === SEARCH_MODE.BUY) return 'Buy now';
    if (mode === SEARCH_MODE.EVENT_PRO) return 'Book event pro';
    return 'Book now';
  };

  const handlePrimaryCta = () => {
    if (!quickViewListing) return;
    navigate(`/listing/${quickViewListing.id}`);
  };

  const handleViewFullListing = () => {
    if (!quickViewListing) return;
    navigate(`/listing/${quickViewListing.id}`);
  };

  // Simple calendar component (can be replaced with a library if needed)
  const SimpleDatePicker = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const handleDateClick = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      setFilters((prev) => {
        if (!prev.startDate || prev.endDate) {
          return { ...prev, startDate: dateStr, endDate: '' };
        }
        if (prev.startDate && !prev.endDate) {
          if (new Date(dateStr) >= new Date(prev.startDate)) {
            setShowCalendar(false);
            return { ...prev, endDate: dateStr };
          }
          return { ...prev, startDate: dateStr, endDate: '' };
        }
        return prev;
      });
    };

    const prevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const nextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    const isSelected = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return dateStr === filters.startDate || dateStr === filters.endDate;
    };

    const isInRange = (day) => {
      if (!filters.startDate || !filters.endDate) return false;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(dateStr);
      return date > new Date(filters.startDate) && date < new Date(filters.endDate);
    };

    return (
      <div className="absolute left-0 top-full z-50 mt-3 w-full min-w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
          <button type="button" onClick={prevMonth} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">←</button>
          <div>{monthNames[currentMonth]} {currentYear}</div>
          <button type="button" onClick={nextMonth} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const selected = isSelected(day);
            const inRange = isInRange(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDateClick(day)}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  selected
                    ? 'bg-orange-500 text-white shadow-sm'
                    : inRange
                      ? 'bg-orange-50 text-slate-700'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [searchModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (searchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [searchModalOpen]);

  // Get current mode's brand color
  const currentBrandColor = TAB_COLORS[activeTab]?.bg || '#FF5124';

  // Mode-specific filter state
  const [rentFilters, setRentFilters] = useState({
    priceMin: '',
    priceMax: '',
    startDate: '',
    endDate: '',
    delivery: '',
    distance: '',
    size: '',
    addOns: { branding: false, generator: false, waterTank: false, hoodSystem: false, staff: false }
  });

  const [saleFilters, setSaleFilters] = useState({
    priceMin: '',
    priceMax: '',
    condition: '',
    year: '',
    mileage: '',
    equipment: '',
    deliveryOption: ''
  });

  const [eventProFilters, setEventProFilters] = useState({
    budget: '',
    eventDate: '',
    serviceType: '',
    headcount: '',
    distance: '',
    availability: ''
  });

  return (
    <AppLayout fullWidth contentClassName="bg-[#FAFAFA]">
      {/* Hero Section with food truck background */}
      <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden">
        {/* Background image/video */}
        <div className="absolute inset-0">
          {/* Food truck stock image */}
          <img 
            src={HERO_IMAGE_URL} 
            alt="Food truck background" 
            className="h-full w-full object-cover"
          />
          {/* Dark overlay for readability (20-30% black) */}
          <div className="absolute inset-0 bg-black/25" />
          {/* Subtle color glow based on active mode */}
          <div 
            className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[150px] transition-colors duration-700"
            style={{ backgroundColor: currentBrandColor }}
          />
        </div>

        {/* Search module container */}
        <div className="relative z-10 mx-auto w-full max-w-[680px] px-5 sm:px-6 vb-enter-fade-up">
          {/* Mode tabs – top pills with safe-area spacing */}
          <div className="mb-6 flex justify-center">
            <div
              className="flex w-full max-w-[720px] gap-3"
              style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 0.75rem)` }}
            >
              {modeOptions.map((option) => {
                const isActive = activeTab === option.id;
                const TabIcon = option.icon;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleModeChange(option.id)}
                    className={`vb-focus relative flex-1 items-center justify-center gap-2 rounded-full border bg-white px-3 py-2 text-sm font-medium text-slate-400 shadow-sm transition-all duration-200 hover:bg-slate-50 ${
                      isActive
                        ? 'border-[#F97316] text-[#F97316] shadow-md -translate-y-px'
                        : 'border-slate-200'
                    } flex`}
                  >
                    <TabSparkles isActive={isActive} color={isActive ? '#F97316' : '#9CA3AF'} />
                    <TabIcon className="h-4 w-4" />
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search card */}
          <div
            className="vb-enter-scale overflow-hidden rounded-[24px] transition-all duration-500"
            style={{
              backgroundColor: currentBrandColor,
              boxShadow: `0 32px 64px -16px ${currentBrandColor}40`
            }}
          >
            <div className="p-8">
              {/* WHERE section - Mapbox location search + manual input */}
              <div className="mb-6">
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-white">Where</label>
                <div className="[&_label]:hidden [&_input]:rounded-[12px] [&_input]:border-0 [&_input]:bg-white [&_input]:px-5 [&_input]:py-4 [&_input]:text-[15px] [&_input]:font-medium [&_input]:text-slate-800 [&_input]:placeholder:text-slate-500 [&>div>label>div]:rounded-[12px] [&>div>label>div]:border-0 [&>div>label>div]:bg-white">
                  <LocationAutocomplete
                    value={locationSelection}
                    onChange={handleLocationSelect}
                    onQueryChange={handleLocationQueryChange}
                    label=""
                    placeholder="Search city, zip code, or address"
                    className="w-full"
                  />
                </div>

                {/* Explicit location field under Mapbox, mirrors filters.locationText */}
                <div className="mt-4">
                  <label
                    htmlFor="hero-location-input"
                    className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-100"
                  >
                    Location
                  </label>
                  <div className="flex items-center rounded-full bg-white px-3 py-2.5">
                    <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                    <input
                      id="hero-location-input"
                      type="text"
                      value={filters.locationText || ''}
                      onChange={(e) => setFilters((prev) => ({ ...prev, locationText: e.target.value }))}
                      placeholder="Enter city or ZIP"
                      autoComplete="off"
                      className="w-full border-none bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* WHAT ARE YOU LOOKING FOR section */}
              <div className="mb-6">
                <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-white">What are you looking for</label>
                <div className="flex flex-wrap justify-center gap-3">
                  {WHAT_OPTIONS.map((opt) => {
                    const isSelected = opt.value === '' ? !filters.listingType : filters.listingType === opt.value;
                    return (
                      <button
                        key={opt.value || 'all'}
                        type="button"
                        onClick={() => handleCategoryChange(opt.value)}
                        className="vb-chip vb-focus rounded-full px-5 py-3 text-[13px] font-semibold transition-all"
                        style={{
                          backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                          color: isSelected ? currentBrandColor : '#FFFFFF',
                          border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.8)'
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions row */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="vb-btn vb-focus inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-4 text-[15px] font-bold text-slate-800 shadow-lg"
                >
                  <Search className="h-5 w-5" strokeWidth={2.5} />
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters((p) => !p)}
                  className="vb-btn vb-focus inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-slate-800"
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
                  Filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              {/* MODE-SPECIFIC FILTERS */}
              {showFilters && (
                <div className="rounded-[16px] bg-white/10 p-6 backdrop-blur-sm">
                  {/* FOR RENT FILTERS */}
                  {activeTab === SEARCH_MODE.RENT && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Price Range */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Price Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={rentFilters.priceMin}
                            onChange={(e) => setRentFilters(p => ({ ...p, priceMin: e.target.value }))}
                            className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={rentFilters.priceMax}
                            onChange={(e) => setRentFilters(p => ({ ...p, priceMax: e.target.value }))}
                            className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      {/* Dates */}
                      <div className="relative">
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Dates</label>
                        <button
                          type="button"
                          onClick={() => setShowCalendar((p) => !p)}
                          className="flex w-full items-center justify-between rounded-[10px] bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <span className="text-slate-500">{filters.startDate && filters.endDate ? `${filters.startDate} → ${filters.endDate}` : 'Select dates'}</span>
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </button>
                        {showCalendar && <SimpleDatePicker />}
                      </div>
                      {/* Delivery */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Delivery</label>
                        <select
                          value={rentFilters.delivery}
                          onChange={(e) => setRentFilters(p => ({ ...p, delivery: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any</option>
                          <option value="included">Delivery included</option>
                          <option value="optional">Delivery optional</option>
                          <option value="pickup">Pickup only</option>
                        </select>
                      </div>
                      {/* Distance */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Distance (miles)</label>
                        <input
                          type="number"
                          placeholder="Radius in miles"
                          value={rentFilters.distance}
                          onChange={(e) => setRentFilters(p => ({ ...p, distance: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      {/* Size/Length */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Size / Length</label>
                        <select
                          value={rentFilters.size}
                          onChange={(e) => setRentFilters(p => ({ ...p, size: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any size</option>
                          <option value="small">Small (under 16ft)</option>
                          <option value="medium">Medium (16-24ft)</option>
                          <option value="large">Large (24ft+)</option>
                        </select>
                      </div>
                      {/* Add-ons */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Add-ons</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { key: 'branding', label: 'Branding kit' },
                            { key: 'generator', label: 'Generator' },
                            { key: 'waterTank', label: 'Water tank' },
                            { key: 'hoodSystem', label: 'Hood system' },
                            { key: 'staff', label: 'Staff included' }
                          ].map(({ key, label }) => (
                            <label key={key} className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={rentFilters.addOns[key]}
                                onChange={(e) => setRentFilters(p => ({ ...p, addOns: { ...p.addOns, [key]: e.target.checked } }))}
                                className="h-4 w-4 rounded border-slate-300 text-[#FF5124] focus:ring-[#FF5124]"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FOR SALE FILTERS */}
                  {activeTab === SEARCH_MODE.BUY && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Price Range */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Price Range</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={saleFilters.priceMin}
                            onChange={(e) => setSaleFilters(p => ({ ...p, priceMin: e.target.value }))}
                            className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={saleFilters.priceMax}
                            onChange={(e) => setSaleFilters(p => ({ ...p, priceMax: e.target.value }))}
                            className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      {/* Condition */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Condition</label>
                        <select
                          value={saleFilters.condition}
                          onChange={(e) => setSaleFilters(p => ({ ...p, condition: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any</option>
                          <option value="new">New</option>
                          <option value="like-new">Like new</option>
                          <option value="used">Used</option>
                        </select>
                      </div>
                      {/* Year */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Year</label>
                        <select
                          value={saleFilters.year}
                          onChange={(e) => setSaleFilters(p => ({ ...p, year: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any year</option>
                          {Array.from({ length: 15 }, (_, i) => 2024 - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      {/* Mileage */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Mileage</label>
                        <input
                          type="number"
                          placeholder="Max mileage"
                          value={saleFilters.mileage}
                          onChange={(e) => setSaleFilters(p => ({ ...p, mileage: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      {/* Equipment Package */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Equipment Package</label>
                        <select
                          value={saleFilters.equipment}
                          onChange={(e) => setSaleFilters(p => ({ ...p, equipment: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any</option>
                          <option value="basic">Basic</option>
                          <option value="full-kitchen">Full kitchen</option>
                          <option value="coffee">Coffee</option>
                          <option value="dessert">Dessert</option>
                          <option value="bar">Bar</option>
                        </select>
                      </div>
                      {/* Delivery Option */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Delivery Option</label>
                        <select
                          value={saleFilters.deliveryOption}
                          onChange={(e) => setSaleFilters(p => ({ ...p, deliveryOption: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any</option>
                          <option value="included">Delivery included</option>
                          <option value="fee">Delivery available for fee</option>
                          <option value="pickup">Buyer pickup</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* EVENT PRO FILTERS */}
                  {activeTab === SEARCH_MODE.EVENT_PRO && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Budget */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Budget</label>
                        <select
                          value={eventProFilters.budget}
                          onChange={(e) => setEventProFilters(p => ({ ...p, budget: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any budget</option>
                          <option value="under-1000">Under $1,000</option>
                          <option value="1000-5000">$1,000 - $5,000</option>
                          <option value="over-5000">Over $5,000</option>
                        </select>
                      </div>
                      {/* Event Date */}
                      <div className="relative">
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Event Date</label>
                        <button
                          type="button"
                          onClick={() => setShowCalendar((p) => !p)}
                          className="flex w-full items-center justify-between rounded-[10px] bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <span className="text-slate-500">{eventProFilters.eventDate || 'Select date'}</span>
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </button>
                        {showCalendar && <SimpleDatePicker />}
                      </div>
                      {/* Service Type */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Service Type</label>
                        <select
                          value={eventProFilters.serviceType}
                          onChange={(e) => setEventProFilters(p => ({ ...p, serviceType: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any service</option>
                          <option value="food-truck">Food truck catering</option>
                          <option value="bartender">Bartender</option>
                          <option value="dj">DJ</option>
                          <option value="photographer">Photographer</option>
                          <option value="entertainer">Entertainer</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      {/* Headcount */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Headcount</label>
                        <select
                          value={eventProFilters.headcount}
                          onChange={(e) => setEventProFilters(p => ({ ...p, headcount: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any size</option>
                          <option value="under-50">Under 50</option>
                          <option value="50-100">50 - 100</option>
                          <option value="over-100">Over 100</option>
                        </select>
                      </div>
                      {/* Distance */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Distance (miles)</label>
                        <input
                          type="number"
                          placeholder="Service radius"
                          value={eventProFilters.distance}
                          onChange={(e) => setEventProFilters(p => ({ ...p, distance: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      {/* Availability */}
                      <div>
                        <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-white">Availability</label>
                        <select
                          value={eventProFilters.availability}
                          onChange={(e) => setEventProFilters(p => ({ ...p, availability: e.target.value }))}
                          className="w-full rounded-[10px] border-0 bg-white px-4 py-3 text-sm font-medium text-slate-800"
                        >
                          <option value="">Any</option>
                          <option value="verified">Verified available</option>
                          <option value="flexible">Flexible</option>
                          <option value="weekends">Weekends only</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust badges + Mapbox attribution */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[12px] font-medium text-white/60">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Verified hosts
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instant booking
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Secure payments
            </span>
          </div>
          {/* Legal Mapbox attribution footer */}
          <p className="mt-4 text-center text-[10px] text-white/30">
            Location search powered by Mapbox
          </p>
        </div>
      </section>

      {/* Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-[#050608]/70 backdrop-blur-md"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="relative z-[85] flex min-h-full items-end justify-center px-4 pb-6 pt-10 sm:items-center">
            <div
              className="w-full max-w-4xl transform-gpu rounded-[32px] border border-white/30 bg-white/95 text-[#343434] shadow-[0_35px_120px_rgba(15,17,20,0.28)] backdrop-blur-2xl transition duration-300 ease-out animate-[vendibookModalEnter_0.4s_ease-out]"
              style={{ fontFamily: "'Sofia Pro Soft','Inter',sans-serif", paddingBottom: 'calc(env(safe-area-inset-bottom, 24px) + 24px)' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col gap-4 border-b border-black/5 px-6 pb-6 pt-8 sm:flex-row sm:items-start sm:justify-between sm:px-10">
                <div className="max-w-2xl space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Plan your next activation</p>
                  <h2 className="text-3xl font-bold text-[#343434]">Plan your next activation</h2>
                  <p className="text-sm text-[#5C5C5C]">
                    Search rentals, buy equipment, book event pros, or browse vendor markets — all from one polished modal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="ml-auto rounded-full border border-black/10 bg-white/80 p-2 text-[#343434] transition hover:scale-105 hover:border-[#FF5124] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]"
                  aria-label="Close search modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-7 px-6 pt-6 sm:px-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">I'm looking to</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {modeOptions.map((option) => {
                      const isActive = filters.mode === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleModeChange(option.id)}
                          className={`rounded-full border px-4 py-3 text-sm font-semibold tracking-tight transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FFB42C] ${
                            isActive
                              ? 'border-[#FF5124] bg-[#FFE7DE] text-[#FF5124] shadow-[0_8px_25px_rgba(255,81,36,0.25)]'
                              : 'border-neutral-200 bg-white text-[#5C5C5C] hover:border-[#FF5124]/40 hover:scale-[0.98]'
                          }`}
                          aria-pressed={isActive}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <LocationAutocomplete
                    label="Location"
                    value={locationSelection}
                    onChange={handleLocationSelect}
                    onQueryChange={handleLocationQueryChange}
                    placeholder="Enter city & state"
                    className="rounded-[30px]"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Category</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {modalCategoryOptions.map((category) => {
                        const Icon = category.Icon;
                        const isActive = filters.listingType
                          ? filters.listingType === category.value
                          : category.value === '';
                        return (
                          <button
                            type="button"
                            key={category.value || 'all'}
                            onClick={() => handleCategoryChange(category.value)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-150 ${
                              isActive
                                ? 'border-[#FF5124] bg-[#FFE7DE] text-[#FF5124] shadow-[0_6px_20px_rgba(255,81,36,0.25)]'
                                : 'border-neutral-200 bg-white text-[#5C5C5C] hover:border-[#FF5124]/40'
                            } hover:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]`}
                            aria-pressed={isActive}
                          >
                            <Icon className="h-[18px] w-[18px] text-current" strokeWidth={1.8} />
                            <span>{category.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Dates</p>
                  <div className="relative mt-3">
                    <button
                      type="button"
                      onClick={() => setShowCalendar((prev) => !prev)}
                      className="flex w-full items-center rounded-[28px] border border-[#E8E1DB] bg-white/90 px-5 py-3 pr-12 text-left text-sm font-semibold text-[#343434] shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB42C]"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-medium uppercase tracking-[0.28em] text-[#A3A3A3]">Dates</span>
                        <span className="text-base font-semibold text-[#343434]">
                          {filters.startDate && filters.endDate
                            ? `${filters.startDate} → ${filters.endDate}`
                            : filters.startDate
                              ? `${filters.startDate} (select end date)`
                              : 'Select start & end dates'}
                        </span>
                      </div>
                      <Calendar className="pointer-events-none absolute right-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF5124]" />
                    </button>
                    {showCalendar && <SimpleDatePicker />}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-2xl border border-dashed border-[#F1E7DE] bg-[#FDF9F5] px-5 py-3 text-sm font-semibold text-[#FF5124] transition hover:border-[#FFB42C]"
                >
                  Advanced filters
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showFilters && (
                  <div className="space-y-4 rounded-3xl border border-[#F1E7DE] bg-[#FFFCF9] p-5">
                    {ADVANCED_FILTER_PLACEHOLDERS.map((placeholder) => (
                      <div
                        key={placeholder.key}
                        className="rounded-2xl border border-dashed border-[#E4D7CB] bg-white/90 p-4"
                      >
                        <p className="text-sm font-semibold text-[#343434]">{placeholder.label}</p>
                        <p className="text-xs text-[#7C7C7C]">{placeholder.description}</p>
                        <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#FF5124]">
                          <Zap className="h-4 w-4" />
                          In sprint
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Recently searched locations</p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {recentSearchChips.map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => {
                            handleLocationQueryChange(chip.label);
                            handleLocationSelect({
                              label: chip.label,
                              placeName: chip.label,
                              city: chip.label.split(',')[0]?.trim(),
                              state: chip.label.split(',')[1]?.trim(),
                              lat: null,
                              lng: null
                            });
                          }}
                          className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-[#343434] shadow-sm transition hover:border-[#FF5124]/40 hover:text-[#FF5124]"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB42C]">Popular categories in your city</p>
                    <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                      {popularCategoryChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-transparent bg-[#343434] px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[#5C5C5C]">Filters sync instantly with the listings grid so you can book faster.</p>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF5124] via-[#FF6A1F] to-[#FFB42C] px-8 py-4 text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FF5124] sm:w-auto"
                  >
                    <Search className="h-5 w-5" />
                    {modalCtaLabel || 'Search rentals'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid + Map – Premium layout */}
      <section className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        {/* Active filters */}
        {activeFilterChips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeFilterChips.map((chip) => (
              <button
                type="button"
                key={chip.key}
                onClick={chip.onRemove}
                className="vb-chip vb-focus inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[13px] font-medium text-slate-500 underline underline-offset-2 transition-colors hover:text-slate-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Section header - "X rentals near Location" */}
        <div className="mb-8">
          <h2 className="text-[24px] font-bold tracking-[-0.02em] text-slate-900 sm:text-[28px]">
            {filteredListings.length} {listingResultsLabel} {appliedLocationLabel ? `near ${appliedLocationLabel}` : 'near your area'}
          </h2>
          {appliedCategoryLabel && appliedFilters.listingType && (
            <p className="mt-1 text-[14px] text-slate-500">
              Showing: {appliedCategoryLabel}
            </p>
          )}
        </div>

        {/* Mobile layout: heading → map → results (stacked) */}
        {/* Desktop layout: results (left 2/3) → map (right 1/3) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Mobile map - fixed height, shown first on mobile */}
          <div className="block h-[280px] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm lg:hidden">
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 bg-white/90 px-4 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Map</p>
              </div>
              <div className="relative flex-1 bg-slate-200">
                {/* Interactive Mapbox map with markers */}
                <VendibookMap 
                  center={{
                    lat: appliedFilters.latitude || 33.4152,
                    lng: appliedFilters.longitude || -111.9431
                  }}
                  zoom={appliedFilters.latitude ? 11 : 9}
                  markers={filteredListings.map(listing => ({
                    id: listing.id,
                    lat: listing.latitude,
                    lng: listing.longitude,
                    title: listing.title,
                    price: listing.price
                  }))}
                  activeMarkerId={hoveredListingId || activeMarkerId}
                  onMarkerClick={(markerId) => {
                    setActiveMarkerId(markerId);
                    // Scroll the listing card into view
                    const ref = listingRefs.current[markerId];
                    if (ref) {
                      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="absolute inset-0 !rounded-none"
                />
              </div>
            </div>
          </div>

          {/* Results column - scrollable with pagination */}
          <div className="flex-1 lg:max-h-[800px] lg:overflow-y-auto lg:pr-2" style={{ scrollbarWidth: 'thin' }}>
            {/* Cards grid */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing, index) => (
              <div
                key={listing.id}
                ref={(el) => { listingRefs.current[listing.id] = el; }}
                className={`vb-card vb-focus group cursor-pointer overflow-hidden rounded-[20px] bg-white vb-shadow-md transition-all duration-200 ${activeMarkerId === listing.id ? 'ring-2 ring-[#FF5124] ring-offset-2' : ''}`}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => handleOpenQuickView(listing)}
                onMouseEnter={() => setHoveredListingId(listing.id)}
                onMouseLeave={() => setHoveredListingId(null)}
              >
                {/* Image container */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="vb-img-zoom h-full w-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Badges */}
                  {listing.deliveryAvailable && (
                    <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-md">
                      Delivery
                    </div>
                  )}
                  {listing.isVerified && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  )}
                  {/* Wishlist button */}
                  <button
                    type="button"
                    className="vb-btn absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:text-[#FF5124]"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Card content */}
                <div className="p-5">
                  {/* Title + Rating */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-slate-900">
                      {listing.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-[14px] font-semibold text-slate-900">{listing.rating}</span>
                    </div>
                  </div>

                  {/* Location */}
                  <p className="mb-1 flex items-center gap-1.5 text-[13px] text-slate-500">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {listing.location}
                  </p>

                  {/* Host */}
                  <p className="mb-4 text-[13px] text-slate-500">
                    {listing.host}
                  </p>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {(listing.highlights || listing.tags || []).slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 border-t border-slate-100 pt-4">
                    <span className="text-[18px] font-bold tracking-tight text-slate-900">
                      ${listing.price?.toLocaleString()}
                    </span>
                    {listing.priceUnit && (
                      <span className="text-[13px] text-slate-500">/ {listing.priceUnit}</span>
                    )}
                  </div>
                </div>
              </div>
              ))}
            </div>

            {/* Pagination placeholder */}
            {filteredListings.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Previous
                </button>
                <span className="px-3 text-sm text-slate-500">Page 1 of 1</span>
                <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Desktop map column - sticky, 1/3 width */}
          <aside className="sticky top-[96px] hidden h-[600px] w-[400px] shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm lg:block xl:w-[480px]">
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 bg-white/90 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Map</p>
                <p className="text-sm text-slate-700">
                  {appliedLocationLabel ? `Near ${appliedLocationLabel}` : 'Your area'}
                </p>
              </div>
              <div className="relative flex-1 bg-slate-200">
                {/* Interactive Mapbox map with markers */}
                <VendibookMap 
                  center={{
                    lat: appliedFilters.latitude || 33.4152,
                    lng: appliedFilters.longitude || -111.9431
                  }}
                  zoom={appliedFilters.latitude ? 11 : 9}
                  markers={filteredListings.map(listing => ({
                    id: listing.id,
                    lat: listing.latitude,
                    lng: listing.longitude,
                    title: listing.title,
                    price: listing.price
                  }))}
                  activeMarkerId={hoveredListingId || activeMarkerId}
                  onMarkerClick={(markerId) => {
                    setActiveMarkerId(markerId);
                    // Scroll the listing card into view
                    const ref = listingRefs.current[markerId];
                    if (ref) {
                      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="absolute inset-0 !rounded-none"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Empty state */}
        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Store className="h-10 w-10 text-slate-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-[18px] font-semibold text-slate-900">No results found</h3>
            <p className="max-w-sm text-[15px] text-slate-500">Try adjusting your filters or search criteria to discover more options.</p>
          </div>
        )}
      </section>

      {/* Quick View Overlay – Premium modal */}
      {quickViewListing && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 px-5 py-10 backdrop-blur-md vb-enter-fade">
          <div className="vb-enter-scale relative w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.35)]" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              type="button"
              onClick={handleCloseQuickView}
              className="absolute right-4 top-4 rounded-full bg-black/5 p-1 text-slate-600 hover:bg-black/10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={quickViewListing.image}
                    alt={quickViewListing.title}
                    className="h-60 w-full object-cover"
                  />
                </div>
                {/* Thumbnail gallery */}
                {Array.isArray(quickViewListing.imageUrls) && quickViewListing.imageUrls.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {quickViewListing.imageUrls.slice(0, 6).map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          // swap main image with selected thumb
                          setQuickViewListing((prev) => (prev ? { ...prev, image: url } : prev));
                        }}
                        className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img src={url} alt="Thumbnail" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                {!quickViewListing.imageUrls?.length && (
                  <div className="mt-3 text-[11px] text-slate-500">
                    Quick view shows a preview. Full gallery lives on the listing page.
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{quickViewListing.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {quickViewListing.location || [quickViewListing.city, quickViewListing.state].filter(Boolean).join(', ')}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    {quickViewListing.host && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Verified host</span>
                    )}
                    {quickViewListing.deliveryAvailable && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">Delivery available</span>
                    )}
                    {appliedFilters.mode === SEARCH_MODE.EVENT_PRO && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">Event pro</span>
                    )}
                    {appliedFilters.mode === SEARCH_MODE.BUY && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">Financing available*</span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-slate-700">
                    {(quickViewListing.description || '').slice(0, 160) || 'Preview this listing, then open the full page for calendar, gallery, and complete details.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    {(quickViewListing.highlights || quickViewListing.tags || []).slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 font-medium">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-600">From</p>
                    <p className="text-xl font-semibold text-slate-900">
                      ${quickViewListing.price?.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        {quickViewListing.priceUnit ? ` / ${quickViewListing.priceUnit}` : ''}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={handlePrimaryCta}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-[#FF5124] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#E04821]"
                    >
                      {getPrimaryCtaLabel()}
                    </button>
                    <button
                      type="button"
                      onClick={handleViewFullListing}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      View full listing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How Vendibook Works Section */}
      <section style={{ background: '#F8F8F8', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#343434' }}>
            How Vendibook Works
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            Start your mobile business in three simple steps
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            {[
              {
                step: '1',
                icon: '🔍',
                title: 'Browse verified vehicles and kitchens',
                description: 'Search our marketplace of food trucks, trailers, ghost kitchens, and event pros. All equipment is inspected and hosts are verified.'
              },
              {
                step: '2',
                icon: '✅',
                title: 'Book secure rentals or event pros',
                description: 'Select your dates, choose your location, and book instantly. Flexible payment options and insurance included for peace of mind.'
              },
              {
                step: '3',
                icon: '🚀',
                title: 'Launch or grow your mobile business',
                description: 'Get your equipment delivered or pick it up. Start serving customers and growing your business with our ongoing support.'
              }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#FF5124',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '36px'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#FF5124',
                  marginBottom: '12px',
                  letterSpacing: '1px'
                }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#343434' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(52, 52, 52, 0.65)', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section style={{ padding: '80px 40px', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '700', textAlign: 'center', marginBottom: '16px', color: '#343434' }}>
            Trusted by Mobile Business Owners
          </h2>
          <p style={{ fontSize: '18px', textAlign: 'center', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '60px' }}>
            Join hundreds of entrepreneurs who've launched with Vendibook
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              {
                quote: "Vendibook made it so easy to start my taco truck business. Found the perfect truck, got it delivered, and was serving customers within a week!",
                author: "Maria Rodriguez",
                business: "Maria's Tacos, Phoenix",
                rating: 5
              },
              {
                quote: "As a ghost kitchen owner, Vendibook connects me with amazing chefs. The platform is reliable and the verification process gives me peace of mind.",
                author: "James Chen",
                business: "CloudKitchen AZ, Tempe",
                rating: 5
              },
              {
                quote: "I wanted to test my food concept before investing in my own truck. Vendibook let me rent by the week and see if my business idea worked. Now I'm thriving!",
                author: "Sarah Thompson",
                business: "Sweet Treats Mobile, Scottsdale",
                rating: 5
              }
            ].map((review, idx) => (
              <div key={idx} style={{
                padding: '32px',
                background: '#F8F8F8',
                borderRadius: '16px',
                border: '1px solid #EDEDED'
              }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', fill: '#FF5124', color: '#FF5124' }} />
                  ))}
                </div>
                <p style={{ fontSize: '15px', color: '#343434', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>
                  "{review.quote}"
                </p>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#343434' }}>{review.author}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(52, 52, 52, 0.65)' }}>{review.business}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: '#FF5124',
        padding: '80px 40px',
        marginTop: '0'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>
            Ready to start your mobile business?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.95)', marginBottom: '32px' }}>
            Browse equipment, book rentals, or list your own vehicles
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSearchModalOpen(true)}
              style={{
                background: 'white',
                color: '#FF5124',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              Browse Equipment
            </button>
            <button style={{
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Become a Host
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#F8F8F8', padding: '48px 40px', marginTop: '0' }}>
        <div style={{ maxWidth: '1760px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Rent</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Food Trucks</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Trailers</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Ghost Kitchens</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Vending Lots</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Buy</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Buy Equipment</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Financing Options</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Inspection Services</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Host</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Become a Host</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Host Protection</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Pricing Calculator</a>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#343434' }}>Support</h4>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Help Center</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>FAQ</a>
              <a href="#" style={{ display: 'block', fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', marginBottom: '12px', textDecoration: 'none' }}>Contact Us</a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #D8D8D8', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)' }}>
              © 2025 Vendibook LLC · All rights reserved
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', textDecoration: 'none' }}>Sitemap</a>
              <button
                type="button"
                onClick={() => navigate('/about')}
                style={{ fontSize: '14px', color: 'rgba(52, 52, 52, 0.65)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                About
              </button>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}

export default HomePage;
