import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ListChecks, 
  Send, 
  CreditCard, 
  Key,
  Rocket,
  Shield,
  TrendingUp,
  Repeat
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

const STEPS = [
  {
    number: '01',
    label: 'Search by city, dates, and concept',
    headline: 'Find What You Need',
    icon: Search,
    body: "Enter your city and target dates. Filter by asset type—truck, trailer, cart, ghost kitchen, or commissary. Narrow by equipment (flat-top, fryer, espresso), budget, and style.",
  },
  {
    number: '02',
    label: 'Compare verified listings',
    headline: 'See the Full Picture',
    icon: ListChecks,
    body: "Every listing shows equipment lists, layout photos, health permit status, and local compliance notes. Check host rules, storage, parking options, and read reviews from other renters.",
  },
  {
    number: '03',
    label: 'Request to book',
    headline: 'Share Your Vision',
    icon: Send,
    body: "Tell the host about your food concept, expected hours, and target events. Choose your dates, add extras like commissary time or cleaning, and submit your request.",
  },
  {
    number: '04',
    label: 'Pay securely and confirm',
    headline: 'Lock It In',
    icon: CreditCard,
    body: "Once the host accepts, pay your deposit through Vendibook's secure checkout. Upload required documents—insurance, licenses—all in one place. You're confirmed.",
  },
  {
    number: '05',
    label: 'Pick up and start serving',
    headline: 'Launch Your Concept',
    icon: Key,
    body: "Follow check-in instructions, review the handoff checklist, and store all codes and rules in your dashboard. At the end of your term, complete a quick check-out—done.",
  },
];

const WHY_POINTS = [
  {
    icon: Rocket,
    text: 'Skip the six-figure build and 6-month wait. Launch your concept in weeks.',
  },
  {
    icon: Shield,
    text: 'Every host is verified. Every booking includes clear terms and protections.',
  },
  {
    icon: TrendingUp,
    text: 'Test your idea with real customers before committing to ownership.',
  },
  {
    icon: Repeat,
    text: 'Scale up or pivot easily—move between vehicles or kitchens as you grow.',
  },
];

export default function HowItWorksRenterPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FF5124] via-[#FF6B3D] to-[#FF8F5A] px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            How Vendibook Works for Renters
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start Your Mobile Food Business Without Buying the Truck
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Browse vetted rentals, book the perfect setup for your concept, and launch in weeks instead of years.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/listings?mode=rent')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
            >
              Browse Rentals
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border-2 border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              See Renter Stories
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              From Concept to Customers in Five Steps
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              No loans, no build-outs, no waiting. Just find, book, and go.
            </p>
          </div>

          {/* Timeline layout */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-[#FF5124] via-[#FF5124]/50 to-transparent md:block" />
            
            <div className="space-y-8">
              {STEPS.map((step, index) => (
                <div
                  key={step.number}
                  className="group relative flex flex-col gap-6 md:flex-row md:items-start"
                >
                  {/* Number circle */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FF5124] text-xl font-bold text-white shadow-lg shadow-[#FF5124]/25">
                    {step.number}
                  </div>
                  
                  {/* Card */}
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all group-hover:border-[#FF5124]/20 group-hover:shadow-lg sm:p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF5F2]">
                        <step.icon className="h-5 w-5 text-[#FF5124]" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#FF5124]">
                        {step.label}
                      </span>
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                      {step.headline}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-slate-600">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Why Renters Choose Vendibook
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {WHY_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF5F2]">
                  <point.icon className="h-5 w-5 text-[#FF5124]" />
                </div>
                <p className="text-[15px] leading-relaxed text-slate-700">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#FF5124] py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Your Food Concept Deserves a Chance
          </h2>
          <p className="mb-8 text-white/90">
            Find the perfect rental today and start serving customers this month.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/listings?mode=rent')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-white/95"
            >
              Find Your Rental
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border-2 border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Talk to Our Team
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
