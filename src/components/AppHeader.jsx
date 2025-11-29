import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronRight, Truck, Users, MapPin, Store, 
  BookOpen, HelpCircle, User, MessageSquare, Heart, 
  LayoutDashboard, Info, Mail, Shield, FileText 
} from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { clerkPublishableKey } from '../config/clerkConfig';

// Mobile menu sections matching Webflow Rental X structure
const MOBILE_MENU_SECTIONS = [
  {
    title: 'Explore',
    items: [
      { label: 'Food Trucks', path: '/rent?listingType=food-trucks', icon: Truck },
      { label: 'Food Trailers', path: '/rent?listingType=trailers', icon: Truck },
      { label: 'Event Pros', path: '/event-pro', icon: Users },
      { label: 'Ghost Kitchens', path: '/rent?listingType=ghost-kitchen', icon: Store },
      { label: 'Lots & Parking', path: '/rent?listingType=vending-lot', icon: MapPin },
      { label: 'For Sale', path: '/for-sale', icon: Store }
    ]
  },
  {
    title: 'Learn',
    items: [
      { label: 'Blog', path: '/blog', icon: BookOpen },
      { label: 'Renter Guide', path: '/how-it-works/renter', icon: BookOpen },
      { label: 'Host Guide', path: '/how-it-works/host', icon: BookOpen },
      { label: 'Buying Guide', path: '/how-it-works/buyer', icon: BookOpen },
      { label: 'FAQ', path: '/help', icon: HelpCircle }
    ]
  },
  {
    title: 'Company',
    items: [
      { label: 'About', path: '/about', icon: Info },
      { label: 'Contact', path: '/contact', icon: Mail },
      { label: 'Terms & Policies', path: '/terms', icon: FileText },
      { label: 'Privacy', path: '/privacy', icon: Shield }
    ]
  }
];

const ACCOUNT_MENU_ITEMS = [
  { label: 'Dashboard', path: '/host/dashboard', icon: LayoutDashboard },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'My Bookings', path: '/bookings', icon: BookOpen },
  { label: 'Saved Listings', path: '/wishlist', icon: Heart },
  { label: 'Profile', path: '/profile', icon: User }
];

function AppHeader({ className = '' }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const clerkEnabled = Boolean(clerkPublishableKey);

  const handleNavigate = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className={`sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl ${className}`}>
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Left: Logo */}
        <Link to="/" className="group flex items-center" aria-label="Vendibook home">
          <img 
            src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png" 
            alt="Vendibook" 
            className="h-10 w-auto transition-transform group-hover:scale-[1.02] sm:h-11"
          />
        </Link>

        {/* Right: Community + Sign in + Sign up (far right) */}
        <div className="hidden items-center gap-4 xl:flex">
          <button
            type="button"
            onClick={() => handleNavigate('/community')}
            className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Community
          </button>
          {clerkEnabled ? (
            <>
              <SignedIn>
                <button
                  type="button"
                  onClick={() => handleNavigate('/messages')}
                  className="rounded-full border border-slate-200 px-4 py-2 text-[14px] font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Inbox
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/host/dashboard')}
                  className="rounded-full bg-slate-900 px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Dashboard
                </button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-9 w-9',
                      userButtonPopoverMain: 'min-w-[220px]'
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signin')}
                  className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('/signup')}
                  className="rounded-full bg-[#FF5124] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)]"
                >
                  Sign up
                </button>
              </SignedOut>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleNavigate('/signin')}
                className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('/signup')}
                className="rounded-full bg-[#FF5124] px-5 py-2.5 text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(255,81,36,0.25)] transition-all hover:bg-[#E94A1F] hover:shadow-[0_4px_16px_rgba(255,81,36,0.35)]"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 xl:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer - Enhanced Webflow-style navigation */}
      {mobileOpen && (
        <div className="xl:hidden">
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center">
                <img 
                  src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png" 
                  alt="Vendibook" 
                  className="h-9 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Navigation */}
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              {/* Account Section - Shown when signed in */}
              {clerkEnabled && (
                <SignedIn>
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Account</p>
                    <div className="space-y-1">
                      {ACCOUNT_MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => handleNavigate(item.path)}
                            className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Icon className="h-5 w-5 text-slate-400" />
                            {item.label}
                            <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 mb-6" />
                </SignedIn>
              )}

              {/* Menu Sections */}
              {MOBILE_MENU_SECTIONS.map((section, sectionIndex) => (
                <div key={section.title} className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{section.title}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => handleNavigate(item.path)}
                          className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-slate-400" />
                          {item.label}
                          <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                        </button>
                      );
                    })}
                  </div>
                  {sectionIndex < MOBILE_MENU_SECTIONS.length - 1 && (
                    <div className="border-t border-slate-100 mt-6" />
                  )}
                </div>
              ))}
            </nav>

            {/* Footer with Auth */}
            <div className="border-t border-slate-200 px-5 py-4 bg-slate-50">
              {clerkEnabled ? (
                <>
                  <SignedIn>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserButton
                          afterSignOutUrl="/"
                          appearance={{ elements: { avatarBox: 'h-10 w-10' } }}
                        />
                        <span className="text-sm font-medium text-slate-700">My Account</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/host/onboarding')}
                        className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                      >
                        List Equipment
                      </button>
                    </div>
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/signup')}
                        className="w-full rounded-full bg-[#FF5124] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E94A1F]"
                      >
                        Sign up
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/signin')}
                        className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                      >
                        Sign in
                      </button>
                    </div>
                  </SignedOut>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/signup')}
                    className="w-full rounded-full bg-[#FF5124] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E94A1F]"
                  >
                    Sign up
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/signin')}
                    className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AppHeader;
