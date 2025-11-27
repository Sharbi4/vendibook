import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Loader2, Save } from 'lucide-react';

const buildState = (links) => ({
  websiteUrl: links?.website_url || '',
  instagramUrl: links?.instagram_url || '',
  tiktokUrl: links?.tiktok_url || '',
  youtubeUrl: links?.youtube_url || '',
  facebookUrl: links?.facebook_url || ''
});

function SocialLinksCard({ userId, links, onInitialized, onSave }) {
  const [formState, setFormState] = useState(() => buildState(links));
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setFormState(buildState(links));
  }, [links?.id]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const initializeLinks = async () => {
    if (!userId) return;
    setStatus('initializing');
    setFeedback('');
    try {
      const response = await fetch(`/api/user-social-links/me?userId=${userId}`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Unable to create links record');
      }
      if (onInitialized) {
        onInitialized(result.data);
      }
    } catch (error) {
      console.error('Failed to initialize social links', error);
      setFeedback(error.message || 'Unable to initialize');
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
      const response = await fetch(`/api/user-social-links/me?userId=${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });

      const result = await response.json();
      if (!response.ok || !result?.data) {
        throw new Error(result?.error || 'Failed to save links');
      }

      setFeedback('Social links updated');
      if (onSave) {
        onSave(result.data);
      }
    } catch (error) {
      console.error('Failed to save social links', error);
      setFeedback(error.message || 'Unable to save links');
    } finally {
      setStatus('idle');
    }
  };

  if (!links) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Social links</h3>
        <p className="mt-2 text-sm text-slate-600">Link your top-of-funnel channels so renters can validate your brand.</p>
        <button
          type="button"
          onClick={initializeLinks}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg"
          disabled={status === 'initializing'}
        >
          {status === 'initializing' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create links record'}
        </button>
        {feedback && <p className="mt-3 text-sm text-rose-600">{feedback}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Social links</h3>
        <p className="text-sm text-slate-600">Add any links that renters rely on for proof-of-work.</p>
      </div>

      {[
        { key: 'websiteUrl', label: 'Website' },
        { key: 'instagramUrl', label: 'Instagram' },
        { key: 'tiktokUrl', label: 'TikTok' },
        { key: 'youtubeUrl', label: 'YouTube' },
        { key: 'facebookUrl', label: 'Facebook' }
      ].map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="block text-sm font-semibold text-slate-800">{field.label}</label>
          <input
            type="url"
            value={formState[field.key]}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder={`https://...`}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg"
        >
          {status === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {status === 'saving' ? 'Saving' : 'Save social links'}
        </button>
        {feedback && <span className="text-sm text-slate-600">{feedback}</span>}
      </div>
    </form>
  );
}

SocialLinksCard.propTypes = {
  userId: PropTypes.string,
  links: PropTypes.object,
  onInitialized: PropTypes.func,
  onSave: PropTypes.func
};

SocialLinksCard.defaultProps = {
  userId: null,
  links: null,
  onInitialized: null,
  onSave: null
};

export default SocialLinksCard;
