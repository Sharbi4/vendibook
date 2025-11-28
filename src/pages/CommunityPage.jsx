import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  MessageCircle, 
  Clock, 
  ChevronRight, 
  Calendar, 
  BookOpen, 
  Heart, 
  Lightbulb, 
  Store, 
  Star, 
  Search,
  Navigation,
  Utensils,
  Moon,
  Sparkles,
  Quote,
  ArrowRight,
  Plus
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

// ============================================================================
// SAMPLE DATA - Community Threads
// ============================================================================
const COMMUNITY_THREADS = [
  {
    id: 1,
    title: 'Tips for your first farmers market booth setup?',
    snippet: "I'm setting up at my first farmers market next weekend and feeling nervous. Any tips for table layout, signage, or engaging with customers?",
    author: 'Maria G.',
    authorType: 'vendor',
    replies: 47,
    lastActivity: '2 hours ago',
    category: 'Tips & Tricks'
  },
  {
    id: 2,
    title: 'Best pop-up locations in downtown Phoenix?',
    snippet: 'Looking for high-traffic pop-up spots in downtown Phoenix for my handmade jewelry business. Any recommendations from experienced vendors?',
    author: 'James L.',
    authorType: 'vendor',
    replies: 32,
    lastActivity: '5 hours ago',
    category: 'Vendors'
  },
  {
    id: 3,
    title: 'How do you handle weather changes at outdoor markets?',
    snippet: "Last weekend's sudden rain ruined some of my inventory. What are your go-to strategies for protecting products at outdoor events?",
    author: 'Sarah K.',
    authorType: 'vendor',
    replies: 28,
    lastActivity: '1 day ago',
    category: 'Tips & Tricks'
  },
  {
    id: 4,
    title: 'Looking for vendors for our monthly night market',
    snippet: "We're organizing a new night market in Tempe starting in January. Looking for food vendors, artisans, and live performers.",
    author: 'Tempe Night Market',
    authorType: 'organizer',
    replies: 56,
    lastActivity: '3 hours ago',
    category: 'Organizers'
  },
  {
    id: 5,
    title: 'Pricing strategies that actually work',
    snippet: "After 3 years of selling at markets, here's what I learned about pricing handmade goods. Would love to hear your experiences too.",
    author: 'Elena R.',
    authorType: 'vendor',
    replies: 89,
    lastActivity: '6 hours ago',
    category: 'Tips & Tricks'
  }
];

// ============================================================================
// SAMPLE DATA - Nearby Markets
// ============================================================================
const NEARBY_MARKETS = [
  {
    id: 1,
    name: 'Old Town Scottsdale Farmers Market',
    type: 'Farmers Market',
    typeIcon: Utensils,
    location: 'Old Town, Scottsdale',
    nextEvent: 'Every Saturday, 8am–1pm',
    tags: ['Fresh Produce', 'Local Artisans', 'Family-friendly'],
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Phoenix Night Market',
    type: 'Night Market',
    typeIcon: Moon,
    location: 'Downtown Phoenix',
    nextEvent: 'Dec 14, 6pm–11pm',
    tags: ['Food Trucks', 'Live Music', 'Late Night'],
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Tempe Pop-Up Collective',
    type: 'Pop-up Market',
    typeIcon: Store,
    location: 'Mill Avenue, Tempe',
    nextEvent: 'Dec 21, 10am–4pm',
    tags: ['Local Makers', 'Handmade Goods', 'Pet-friendly'],
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&h=300&fit=crop'
  }
];

// ============================================================================
// SAMPLE DATA - Blog Posts
// ============================================================================
const BLOG_POSTS = {
  featured: {
    id: 1,
    title: 'How to Become a Vendor: Your Complete Guide to Getting Started',
    excerpt: 'Everything you need to know about launching your vendor business — from permits and pricing to choosing your first market. We break down the essential steps to turn your passion into a thriving market booth.',
    readTime: '8 min read',
    category: 'Getting Started',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'
  },
  suggested: [
    {
      id: 2,
      title: "First Time at a Farmers Market? Here's What to Expect",
      excerpt: 'From application to setup day — a step-by-step walkthrough for first-time farmers market vendors.',
      readTime: '5 min read',
      category: 'Farmers Markets'
    },
    {
      id: 3,
      title: 'Pop-Up Markets vs. Farmers Markets: Which is Right for You?',
      excerpt: 'Compare the pros, cons, and best practices for each market type to find your perfect fit.',
      readTime: '6 min read',
      category: 'Strategy'
    },
    {
      id: 4,
      title: 'Why the Vendibook Community is Different',
      excerpt: 'How our vendor-focused community helps you grow, connect, and succeed at local markets.',
      readTime: '4 min read',
      category: 'Community'
    }
  ]
};

