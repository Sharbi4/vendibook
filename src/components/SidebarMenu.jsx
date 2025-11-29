import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import PropTypes from 'prop-types';

/**
 * SidebarMenu Component
 * Comprehensive navigation sidebar that slides from the right
 * Pushes page content to the left instead of overlaying
 * Shows different links based on authentication state
 */
function SidebarMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { signOut } = useClerk();

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle ESC key to close menu
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const focusableElements = sidebarRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - clicking outside closes menu */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className="fixed right-0 top-0 z-50 h-full w-[380px] max-w-[85vw] overflow-y-auto border-l border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <Link to="/" onClick={onClose} className="flex items-center">
            <img
              src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png"
              alt="Vendibook"
              className="h-9 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-6 py-6">
          {/* Explore Section */}
          <div className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Explore
            </h3>
            <div className="space-y-1">
              <MenuLink onClick={() => handleNavigate('/')}>Home</MenuLink>
              <MenuLink onClick={() => handleNavigate('/listings')}>Browse Listings</MenuLink>
              <MenuLink onClick={() => handleNavigate('/category/food-trucks')}>Food Trucks</MenuLink>
              <MenuLink onClick={() => handleNavigate('/category/food-trailers')}>
                Food Trailers
              </MenuLink>
              <MenuLink onClick={() => handleNavigate('/category/event-pros')}>Event Pros</MenuLink>
              <MenuLink onClick={() => handleNavigate('/category/ghost-kitchens')}>
                Ghost Kitchens
              </MenuLink>
              <MenuLink onClick={() => handleNavigate('/category/lots')}>Lots & Parking</MenuLink>
              <MenuLink onClick={() => handleNavigate('/for-sale')}>For Sale Marketplace</MenuLink>
            </div>
          </div>

          {/* Learn / How it Works Section */}
          <div className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Learn
            </h3>
            <div className="space-y-1">
              <MenuLink onClick={() => handleNavigate('/how-it-works')}>How It Works</MenuLink>
              <MenuLink onClick={() => handleNavigate('/guides/renters')}>Renter Guide</MenuLink>
              <MenuLink onClick={() => handleNavigate('/guides/hosts')}>Host Guide</MenuLink>
              <MenuLink onClick={() => handleNavigate('/guides/buying')}>Buying Guide</MenuLink>
              <MenuLink onClick={() => handleNavigate('/blog')}>Blog</MenuLink>
              <MenuLink onClick={() => handleNavigate('/faq')}>FAQ</MenuLink>
            </div>
          </div>

          {/* Company Section */}
          <div className="mb-6">
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company
            </h3>
            <div className="space-y-1">
              <MenuLink onClick={() => handleNavigate('/about')}>About</MenuLink>
              <MenuLink onClick={() => handleNavigate('/contact')}>Contact</MenuLink>
              <MenuLink onClick={() => handleNavigate('/trust')}>Trust & Safety</MenuLink>
              <MenuLink onClick={() => handleNavigate('/insurance')}>Insurance (FLIP)</MenuLink>
              <MenuLink onClick={() => handleNavigate('/terms')}>Terms of Service</MenuLink>
              <MenuLink onClick={() => handleNavigate('/privacy')}>Privacy Policy</MenuLink>
            </div>
          </div>

          {/* Conditional: Logged Out Links */}
          <SignedOut>
            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Get Started
              </h3>
              <div className="space-y-1">
                <MenuLink onClick={() => handleNavigate('/signin')}>Login</MenuLink>
                <MenuLink onClick={() => handleNavigate('/signup')}>Create Account</MenuLink>
                <MenuLink onClick={() => handleNavigate('/become-a-host')}>
                  Become a Host
                </MenuLink>
              </div>
            </div>
          </SignedOut>

          {/* Conditional: Logged In Links */}
          <SignedIn>
            {/* My Account Section */}
            <div className="mb-6 border-t border-slate-200 pt-6">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                My Account
              </h3>
              <div className="space-y-1">
                <MenuLink onClick={() => handleNavigate('/dashboard')}>Dashboard</MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/bookings')}>
                  My Bookings
                </MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/listings')}>
                  My Listings
                </MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/messages')}>Messages</MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/saved')}>
                  Saved Listings
                </MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/settings/profile')}>
                  Profile Settings
                </MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/settings/payments')}>
                  Payment Methods
                </MenuLink>
              </div>
            </div>

            {/* Host Actions Section */}
            <div className="mb-6">
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Host Actions
              </h3>
              <div className="space-y-1">
                <MenuLink onClick={() => handleNavigate('/dashboard/listings/new')}>
                  Create Listing
                </MenuLink>
                <MenuLink onClick={() => handleNavigate('/dashboard/earnings')}>
                  Payouts / Earnings
                </MenuLink>
              </div>
            </div>

            {/* Logout */}
            <div className="border-t border-slate-200 pt-6">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </SignedIn>
        </nav>
      </aside>
    </>
  );
}

/**
 * MenuLink Component
 * Reusable link component for sidebar menu items
 */
function MenuLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-xl px-4 py-3 text-left text-base font-medium text-slate-700 transition hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

MenuLink.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

SidebarMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SidebarMenu;
