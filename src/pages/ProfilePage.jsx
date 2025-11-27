import { useEffect, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import HostIdentityCard from '../components/profile/HostIdentityCard';
import HostProfileForm from '../components/profile/HostProfileForm';
import AccountServiceSettingsCard from '../components/profile/AccountServiceSettingsCard';
import SocialLinksCard from '../components/profile/SocialLinksCard';

const PROFILE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'host-profile', label: 'Host Profile' },
  { id: 'settings', label: 'Settings' }
];

const SUBTITLE = 'Manage your Vendibook presence, update your host identity, and keep settings in sync.';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userState, setUserState] = useState({ status: 'loading', data: null, error: '' });
  const [settingsState, setSettingsState] = useState({ status: 'idle', data: null });
  const [socialState, setSocialState] = useState({ status: 'idle', data: null });

  useEffect(() => {
    const fetchUser = async () => {
      setUserState({ status: 'loading', data: null, error: '' });
      try {
        const response = await fetch('/api/users/me?demo=true');
        const result = await response.json();
        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Unable to load profile');
        }
        setUserState({ status: 'success', data: result.data, error: '' });
      } catch (error) {
        console.error('Failed to fetch profile user', error);
        setUserState({ status: 'error', data: null, error: error.message || 'Unable to load profile' });
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userState.data?.id) return;

    const userId = userState.data.id;

    const fetchSettings = async () => {
      setSettingsState((prev) => ({ ...prev, status: 'loading' }));
      try {
        const response = await fetch(`/api/user-settings/me?userId=${userId}`);
        const result = await response.json();
        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Settings unavailable');
        }
        setSettingsState({ status: 'success', data: result.data });
      } catch (error) {
        console.warn('Settings fetch failed', error);
        setSettingsState({ status: 'error', data: null });
      }
    };

    const fetchSocial = async () => {
      setSocialState((prev) => ({ ...prev, status: 'loading' }));
      try {
        const response = await fetch(`/api/user-social-links/me?userId=${userId}`);
        const result = await response.json();
        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Links unavailable');
        }
        setSocialState({ status: 'success', data: result.data });
      } catch (error) {
        console.warn('Social links fetch failed', error);
        setSocialState({ status: 'error', data: null });
      }
    };

    fetchSettings();
    fetchSocial();
  }, [userState.data?.id]);

  const renderTabs = () => (
    <div className="flex flex-wrap gap-3">
      {PROFILE_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === tab.id
              ? 'bg-orange-500 text-white shadow-lg'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-orange-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const overviewPanel = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <HostIdentityCard host={userState.data} isLoading={userState.status === 'loading'} />
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Profile checklist</p>
        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
            Add a standout tagline so renters remember you.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
            Keep your service radius updated before big seasons.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
            Link socials for instant proof-of-work.
          </li>
        </ul>
        <p className="mt-4 text-xs text-slate-500">Host score snapshots and public badges are coming soon.</p>
      </div>
    </div>
  );

  const hostProfilePanel = (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <HostProfileForm
        host={userState.data}
        onSave={(updated) => setUserState({ status: 'success', data: updated, error: '' })}
      />
    </div>
  );

  const settingsPanel = (
    <div className="space-y-6">
      <AccountServiceSettingsCard
        userId={userState.data?.id || null}
        settings={settingsState.data}
        onInitialized={(record) => setSettingsState({ status: 'success', data: record })}
        onSave={(record) => setSettingsState({ status: 'success', data: record })}
      />
      <SocialLinksCard
        userId={userState.data?.id || null}
        links={socialState.data}
        onInitialized={(record) => setSocialState({ status: 'success', data: record })}
        onSave={(record) => setSocialState({ status: 'success', data: record })}
      />
    </div>
  );

  return (
    <PageShell title="Profile" subtitle={SUBTITLE} maxWidth="max-w-6xl">
      {renderTabs()}
      {userState.error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {userState.error}
        </div>
      ) : null}
      {activeTab === 'host-profile' && hostProfilePanel}
      {activeTab === 'settings' && settingsPanel}
      {activeTab === 'overview' && overviewPanel}
    </PageShell>
  );
}

export default ProfilePage;
