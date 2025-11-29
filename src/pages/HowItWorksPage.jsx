import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  DollarSign,
  Shield,
  Clock,
  MapPin,
  Camera,
  FileText,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const TABS = [
  { id: 'renters', label: 'For Renters', icon: Users },
  { id: 'hosts', label: 'For Hosts', icon: Truck },
  { id: 'sellers', label: 'For Sellers', icon: DollarSign },
  { id: 'event-pro', label: 'For Event Pros', icon: Sparkles }
];

const CONTENT = {
  renters: {
    title: 'Rent food trucks, trailers & equipment',
    subtitle: 'Find and book the perfect mobile equipment for your next event or business venture',
    steps: [
      {
        number: '01',
        title: 'Search & Discover',
        description: 'Browse thousands of food trucks, trailers, and commercial kitchen equipment. Filter by location, price, dates, and amenities.',
        icon: Search
      },
      {
        number: '02',
        title: 'Request & Book',
        description: 'Send a booking request to the host. Discuss details through our secure messaging system and confirm your reservation.',
        icon: Calendar
      },
      {
        number: '03',
        title: 'Pay Securely',
        description: 'Complete your payment through our secure platform. Your funds are held safely until your rental begins.',
        icon: CreditCard
      },
      {
        number: '04',
        title: 'Pick Up & Go',
        description: 'Meet the host at the scheduled time, complete the handoff checklist, and start your rental adventure!',
        icon: Truck
      }
    ],
    benefits: [
      { title: 'Verified Listings', description: 'Every host and listing is verified for quality and safety' },
      { title: 'Secure Payments', description: 'Your payment is protected until your rental is complete' },
      { title: 'Insurance Included', description: 'Basic liability coverage included with every rental' },
      { title: '24/7 Support', description: 'Our team is here to help whenever you need assistance' }
    ],
    cta: { label: 'Start Browsing', href: '/rent' }
  },
  hosts: {
    title: 'Earn money by renting your equipment',
    subtitle: 'Turn your idle food truck, trailer, or kitchen into a revenue stream',
    steps: [
      {
        number: '01',
        title: 'Create Your Listing',
        description: 'Add photos, set your price, and describe your equipment. Our wizard makes it easy to create an attractive listing.',
        icon: Camera
      },
      {
        number: '02',
        title: 'Set Availability',
        description: 'Choose which days and times your equipment is available. Block dates when you need it for yourself.',
        icon: Calendar
      },
      {
        number: '03',
        title: 'Accept Bookings',
        description: 'Review incoming requests, chat with potential renters, and approve bookings that fit your schedule.',
        icon: CheckCircle
      },
      {
        number: '04',
        title: 'Get Paid',
        description: 'Receive your payout within 48 hours of rental completion. We handle all payment processing.',
        icon: DollarSign
      }
    ],
    benefits: [
      { title: 'Passive Income', description: 'Earn money when your equipment would otherwise sit idle' },
      { title: 'You\'re in Control', description: 'Set your own prices, rules, and availability' },
      { title: 'Protection Included', description: 'Host guarantee covers up to $1M in damages' },
      { title: 'Simple Dashboard', description: 'Manage everything from one easy-to-use dashboard' }
    ],
    cta: { label: 'Become a Host', href: '/become-host' }
  },
  sellers: {
    title: 'Sell your food truck or equipment',
    subtitle: 'Reach thousands of qualified buyers looking for mobile food equipment',
    steps: [
      {
        number: '01',
        title: 'List Your Item',
        description: 'Create a detailed listing with photos, specifications, and pricing. Highlight what makes your equipment special.',
        icon: FileText
      },
      {
        number: '02',
        title: 'Attract Buyers',
        description: 'Your listing reaches our network of food entrepreneurs, operators, and investors looking to buy.',
        icon: Users
      },
      {
        number: '03',
        title: 'Negotiate & Close',
        description: 'Communicate with interested buyers through our platform. Schedule viewings and negotiate terms.',
        icon: Calendar
      },
      {
        number: '04',
        title: 'Complete the Sale',
        description: 'Finalize the transaction with secure payment processing and transfer of ownership.',
        icon: CheckCircle
      }
    ],
    benefits: [
      { title: 'Targeted Audience', description: 'Reach buyers specifically looking for food equipment' },
      { title: 'No Upfront Fees', description: 'List for free, only pay when you sell' },
      { title: 'Financing Options', description: 'Offer buyer financing to increase sales' },
      { title: 'Inspection Support', description: 'Optional professional inspection services' }
    ],
    cta: { label: 'List for Sale', href: '/host/listings/create?type=sale' }
  },
  'event-pro': {
    title: 'Offer your event services',
    subtitle: 'Connect with hosts and event organizers looking for catering, DJ, photography, and more',
    steps: [
      {
        number: '01',
        title: 'Create Your Profile',
        description: 'Showcase your services, portfolio, and pricing. Add photos and videos of your past work.',
        icon: Sparkles
      },
      {
        number: '02',
        title: 'Set Your Packages',
        description: 'Define service packages with clear pricing. Offer different tiers to attract various budgets.',
        icon: FileText
      },
      {
        number: '03',
        title: 'Receive Inquiries',
        description: 'Get notified when event organizers are interested. Discuss event details and customize proposals.',
        icon: Calendar
      },
      {
        number: '04',
        title: 'Book & Deliver',
        description: 'Confirm bookings, show up, and deliver amazing experiences. Collect reviews to build your reputation.',
        icon: Star
      }
    ],
    benefits: [
      { title: 'Grow Your Client Base', description: 'Access events and clients you wouldn\'t find otherwise' },
      { title: 'Flexible Scheduling', description: 'Only accept jobs that fit your calendar' },
      { title: 'Build Your Brand', description: 'Collect reviews and ratings to stand out' },
      { title: 'Reliable Payments', description: 'Get paid on time, every time' }
    ],
    cta: { label: 'Join as Event Pro', href: '/host/listings/create?type=event-pro' }
  }
};

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('renters');
  const content = CONTENT[activeTab];

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
            How It Works
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The marketplace for<br />mobile food business
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Whether you're looking to rent equipment, list your assets, sell your truck, or offer event services—Vendibook connects you with the right people.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-3" aria-label="Tabs">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FF5124] text-white shadow-lg shadow-[#FF5124]/25'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{content.title}</h2>
          <p className="mt-4 text-lg text-slate-600">{content.subtitle}</p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 lg:grid-cols-4">
          {content.steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < content.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-[#FF5124] to-[#FF5124]/20" />
                )}
                
                <div className="relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5124] to-[#FF8C00] text-white shadow-lg shadow-[#FF5124]/25">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#FF5124]">
                    Step {step.number}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mt-20">
          <h3 className="text-center text-2xl font-bold text-slate-900 mb-10">Why choose Vendibook?</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/30 p-6 ring-1 ring-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5124]/10">
                  <CheckCircle className="h-5 w-5 text-[#FF5124]" />
                </div>
                <h4 className="mt-4 font-semibold text-slate-900">{benefit.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            to={content.cta.href}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-2xl hover:-translate-y-0.5"
          >
            {content.cta.label}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="mt-20 rounded-3xl bg-slate-900 p-8 sm:p-12">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <p className="text-4xl font-bold text-white">10,000+</p>
              <p className="mt-2 text-slate-400">Active listings</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">$5M+</p>
              <p className="mt-2 text-slate-400">Paid to hosts</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">4.9 ★</p>
              <p className="mt-2 text-slate-400">Average rating</p>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
