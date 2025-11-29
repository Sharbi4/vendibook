import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Header Component
 * Shared header across all pages with logo and hamburger menu
 * Used on homepage, auth pages, and other main pages
 */
function Header({ onMenuOpen, variant = 'default' }) {
  // variant can be 'default' (white bg) or 'transparent' (for overlay on images)
  const isTransparent = variant === 'transparent';

  return (
    <header
      className={`sticky top-0 z-40 ${
        isTransparent
          ? 'bg-transparent'
          : 'border-b border-slate-200/80 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl'
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Left: Logo */}
        <Link to="/" className="group flex items-center" aria-label="Vendibook home">
          <img
            src="https://k6dbqk6vsjuxeqeq.public.blob.vercel-storage.com/vendibook%20%20logo%20transparent.png"
            alt="Vendibook"
            className="h-10 w-auto transition-transform group-hover:scale-[1.02] sm:h-11"
          />
        </Link>

        {/* Right: Hamburger Menu Button */}
        <button
          type="button"
          onClick={onMenuOpen}
          className={`inline-flex items-center rounded-full border p-2.5 shadow-sm transition-all hover:scale-105 active:scale-95 ${
            isTransparent
              ? 'border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  onMenuOpen: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'transparent']),
};

export default Header;
