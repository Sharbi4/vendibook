import { useNavigate } from 'react-router-dom';
import { 
  CalendarPlus, 
  LayoutGrid, 
  Users, 
  CreditCard, 
  ClipboardCheck,
  Zap,
  FileSpreadsheet,
  BadgeCheck,
  Repeat
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

const STEPS = [
  {
    number: '01',
    label: 'Create your event page',
    headline: 'Set Up Your Market',
    icon: CalendarPlus,
    body: "Add your market name, dates, recurring schedule, and location. Define vendor categories—food trucks, trailers, tents, coffee, dessert. Include photos, foot-traffic stats, and your brand story.",
  },
  {
    number: '02',
    label: 'Configure slots and requirements',
    headline: 'Design Your Layout',
    icon: LayoutGrid,
    body: "Set how many vendors per category and date. Define booth types (with/without power), fees, deposits, and payment schedules. Add requirements: permits, insurance, cuisine limits, setup times.",
  },
  {
    number: '03',
    label: 'Invite or open applications',
    headline: 'Fill Your Spots',
    icon: Users,
    body: "Share your event link with your existing vendor network. Let new vendors from Vendibook's marketplace apply. Review menus, photos, ratings, and social proof in a consistent format.",
  },
  {
    number: '04',
    label: 'Approve and collect payments',
    headline: 'Lock In Your Lineup',
    icon: CreditCard,
    body: "Approve or decline applications with one click. Assign specific spots on a simple map view. Collect booth fees through Vendibook—automatic invoices, receipts, and refund policies included.",
  },
  {
    number: '05',
    label: 'Run smooth event days',
    headline: 'Execute Flawlessly',
    icon: ClipboardCheck,
    body: "Track vendor check-ins and check-outs. Send last-minute updates about weather or layout changes. Log attendance for compliance and future planning. Repeat for your next market.",
  },
];

const WHY_POINTS = [
  {
    icon: Zap,
    text: 'Replace messy email threads, DMs, and spreadsheets with one professional system.',
  },
  {
    icon: BadgeCheck,
    text: 'Attract new, pre-verified vendors who are ready to operate and show up prepared.',
  },
  {
    icon: FileSpreadsheet,
    text: 'Automatic invoicing, receipts, and payment tracking—no more chasing vendors.',
  },
  {
    icon: Repeat,
    text: 'Duplicate events easily. Vendors remember you and apply again next season.',
  },
];

export default function HowItWorksMarketPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-slate-900 px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-violet-400 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#FF5124] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-violet-300">
            How Vendibook Works for Markets
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Fill Your Market With the Right Vendors—Without the Chaos
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Create an event on Vendibook, collect applications, fill every slot with vetted vendors, and manage payments and logistics in one dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-[#FF5124] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-xl"
            >
              Create Your Event
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
            >
              See Market Examples
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              From Empty Lot to Full Lineup in Five Steps
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Whether you run a weekly farmers market or a one-night pop-up, we've got you covered.
            </p>
          </div>

          {/* Card grid - 3+2 layout */}
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.slice(0, 3).map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-lg"
              >
                {/* Step badge */}
                <div className="mb-4 inline-flex items-center rounded-full bg-violet-600 px-3 py-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Step {step.number}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  <step.icon className="h-6 w-6 text-violet-600" />
                </div>
                
                {/* Content */}
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {step.headline}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
          
          {/* Second row - 2 cards centered */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 md:mx-auto md:max-w-2xl lg:max-w-none lg:grid-cols-2 lg:px-[16.666%]">
            {STEPS.slice(3).map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-violet-200 hover:shadow-lg"
              >
                {/* Step badge */}
                <div className="mb-4 inline-flex items-center rounded-full bg-violet-600 px-3 py-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Step {step.number}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  <step.icon className="h-6 w-6 text-violet-600" />
                </div>
                
                {/* Content */}
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {step.headline}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Why Market Organizers Choose Vendibook
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {WHY_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                  <point.icon className="h-5 w-5 text-violet-600" />
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
      <section className="bg-violet-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Your Next Market Deserves Better Tools
          </h2>
          <p className="mb-8 text-white/90">
            Stop juggling spreadsheets. Start running events that vendors love coming back to.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-violet-600 shadow-lg transition-all hover:bg-white/95"
            >
              Create Your First Event
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