// ============================================================================
// SAMPLE DATA - Community Value Pillars
// ============================================================================
const VALUE_PILLARS = [
  {
    icon: Heart,
    title: 'Local Connections',
    description: 'Connect with vendors, organizers, and shoppers in your neighborhood. Build relationships that last beyond the market.'
  },
  {
    icon: Lightbulb,
    title: 'Vendor Education',
    description: 'Learn from experienced vendors through our guides, community threads, and weekly tips shared by the community.'
  },
  {
    icon: Calendar,
    title: 'Real-time Event Discovery',
    description: 'Never miss a market. Find farmers markets, pop-ups, and night markets happening near you this week.'
  },
  {
    icon: Users,
    title: 'Supportive Community',
    description: 'Ask questions, share wins, get advice. Our community celebrates every step of your vendor journey.'
  }
];

// ============================================================================
// SAMPLE DATA - Testimonials
// ============================================================================
const TESTIMONIALS = [
  {
    quote: "Vendibook helped me find my first farmers market booth. The community tips on pricing and display saved me weeks of trial and error.",
    author: 'Maria Gonzalez',
    role: 'Handmade Soap Vendor',
    location: 'Phoenix, AZ'
  },
  {
    quote: "As a market organizer, I love how easy it is to connect with quality vendors. The community here actually cares about local business.",
    author: 'David Chen',
    role: 'Night Market Organizer',
    location: 'Tempe, AZ'
  },
  {
    quote: "The learning hub articles got me from idea to my first $500 market day in just three weeks. This community is incredibly generous with knowledge.",
    author: 'Ashley Williams',
    role: 'Jewelry Artisan',
    location: 'Scottsdale, AZ'
  }
];

// Thread filter tabs
const THREAD_FILTERS = ['All', 'Vendors', 'Organizers', 'Tips & Tricks'];

