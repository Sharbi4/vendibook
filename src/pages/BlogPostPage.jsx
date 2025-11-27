import { Link, useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import { BLOG_POSTS, getBlogPost } from '../data/blogPosts.js';

function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug) || BLOG_POSTS[0];
  const morePosts = BLOG_POSTS.filter((entry) => entry.slug !== post.slug);
  const sections = post.body.split('\n\n');

  return (
    <AppLayout contentClassName="py-10">
      <article className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
            {post.tag}
          </span>
          <h1 className="text-4xl font-bold text-slate-900">{post.title}</h1>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">{post.date}</p>
        </div>
        <div className="space-y-4 text-lg text-slate-700">
          {sections.map((paragraph) => (
            <p key={paragraph.slice(0, 12)}>{paragraph}</p>
          ))}
        </div>
      </article>

      <section className="mx-auto mt-12 max-w-5xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">More articles</h2>
          <Link to="/blog" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Back to blog
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {morePosts.map((entry) => (
            <Link
              key={entry.slug}
              to={`/blog/${entry.slug}`}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-orange-200"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">{entry.tag}</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{entry.title}</p>
              <p className="mt-1 text-sm text-slate-600">{entry.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

export default BlogPostPage;
