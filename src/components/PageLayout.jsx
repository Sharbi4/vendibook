import { useState } from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import SidebarMenu from './SidebarMenu';

/**
 * PageLayout Component
 * Reusable layout wrapper that provides consistent header and sidebar menu
 * across all pages. Handles content shifting when sidebar is open.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.headerVariant - 'default' or 'transparent' header style
 * @param {string} props.className - Additional CSS classes for the content wrapper
 * @param {boolean} props.fullHeight - Whether to use full viewport height
 *
 * @example
 * // Basic usage with default white header
 * <PageLayout>
 *   <div className="p-8">
 *     <h1>My Page Content</h1>
 *   </div>
 * </PageLayout>
 *
 * @example
 * // With transparent header (for pages with hero images)
 * <PageLayout headerVariant="transparent" fullHeight>
 *   <div className="relative min-h-screen">
 *     <div className="absolute inset-0">
 *       <img src="/hero.jpg" className="h-full w-full object-cover" />
 *     </div>
 *     <div className="relative z-10">
 *       <h1>Content over image</h1>
 *     </div>
 *   </div>
 * </PageLayout>
 */
function PageLayout({ children, headerVariant = 'default', className = '', fullHeight = false }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Sidebar Menu */}
      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Main Content - shifts when menu is open */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          menuOpen ? '-mr-[380px] max-[768px]:-mr-[85vw]' : 'mr-0'
        } ${fullHeight ? 'min-h-screen' : ''} ${className}`}
      >
        {/* Header */}
        <Header onMenuOpen={() => setMenuOpen(true)} variant={headerVariant} />

        {/* Page Content */}
        {children}
      </div>
    </>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  headerVariant: PropTypes.oneOf(['default', 'transparent']),
  className: PropTypes.string,
  fullHeight: PropTypes.bool,
};

export default PageLayout;
