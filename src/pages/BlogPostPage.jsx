import { Link, useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout.jsx';
import { BLOG_POSTS, getBlogPost } from '../data/blogPosts.js';

function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug) || BLOG_POSTS[0];
  const morePosts = BLOG_POSTS.filter((entry) => entry.slug !== post.slug);
  const sections = post.body.split('\n\n');

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

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

        {post.imageUrl && (
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {post.youtubeUrl && (
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <div className="aspect-video w-full">
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

        <div className="space-y-4 text-lg leading-relaxed text-slate-700">
          {sections.map((paragraph, index) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return (
                <h3 key={index} className="mt-8 text-xl font-bold text-slate-900">
                  {paragraph.replace(/\*\*/g, '')}
                </h3>
              );
            }
            if (paragraph.match(/^\d+\./)) {
              const steps = paragraph.split('\n');
              return (
                <ol key={index} className="ml-6 space-y-2 list-decimal text-base">
                  {steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-slate-700">
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

        {post.resources && post.resources.length > 0 && (
          <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-100">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Helpful Resources</h3>
            <ul className="space-y-3">
              {post.resources.map((resource, index) => (
                <li key={index}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {post.keywords && post.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((keyword, index) => (
              <span
                key={index}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
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
