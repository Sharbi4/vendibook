import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader2, Save } from 'lucide-react';

const STATE_OPTIONS = ['AZ', 'CA', 'NV', 'NM', 'TX', 'WA', 'OR'];

const buildFormState = (host) => ({
  displayName: host?.display_name || host?.displayName || '',
  tagline: host?.tagline || '',
  bio: host?.bio || '',
  city: host?.city || '',
  state: host?.state || '',
  serviceAreaDescription: host?.service_area_description || '',
  cuisines: host?.cuisines || ''
});

function HostProfileForm({ host, onSave }) {
  const [formState, setFormState] = useState(() => buildFormState(host));
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setFormState(buildFormState(host));
    setFeedback('');
  }, [host?.id]);

  const isDisabled = useMemo(() => !host?.id || status === 'saving', [host?.id, status]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!host?.id) return;

    setStatus('saving');
    setFeedback('');

    try {
      const response = await fetch(`/api/users/me?userId=${host.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Failed to save profile');
      }

      setFeedback('Profile saved');
      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error('Failed to save host profile', error);
      setFeedback(error.message || 'Unable to save profile');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Public display name</label>
        <input
          type="text"
          value={formState.displayName}
          onChange={(e) => handleChange('displayName', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          placeholder="La Shawnna – Tucson Food Truck Host"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Short bio / host story</label>
        <textarea
          value={formState.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          rows={4}
          placeholder="Share your experience, mission, or what makes activations unforgettable."
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Service tagline</label>
        <input
          type="text"
          value={formState.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          placeholder="Mobile cafecito + churro pop-ups across the Southwest"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-800">Primary city</label>
          <input
            type="text"
            value={formState.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="Phoenix"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-800">State</label>
          <select
            value={formState.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="">Select state</option>
            {STATE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Service area description</label>
        <textarea
          value={formState.serviceAreaDescription}
          onChange={(e) => handleChange('serviceAreaDescription', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          rows={3}
          placeholder="Example: We activate within 50 miles of Phoenix and frequently pop up in Scottsdale, Mesa, and Tucson."
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Cuisines / specialties (comma separated)</label>
        <input
          type="text"
          value={formState.cuisines}
          onChange={(e) => handleChange('cuisines', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          placeholder="Sonoran tacos, brunch bars, cafecito"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isDisabled}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
        >
          {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status === 'saving' ? 'Saving' : 'Save changes'}
        </button>
        {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
      </div>
    </form>
  );
}

HostProfileForm.propTypes = {
  host: PropTypes.object,
  onSave: PropTypes.func
};

HostProfileForm.defaultProps = {
  host: null,
  onSave: null
};

export default HostProfileForm;
