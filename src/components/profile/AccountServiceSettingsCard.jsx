import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader2, RefreshCcw, Save } from 'lucide-react';

const buildFormState = (settings) => ({
  publicPhone: settings?.public_phone || '',
  serviceRadiusMiles: settings?.service_radius_miles ?? settings?.search_radius_miles ?? 25,
  willingToTravel: Boolean(settings?.willing_to_travel),
  travelNotes: settings?.travel_notes || ''
});

function AccountServiceSettingsCard({ userId, settings, onInitialized, onSave }) {
  const [formState, setFormState] = useState(() => buildFormState(settings));
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setFormState(buildFormState(settings));
  }, [settings?.id]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const initializeSettings = async () => {
    if (!userId) return;
    setStatus('initializing');
    setFeedback('');

    try {
      const response = await fetch(`/api/user-settings/me?userId=${userId}`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Unable to initialize settings');
      }
      if (onInitialized) {
        onInitialized(result.data);
      }
    } catch (error) {
      console.error('Failed to initialize settings', error);
      setFeedback(error.message || 'Unable to create settings');
    } finally {
      setStatus('idle');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;
    setStatus('saving');
    setFeedback('');

    try {
      const payload = {
        publicPhone: formState.publicPhone,
        serviceRadiusMiles: formState.serviceRadiusMiles,
        willingToTravel: formState.willingToTravel,
        travelNotes: formState.travelNotes
      };

      const response = await fetch(`/api/user-settings/me?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Failed to save settings');
      }

      setFeedback('Settings saved');
      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error('Failed to save host settings', error);
      setFeedback(error.message || 'Unable to save settings');
    } finally {
      setStatus('idle');
    }
  };

  if (!settings) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Account & service settings</h3>
        <p className="mt-2 text-sm text-slate-600">Create your default settings to unlock contact info and travel preferences.</p>
        <button
          type="button"
          onClick={initializeSettings}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg"
          disabled={status === 'initializing'}
        >
          {status === 'initializing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          {status === 'initializing' ? 'Creating' : 'Create default settings'}
        </button>
        {feedback && <p className="mt-3 text-sm text-rose-600">{feedback}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Account & service settings</h3>
        <p className="text-sm text-slate-600">Keep renters informed on how and where you operate.</p>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Booking contact phone</label>
        <input
          type="text"
          value={formState.publicPhone}
          onChange={(e) => handleChange('publicPhone', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          placeholder="(555) 555-0199"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Default service radius (miles)</label>
        <input
          type="number"
          min="1"
          value={formState.serviceRadiusMiles}
          onChange={(e) => handleChange('serviceRadiusMiles', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-200"
          checked={formState.willingToTravel}
          onChange={(e) => handleChange('willingToTravel', e.target.checked)}
        />
        <span>
          <span className="block font-semibold text-slate-900">I am willing to travel outside my city</span>
          <span className="text-slate-600">Great for Event Pros and touring pop-ups.</span>
        </span>
      </label>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-slate-800">Travel notes</label>
        <textarea
          value={formState.travelNotes}
          onChange={(e) => handleChange('travelNotes', e.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          rows={3}
          placeholder="Example: We travel for festivals within 200 miles if lodging is provided."
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-60"
          disabled={status === 'saving'}
        >
          {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status === 'saving' ? 'Saving' : 'Save preferences'}
        </button>
        {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
      </div>
    </form>
  );
}

AccountServiceSettingsCard.propTypes = {
  userId: PropTypes.string,
  settings: PropTypes.object,
  onInitialized: PropTypes.func,
  onSave: PropTypes.func
};

AccountServiceSettingsCard.defaultProps = {
  userId: null,
  settings: null,
  onInitialized: null,
  onSave: null
};

export default AccountServiceSettingsCard;