function CommunityPage() {
  const navigate = useNavigate();
  const [activeThreadFilter, setActiveThreadFilter] = useState('All');
  const [locationInput, setLocationInput] = useState('');

  // Filter threads based on active filter
  const filteredThreads = activeThreadFilter === 'All' 
    ? COMMUNITY_THREADS 
    : COMMUNITY_THREADS.filter(t => t.category === activeThreadFilter);

  return (
    <AppLayout contentClassName="pt-8 pb-0">
      {/* ====================================================================
          SECTION 1: Hero / Intro Bar
          ==================================================================== */}
      <section className="community-hero mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF5124] via-[#FF6B3D] to-[#FF8F5A] px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-white/80">Vendibook Community</p>
              <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-[42px]">
                Where local vendors, markets, and makers connect and grow together
              </h1>
              <p className="text-base text-white/90 sm:text-lg">
                Join thousands of vendors discovering markets, sharing tips, and building thriving local businesses. Your next opportunity is one conversation away.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#FF5124] shadow-lg transition hover:bg-white/95 hover:shadow-xl"
              >
                <Users className="h-4 w-4" />
                Join the Community
              </button>
              <button
                type="button"
                onClick={() => navigate('/host/onboarding')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/20"
              >
                <Store className="h-4 w-4" />
                Become a Vendor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: Recent Community Threads
          ==================================================================== */}
      <section className="community-threads mb-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Community Threads</h2>
            <p className="mt-1 text-sm text-slate-600">Join the conversation with vendors and organizers</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E5481F]"
          >
            <Plus className="h-4 w-4" />
            Start a Thread
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {THREAD_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveThreadFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeThreadFilter === filter
                  ? 'bg-[#FF5124] text-white shadow-sm'
                  : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Threads list */}
        <div className="space-y-3">
          {filteredThreads.slice(0, 5).map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => navigate('/messages')}
              className="group flex w-full flex-col gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-[#FF5124]/30 hover:shadow-md sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    thread.authorType === 'organizer' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {thread.authorType}
                  </span>
                  <span className="text-xs text-slate-500">{thread.category}</span>
                </div>
                <h3 className="mb-1 text-[15px] font-semibold text-slate-900 group-hover:text-[#FF5124] transition-colors">
                  {thread.title}
                </h3>
                <p className="line-clamp-2 text-sm text-slate-600">{thread.snippet}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {thread.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {thread.replies} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {thread.lastActivity}
                  </span>
                </div>
              </div>
              <ChevronRight className="hidden h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#FF5124] sm:block" />
            </button>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => navigate('/messages')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF5124] hover:underline"
          >
            View all threads
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: Nearby Markets
          ==================================================================== */}
      <section className="nearby-markets mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Discover Markets Near You</h2>
          <p className="mt-1 text-sm text-slate-600">Find farmers markets, pop-ups, and night markets in your area</p>
        </div>

        {/* Location input */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter your city or zip code..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Navigation className="h-4 w-4" />
            Use my location
          </button>
        </div>

        {/* Markets grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {NEARBY_MARKETS.map((market) => (
            <div
              key={market.id}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-lg hover:ring-[#FF5124]/20"
              onClick={() => navigate('/listings')}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={market.image}
                  alt={market.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                    market.type === 'Night Market' 
                      ? 'bg-indigo-500 text-white' 
                      : market.type === 'Pop-up Market'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    <market.typeIcon className="h-3.5 w-3.5" />
                    {market.type}
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-5">
                <h3 className="mb-1 text-[15px] font-semibold text-slate-900 group-hover:text-[#FF5124] transition-colors">
                  {market.name}
                </h3>
                <p className="mb-2 flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {market.location}
                </p>
                <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-[#FF5124]">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {market.nextEvent}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {market.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="inline-flex items-center gap-2 rounded-full border border-[#FF5124] bg-white px-6 py-3 text-sm font-semibold text-[#FF5124] transition hover:bg-[#FF5124] hover:text-white"
          >
            Explore all markets near you
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: Featured Blog / Learning Hub
          ==================================================================== */}
      <section className="community-blog mb-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Vendor Learning Hub</h2>
            <p className="mt-1 text-sm text-slate-600">Guides, tips, and resources to grow your vendor business</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF5124] hover:underline"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Featured post */}
          <div
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-lg hover:ring-[#FF5124]/20"
            onClick={() => navigate('/blog')}
          >
            <div className="relative aspect-[2/1] overflow-hidden">
              <img
                src={BLOG_POSTS.featured.image}
                alt={BLOG_POSTS.featured.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {BLOG_POSTS.featured.category}
                </span>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  {BLOG_POSTS.featured.title}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-3 text-sm text-slate-600 leading-relaxed">{BLOG_POSTS.featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  {BLOG_POSTS.featured.readTime}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF5124] group-hover:underline">
                  Read more
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Suggested posts */}
          <div className="space-y-4">
            {BLOG_POSTS.suggested.map((post) => (
              <div
                key={post.id}
                className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:ring-[#FF5124]/30 hover:shadow-md"
                onClick={() => navigate('/blog')}
              >
                <span className="mb-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-[#FF5124]">
                  {post.category}
                </span>
                <h4 className="mb-2 text-[15px] font-semibold text-slate-900 group-hover:text-[#FF5124] transition-colors leading-snug">
                  {post.title}
                </h4>
                <p className="mb-3 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    {post.readTime}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#FF5124]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: Why the Vendibook Community is Special
          ==================================================================== */}
      <section className="community-highlight mb-12">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#FF5124]" />
            <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Why the Vendibook Community is Special
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-base text-slate-400">
              We're not just a marketplace — we're a community of passionate vendors, market organizers, and local supporters helping each other succeed.
            </p>

            {/* Value pillars grid */}
            <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUE_PILLARS.map((pillar, index) => (
                <div key={index} className="rounded-2xl bg-white/5 p-6 text-left backdrop-blur ring-1 ring-white/10">
                  <div className="mb-4 inline-flex rounded-xl bg-[#FF5124]/20 p-3">
                    <pillar.icon className="h-6 w-6 text-[#FF5124]" />
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-white">{pillar.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mb-10">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">What our community says</p>
              <div className="grid gap-6 sm:grid-cols-3">
                {TESTIMONIALS.map((testimonial, index) => (
                  <div key={index} className="rounded-2xl bg-white/5 p-6 text-left ring-1 ring-white/10">
                    <Quote className="mb-3 h-6 w-6 text-[#FF5124]/60" />
                    <p className="mb-4 text-sm text-slate-300 leading-relaxed italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="text-sm font-semibold text-white">{testimonial.author}</p>
                      <p className="text-xs text-slate-500">{testimonial.role} · {testimonial.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#E5481F] hover:shadow-xl"
              >
                <Users className="h-5 w-5" />
                Join the Vendibook Community
              </button>
              <button
                type="button"
                onClick={() => navigate('/host/onboarding')}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
              >
                Create your vendor profile
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: Footer CTA Strip
          ==================================================================== */}
      <section className="community-footer-cta -mx-4 mb-0 bg-gradient-to-r from-[#FF5124] to-[#FF6B3D] px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">Ready to grow your vendor business?</h3>
            <p className="mt-1 text-sm text-white/80">Join the community, discover markets, or create your vendor profile today.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#FF5124] shadow-md transition hover:bg-white/95"
            >
              Sign Up Free
            </button>
            <button
              type="button"
              onClick={() => navigate('/listings')}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-white/50 hover:bg-white/20"
            >
              Explore Markets
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default CommunityPage;
