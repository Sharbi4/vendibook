import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Tag, Search, ChevronRight, Play } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { BLOG_POSTS } from '../data/blogPosts.js';

function BlogIndexPage() {
  // Get featured post (first one) and remaining posts
  const featuredPost = BLOG_POSTS[0];
  const remainingPosts = BLOG_POSTS.slice(1);
  
  // Get unique tags for filter
  const allTags = [...new Set(BLOG_POSTS.map(post => post.tag))];
  
  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="mb-4 inline-flex items-center rounded-full bg-[#FF5124]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FF5124]">
              Vendibook Blog
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Tips, Stories & Insights
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Learn from successful food entrepreneurs. Get actionable guides, industry trends, and platform updates to grow your mobile food business.
            </p>
            
            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-base text-slate-800 placeholder:text-slate-400 shadow-sm transition-all focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
                />
              </div>
            </div>
            
            {/* Category Tags */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <button className="rounded-full bg-[#FF5124] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]">
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured Post */}
        <section className="mb-12">
          <Link
            to={`/blog/${featuredPost.slug}`}
            className="group relative block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-xl"
          >
            <div className="grid gap-0 lg:grid-cols-2">
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                {featuredPost.imageUrl && (
                  <img
                    src={featuredPost.imageUrl}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {featuredPost.youtubeUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-7 w-7 fill-[#FF5124] text-[#FF5124] ml-1" />
                    </div>
                  </div>
                )}
                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center rounded-full bg-[#FF5124] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                    Featured
                  </span>
                </div>
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <span className="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FF5124]">
                  {featuredPost.tag}
                </span>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-[#FF5124] lg:text-3xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-3 text-base text-slate-600 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {featuredPost.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    8 min read
                  </span>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#FF5124] group-hover:text-[#E5481F]">
                  Read article
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Article Grid */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Latest Articles</h2>
            <Link
              to="/blog"
              className="flex items-center gap-1 text-sm font-semibold text-[#FF5124] hover:text-[#E5481F]"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {remainingPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {post.youtubeUrl && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
                      <Play className="h-3 w-3 fill-white" />
                      Video
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#FF5124]">
                      {post.tag}
                    </span>
                    <span className="text-xs text-slate-400">{post.date}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2 transition-colors group-hover:text-[#FF5124]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#FF5124]">
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Newsletter CTA */}
        <section className="mt-16 rounded-3xl bg-gradient-to-br from-[#FF5124] to-[#FF8C00] p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Stay in the loop</h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/90">
            Get weekly tips, success stories, and exclusive insights delivered straight to your inbox.
          </p>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-full border-0 bg-white/20 px-5 py-3 text-base text-white placeholder:text-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-slate-50">
              Subscribe
            </button>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}

export default BlogIndexPage;
