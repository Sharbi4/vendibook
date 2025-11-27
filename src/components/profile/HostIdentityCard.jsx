import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'VH';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleLabelMap = {
  host: 'Host',
  'event-pro': 'Event Pro',
  event_pro: 'Event Pro',
  renter: 'Renter',
  admin: 'Team'
};

function HostIdentityCard({ host, isLoading }) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/2 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
        <div className="mt-6 h-3 rounded bg-slate-100 animate-pulse" />
        <div className="mt-3 h-3 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const displayName = host?.display_name || host?.displayName || [host?.first_name, host?.last_name].filter(Boolean).join(' ').trim() || host?.business_name || 'Your host identity';
  const location = [host?.city, host?.state].filter(Boolean).join(', ');
  const role = roleLabelMap[host?.role] || 'Host';
  const tagline = host?.tagline || 'Let renters know what makes your experiences special.';
  const serviceArea = host?.service_area_description || 'Describe your service radius or markets served.';
  const cuisines = host?.cuisines || '';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-2xl font-bold text-orange-600">
            {getInitials(displayName)}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Host identity</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-600">{location || 'Location coming soon'}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
            {role}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <Star className="h-4 w-4" /> 4.9 · 32 activations
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-700">{tagline}</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Service footprint</p>
        <p className="mt-1 text-slate-600">{serviceArea}</p>
        {cuisines ? (
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">{cuisines}</p>
        ) : null}
      </div>
    </div>
  );
}

HostIdentityCard.propTypes = {
  host: PropTypes.object,
  isLoading: PropTypes.bool
};

HostIdentityCard.defaultProps = {
  host: null,
  isLoading: false
};

export default HostIdentityCard;
