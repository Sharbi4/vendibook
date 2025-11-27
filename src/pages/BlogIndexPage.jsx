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

        <div className="grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="space-y-3">
                <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
                  {post.tag}
                </span>
                <h2 className="text-2xl font-semibold text-slate-900">{post.title}</h2>
                <p className="text-sm text-slate-500">{post.date}</p>
                <p className="text-base text-slate-600">{post.excerpt}</p>
              </div>
              <Link
                to={`/blog/${post.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Read more
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default BlogIndexPage;
