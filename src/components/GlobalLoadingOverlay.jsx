import React from 'react';
import PropTypes from 'prop-types';

// Simple global loading overlay. Use with suspense or manual app-level loading states.
function GlobalLoadingOverlay({ active, message = 'Loading…' }) {
  if (!active) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', border: '1px solid #EBEBEB', borderRadius: '16px', padding: '28px 36px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '320px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #FFE1D6', borderTopColor: '#FF5124', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ fontSize: '14px', fontWeight: 500, color: '#343434' }}>{message}</p>
      </div>
      <style>{`@keyframes spin {from {transform: rotate(0deg);} to {transform: rotate(360deg);}}`}</style>
    </div>
  );
}

GlobalLoadingOverlay.propTypes = {
  active: PropTypes.bool,
  message: PropTypes.string,
};

export default GlobalLoadingOverlay;
