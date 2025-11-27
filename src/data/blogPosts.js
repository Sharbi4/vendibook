export const BLOG_POSTS = [
  {
    slug: 'making-your-first-market-pop',
    title: 'Making Your First Market Pop',
    tag: 'Getting Started',
    date: 'November 12, 2025',
    excerpt: 'A step-by-step playbook for testing your menu, lining up permits, and launching a mobile concept without burning cash.',
    body: `Launching a mobile concept should feel exciting, not overwhelming. Start by defining the smallest possible menu you can execute with excellence. Focus on logistics — prep windows, parking, and power — just as much as the recipe. Vendibook hosts and Event Pros can help you pressure test each step so you never show up under-resourced.

Dial in your pricing using real demand data from similar listings. Once you know the numbers work, commit to a 4-week experimental sprint with clear success metrics: number of bookings, customer feedback, and profit per event. Iterate weekly and treat every market as intel for the next one.`,
  },
  {
    slug: 'host-insights-powering-2026',
    title: 'Host Insights Powering 2026',
    tag: 'Host Tips',
    date: 'November 3, 2025',
    excerpt: 'Top signals from Vendibook hosts — from delivery SLAs to bundled storage — that keep their lots fully booked.',
    body: `Hosts who win on Vendibook think like partners, not landlords. They publish transparent delivery SLAs, bundle storage or commissary add-ons, and respond within 2 hours to every inquiry. Small touches compound trust and boost ranking in search.

Heading into 2026, the most requested upgrades are shared cold storage, drop-off staging, and cross-promoted events. If you can offer even one of those perks, highlight it in your listing hero section and keep photos fresh.`,
  },
  {
    slug: 'event-pro-checklist',
    title: 'The Event Pro Checklist',
    tag: 'Event Pros',
    date: 'October 24, 2025',
    excerpt: 'Pre-event rituals from Vendibook Event Pros who stay rebooked all season long.',
    body: `Every five-star Event Pro we interviewed runs a tight pre-event ritual: confirm headcount 72 hours out, share a lightweight run-of-show, and align on electrical or access constraints before loading up the vehicle.

Use Vendibook messages to summarize any changes so the entire team stays aligned. After the event, send a quick recap with highlights and lessons. It keeps the conversation warm and generates instant referrals.`,
  }
];

export function getBlogPost(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
