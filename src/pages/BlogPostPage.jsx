import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Share2, Bookmark, Twitter, Facebook, Linkedin, ArrowRight, ExternalLink } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { BLOG_POSTS, getBlogPost } from '../data/blogPosts.js';

function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug) || BLOG_POSTS[0];
  const morePosts = BLOG_POSTS.filter((entry) => entry.slug !== post.slug).slice(0, 3);
  const sections = post.body.split('\n\n');

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <AppLayout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#FF5124] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          
          <div className="mt-6 space-y-4">
            <span className="inline-flex items-center rounded-full bg-[#FF5124]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#FF5124]">
              {post.tag}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="text-lg text-slate-600">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                8 min read
              </span>
            </div>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* YouTube Video */}
        {post.youtubeUrl && (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-100">
            <div className="aspect-video w-full bg-slate-900">
              <iframe
                src={getYouTubeEmbedUrl(post.youtubeUrl)}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none">
          <div className="space-y-6 text-lg leading-relaxed text-slate-700">
            {sections.map((paragraph, index) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={index} className="mt-10 text-2xl font-bold text-slate-900">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              if (paragraph.match(/^\d+\./)) {
                const steps = paragraph.split('\n');
                return (
                  <ol key={index} className="ml-6 space-y-3 list-decimal marker:text-[#FF5124] marker:font-semibold">
                    {steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="text-slate-700 pl-2">
                        {step.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={index} className="text-slate-700">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>

        {/* Resources */}
        {post.resources && post.resources.length > 0 && (
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/30 p-6 ring-1 ring-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Helpful Resources</h3>
            <p className="mt-1 text-sm text-slate-600">Tools and links mentioned in this article</p>
            <ul className="mt-4 space-y-3">
              {post.resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-[#FF5124]/20"
                  >
                    <span className="font-medium text-slate-900 group-hover:text-[#FF5124]">
                      {resource.name}
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-[#FF5124]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {post.keywords && post.keywords.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-500">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-[#FF5124]/10 hover:text-[#FF5124] transition-colors cursor-pointer"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-6">
          <div>
            <p className="font-semibold text-slate-900">Share this article</p>
            <p className="text-sm text-slate-600">Help others discover this content</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-[#1DA1F2] hover:text-white hover:ring-[#1DA1F2]">
              <Twitter className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-[#1877F2] hover:text-white hover:ring-[#1877F2]">
              <Facebook className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-[#0A66C2] hover:text-white hover:ring-[#0A66C2]">
              <Linkedin className="h-4 w-4" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition-all hover:bg-[#FF5124] hover:text-white hover:ring-[#FF5124]">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>

      {/* More Articles */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">More Articles</h2>
            <Link
              to="/blog"
              className="flex items-center gap-1 text-sm font-semibold text-[#FF5124] hover:text-[#E5481F]"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {morePosts.map((entry) => (
              <Link
                key={entry.slug}
                to={`/blog/${entry.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {entry.imageUrl && (
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={entry.imageUrl}
                      alt={entry.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#FF5124]">
                    {entry.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-[#FF5124] transition-colors">
                    {entry.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {entry.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default BlogPostPage;
