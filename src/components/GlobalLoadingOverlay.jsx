import React from 'react';
import PropTypes from 'prop-types';

// Simple global loading overlay. Use with suspense or manual app-level loading states.
function GlobalLoadingOverlay({ active, message = 'Loading…' }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="brand-card flex min-w-[320px] flex-col items-center gap-4 px-9 py-7 text-charcoal">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gold/20 border-t-orange" />
        <p className="text-sm font-semibold text-charcoal/80">{message}</p>
      </div>
    </div>
  );
}

GlobalLoadingOverlay.propTypes = {
  active: PropTypes.bool,
  message: PropTypes.string,
};

export default GlobalLoadingOverlay;
