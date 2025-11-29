import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Mail,
  Phone,
  HelpCircle,
  Truck,
  CreditCard,
  Shield,
  Calendar,
  Users,
  Settings,
  FileText,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: HelpCircle,
    description: 'New to Vendibook? Start here',
    articles: [
      { title: 'How to create an account', slug: 'create-account' },
      { title: 'Setting up your profile', slug: 'setup-profile' },
      { title: 'How to search for rentals', slug: 'search-rentals' },
      { title: 'Understanding listing types', slug: 'listing-types' },
      { title: 'First-time renter guide', slug: 'renter-guide' }
    ]
  },
  {
    id: 'rentals',
    title: 'Rentals & Bookings',
    icon: Truck,
    description: 'Everything about renting equipment',
    articles: [
      { title: 'How to book a rental', slug: 'book-rental' },
      { title: 'Understanding rental periods', slug: 'rental-periods' },
      { title: 'Pickup and delivery options', slug: 'pickup-delivery' },
      { title: 'Cancellation policy', slug: 'cancellation-policy' },
      { title: 'What to do at pickup', slug: 'pickup-checklist' }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Pricing',
    icon: CreditCard,
    description: 'Billing, refunds, and pricing',
    articles: [
      { title: 'Payment methods accepted', slug: 'payment-methods' },
      { title: 'How pricing works', slug: 'pricing-explained' },
      { title: 'Security deposits', slug: 'security-deposits' },
      { title: 'Refund process', slug: 'refund-process' },
      { title: 'Invoice and receipts', slug: 'invoices' }
    ]
  },
  {
    id: 'hosting',
    title: 'Hosting & Listing',
    icon: Calendar,
    description: 'For equipment owners and hosts',
    articles: [
      { title: 'How to become a host', slug: 'become-host' },
      { title: 'Creating your first listing', slug: 'create-listing' },
      { title: 'Setting your availability', slug: 'set-availability' },
      { title: 'Host payout schedule', slug: 'host-payouts' },
      { title: 'Managing booking requests', slug: 'manage-bookings' }
    ]
  },
  {
    id: 'safety',
    title: 'Trust & Safety',
    icon: Shield,
    description: 'Your security is our priority',
    articles: [
      { title: 'Verification process', slug: 'verification' },
      { title: 'Insurance coverage', slug: 'insurance' },
      { title: 'Reporting issues', slug: 'report-issues' },
      { title: 'Damage claims', slug: 'damage-claims' },
      { title: 'Community guidelines', slug: 'community-guidelines' }
    ]
  },
  {
    id: 'account',
    title: 'Account & Settings',
    icon: Settings,
    description: 'Manage your account',
    articles: [
      { title: 'Edit profile information', slug: 'edit-profile' },
      { title: 'Notification preferences', slug: 'notifications' },
      { title: 'Password and security', slug: 'password-security' },
      { title: 'Delete your account', slug: 'delete-account' },
      { title: 'Privacy settings', slug: 'privacy-settings' }
    ]
  }
];

const POPULAR_ARTICLES = [
  { title: 'How to book your first rental', category: 'Getting Started' },
  { title: 'Cancellation and refund policy', category: 'Payments' },
  { title: 'Setting up your host account', category: 'Hosting' },
  { title: 'What happens if equipment is damaged?', category: 'Safety' },
  { title: 'How are payouts processed?', category: 'Hosting' }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            Search our help center or browse topics below
          </p>
          
          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-base text-slate-800 placeholder:text-slate-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF5124]"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Popular Articles */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Popular Articles</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_ARTICLES.map((article, index) => (
              <Link
                key={index}
                to={`/help/article/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-[#FF5124]/40 hover:-translate-y-0.5"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-[#FF5124]">
                  {article.category}
                </span>
                <p className="mt-2 font-semibold text-slate-900 group-hover:text-[#FF5124] transition-colors">
                  {article.title}
                </p>
                <div className="mt-3 flex items-center gap-1 text-sm text-slate-500 group-hover:text-[#FF5124]">
                  Read article
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by Topic</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full p-5 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5124]/10">
                          <Icon className="h-6 w-6 text-[#FF5124]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{category.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{category.description}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                      <ul className="space-y-2">
                        {category.articles.map((article, index) => (
                          <li key={index}>
                            <Link
                              to={`/help/article/${article.slug}`}
                              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-white hover:text-[#FF5124] transition-colors"
                            >
                              {article.title}
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Options */}
        <section className="rounded-3xl bg-gradient-to-br from-slate-50 to-orange-50/30 p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Still need help?</h2>
            <p className="mt-2 text-slate-600">Our support team is here for you</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5124]/10">
                <MessageSquare className="h-7 w-7 text-[#FF5124]" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Live Chat</h3>
              <p className="mt-2 text-sm text-slate-600">Chat with our support team in real-time</p>
              <button className="mt-4 w-full rounded-full bg-[#FF5124] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]">
                Start Chat
              </button>
            </div>
            
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10">
                <Mail className="h-7 w-7 text-sky-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Email Support</h3>
              <p className="mt-2 text-sm text-slate-600">We typically respond within 24 hours</p>
              <Link
                to="/contact"
                className="mt-4 block w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Send Email
              </Link>
            </div>
            
            <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                <FileText className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">FAQs</h3>
              <p className="mt-2 text-sm text-slate-600">Find quick answers to common questions</p>
              <Link
                to="/faq"
                className="mt-4 block w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                View FAQs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
