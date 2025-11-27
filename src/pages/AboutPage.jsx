import AppLayout from '../layouts/AppLayout.jsx';

const HOW_IT_WORKS = [
  {
    title: 'Hosts',
    body: 'List lots, commissaries, and mobile-ready spaces with transparent pricing, delivery SLAs, and add-on services.'
  },
  {
    title: 'Event Pros',
    body: 'Book vetted chefs, baristas, and teams, then manage timelines and payouts inside Vendibook.'
  },
  {
    title: 'Sellers',
    body: 'Verify titles, share inspection docs, and sell trucks or equipment with escrow-ready workflows.'
  },
  {
    title: 'Vendors',
    body: 'Test concepts, pop into new cities, and keep revenue flowing without long leases or costly downtime.'
  }
];

function AboutPage() {
  return (
    <AppLayout contentClassName="py-10">
      <div className="space-y-10">
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">About Vendibook</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900">About Vendibook</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-600">
            We build software and services for the mobile economy so no operator wastes a weekend, no host leaves a lot empty, and no dream gets left parked.
          </p>
        </section>

        <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-300">Mission</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight">No empty lots, no idle gear, and no dream left parked.</h2>
          <p className="mt-4 text-base text-white/80">
            Vendibook orchestrates inventory, matchmaking, and payouts so every activation — from lone food cart to multi-city vendor market — moves quickly and transparently.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">Founder story</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Born from late-night commissary runs and too many idle trucks.</h2>
          <p className="mt-4 text-slate-600">
            Our founding team spent a decade helping independent operators juggle permits, prep kitchens, and pop-up schedules. We watched trucks sit unused because the right partner couldn’t be found in time. Vendibook exists to remove that friction with trusted data, curated hosts, and workflows that feel premium for both sides of the booking.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-500">How it works</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{item.title}</p>
                <p className="mt-2 text-base text-slate-700">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default AboutPage;
