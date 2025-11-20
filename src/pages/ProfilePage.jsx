import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle,
  MapPin,
  Star,
  ShieldCheck,
  CalendarDays,
  Briefcase,
  Heart,
  MessageSquare
} from 'lucide-react';
import PageShell from '../components/PageShell';

const motto = 'Built for the go-getters of mobile commerce — your Vendibook profile keeps every opportunity connected.';

const bookings = [
  {
    title: 'Weekend Coffee Cart',
    date: 'Aug 12-14',
    location: 'Downtown Phoenix, AZ',
    status: 'Confirmed'
  },
  {
    title: 'Food Truck Lot Residency',
    date: 'Sep 1-30',
    location: 'Tempe Arts District, AZ',
    status: 'Pending'
  }
];

function ProfilePage() {
  const navigate = useNavigate();

  return (
    <PageShell
      title="My Profile"
      subtitle={`${motto} Showcase your credibility, commitments, and community impact.`}
      action={{
        label: 'Edit profile',
        icon: MessageSquare,
        onClick: () => navigate('/messages'),
        variant: 'secondary'
      }}
    >
      <section className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <UserCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Alex Rivera</h2>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" /> Phoenix, AZ · Food truck operator & event collaborator
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-gray-800">
              <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Verified host</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Community contributor</span>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700">Early access</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Vendibook is home base for mobile entrepreneurs. Keep your bookings, partnerships, and community footprint in one place
            so every opportunity keeps moving.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-600">Reliability score</p>
            <div className="mt-2 flex items-baseline gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold text-gray-900">4.9</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-600">Bookings completed</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">86</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-600">Response time</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">under 15m</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-600">Community kudos</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">42</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Active commitments</h3>
              </div>
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.title} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.title}</p>
                      <p className="text-sm text-gray-600">{booking.date} · {booking.location}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                View all bookings
              </button>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Trust & safety</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  Business documentation on file
                </li>
                <li className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-500" />
                  Preferred partner invites enabled
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-gray-500" />
                  Featured in host recommendations
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Community impact</h3>
            </div>
            <p className="text-sm text-gray-600">
              Track how you elevate the Vendibook network through mentorship, fast responses, and meetup participation.
            </p>
            <div className="mt-4 space-y-3 text-sm font-semibold text-gray-900">
              <p>Mentor sessions hosted: <span className="text-blue-700">8</span></p>
              <p>Threads answered: <span className="text-blue-700">34</span></p>
              <p>Meetups attended: <span className="text-blue-700">5</span></p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Engage with the community
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default ProfilePage;
