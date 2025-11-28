import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';
import { BLOG_POSTS } from '../data/blogPosts.js';

function BlogIndexPage() {
  return (
    <AppLayout contentClassName="py-10">
      <div className="space-y-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Vendibook Blog</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Tips, success stories, and platform updates.</h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600">
            Follow along as we share the experiments, activation strategies, and host insights that keep the mobile economy moving.
          </p>
        </div>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              {post.imageUrl && (
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover transition hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
                    {post.tag}
                  </span>
                  <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
                  <p className="text-sm text-slate-500">{post.date}</p>
                  <p className="text-base text-slate-600">{post.excerpt}</p>
                  {post.youtubeUrl && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span className="font-medium">Includes video tutorial</span>
                    </div>
                  )}
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default BlogIndexPage;
