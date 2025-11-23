import React from 'react';

export function ListingMapPlaceholder({ city, state, radiusMiles }) {
  const locationLabel = [city, state].filter(Boolean).join(', ');
  const formattedRadius = Number.isFinite(radiusMiles) ? Number(radiusMiles) : null;
  const radiusLabel = formattedRadius ? `${formattedRadius} mile${formattedRadius === 1 ? '' : 's'}` : null;

  // TODO: Integrate live map using import.meta.env.VITE_MAPBOX_TOKEN or import.meta.env.VITE_GOOGLE_MAPS_KEY once keys are provisioned.
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Map Preview
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Map view coming soon</p>
        {locationLabel && <p className="mt-1 text-sm text-slate-600">{locationLabel}</p>}
        {radiusLabel && (
          <p className="text-xs font-medium text-slate-500">Approx. service radius {radiusLabel}</p>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        {/* TODO: Replace placeholder with live map powered by import.meta.env.VITE_MAPBOX_TOKEN or import.meta.env.VITE_GOOGLE_MAPS_KEY */}
        We will render the live map once env-based provider keys are configured.
      </p>
    </section>
  );
}
