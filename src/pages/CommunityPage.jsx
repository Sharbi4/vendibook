import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Megaphone, CalendarDays, Sparkles, MapPin, MessageCircle, HeartHandshake } from 'lucide-react';
import PageShell from '../components/PageShell';

const motto =
  "Vendibook keeps every mobile business in motion — no empty lots, no idle gear, and no dream left parked.";

const spotlight = [
  {
    title: 'Vendor Lounge',
    description: 'Ask questions, swap advice, and stay inspired by fellow food truckers and mobile pros.',
    icon: Users,
    link: '/messages'
  },
  {
    title: 'Partnerships',
    description: 'Find event planners, commissaries, and suppliers ready to team up for your next route.',
    icon: HeartHandshake,
    link: '/listings'
  },
  {
    title: 'Product Ideas',
    description: 'Share feedback on new Vendibook tools so we can build the marketplace you need.',
    icon: Sparkles,
    link: '/notifications'
  }
];

const meetups = [
  {
    name: 'Weekly Fleet Huddle',
    location: 'Phoenix, AZ',
    time: 'Tuesdays · 6pm',
    theme: 'Routes, permits, and booking strategy'
  },
  {
    name: 'Host Happy Hour',
    location: 'Tucson, AZ',
    time: 'Fridays · 5pm',
    theme: 'Lot owners and food truck operators connect'
  }
];

const threads = [
  {
    title: 'Best prep workflows for double bookings?',
    replies: 24,
    tag: 'Operations'
  },
  {
    title: 'Favorite commissary kitchens for late-night prep',
    replies: 18,
    tag: 'Locations'
  },
  {
    title: 'Menu testing ideas for fall festivals',
    replies: 12,
    tag: 'Growth'
  }
];

function CommunityPage() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="Community"
      subtitle={`${motto} Jump into the conversation and help shape every corner of Vendibook.`}
      action={{
        label: 'Start a thread',
        icon: MessageCircle,
        onClick: () => navigate('/messages'),
        variant: 'primary'
      }}
    >
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-orange-500" />
              <p className="text-sm font-medium text-gray-700">Community pulse</p>
            </div>
            <p className="mt-4 text-xl font-semibold text-gray-900">
              "{motto}" is our promise — a marketplace where every operator, host, and vendor gets seen.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Share wins, troubleshoot roadblocks, and keep deals moving. The more you post, the more Vendibook
              can prioritize the features you need next.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Trending threads</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                View inbox
              </button>
            </div>
            <div className="space-y-3">
              {threads.map((thread) => (
                <div
                  key={thread.title}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{thread.title}</p>
                    <p className="text-sm text-gray-600">{thread.tag}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {thread.replies} replies
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Meetups & office hours</h3>
            </div>
            <div className="space-y-3">
              {meetups.map((event) => (
                <div key={event.name} className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="font-semibold text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-600">{event.location} · {event.time}</p>
                  <p className="text-sm text-gray-500">{event.theme}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Save my spot
            </button>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Spotlight</h3>
            </div>
            <div className="space-y-3">
              {spotlight.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.link)}
                  className="flex w-full items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left hover:border-blue-200"
                >
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default CommunityPage;
