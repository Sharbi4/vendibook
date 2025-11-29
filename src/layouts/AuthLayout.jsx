import React from 'react';
import { Sparkles, Store, Users, UtensilsCrossed, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';

const marketingBullets = [
  {
    title: 'Rent food trucks & trailers',
    copy: 'Weekend pop ups, residencies, and turnkey tour support.',
    icon: Truck
  },
  {
    title: 'Book Event Pros & catering',
    copy: 'Chefs, mixologists, and service teams built for experiences.',
    icon: Users
  },
  {
    title: 'Secure vendor market spaces',
    copy: 'Reserve high-traffic booths at festivals, fairs, and markets.',
    icon: Store
  },
  {
    title: 'List trucks & kitchens for sale',
    copy: 'Tap qualified buyers looking for ready-to-roll equipment.',
    icon: UtensilsCrossed
  }
];

const whyVendibook = [
  {
    icon: ShieldCheck,
    title: 'Trusted workflows',
    description: 'Modern booking, screening, and payout flows reduce risk.'
  },
  {
    icon: Truck,
    title: 'Built for mobility',
    description: 'Purpose-built for food trucks, trailers, and mobile kitchens.'
  },
  {
    icon: CheckCircle2,
    title: 'Flexible for all roles',
    description: 'Hosts, renters, and event operators each get tailored tools.'
  }
];

const heroImage = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80';

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Decorative sparkles */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="auth-orb auth-orb--one" />
        <div className="auth-orb auth-orb--two" />
        <div className="auth-orb auth-orb--three" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Auth panel */}
        <section className="flex w-full flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md sm:max-w-lg rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-lg">
            <div className="mb-8 flex items-center gap-3 text-orange-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200">Vendibook</p>
                <p className="text-sm text-orange-100/80">Marketplaces for mobile hospitality</p>
              </div>
            </div>
            {children}
          </div>
        </section>

        {/* Marketing panel */}
        <aside className="relative w-full lg:w-5/12 xl:w-1/2">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Colorful food truck event with guests ordering"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 via-slate-900/70 to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/70 to-transparent" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-12 text-white">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200">Get to know Vendibook</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                Where mobile business meets opportunity.
              </h2>
              <p className="mt-4 max-w-xl text-base text-slate-100/90">
                Vendibook gives entrepreneurs a single platform to rent premium equipment, book talent,
                and unlock vendor markets nationwide so every pop up feels curated and profitable.
              </p>

              <ul className="mt-8 space-y-4">
                {marketingBullets.map(({ title, copy, icon: Icon }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-orange-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="text-sm text-slate-100/80">{copy}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 rounded-2xl bg-slate-900/60 p-6 shadow-lg backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">Why Vendibook</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {whyVendibook.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <Icon className="h-5 w-5 text-orange-300" />
                    <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs text-slate-100/80">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
