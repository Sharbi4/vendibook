import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Settings2, 
  BadgeCheck, 
  ClipboardCheck, 
  Wallet,
  DollarSign,
  Shield,
  Calendar,
  TrendingUp
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

const STEPS = [
  {
    number: '01',
    label: 'List what you host',
    headline: 'Add Your Assets',
    icon: PlusCircle,
    body: "Create a host profile and list every asset you'd like to rent: food trucks, trailers, carts, ghost kitchens, commissary spaces, parking pads, or event-ready locations. One account, unlimited listings.",
  },
  {
    number: '02',
    label: 'Set pricing and availability',
    headline: 'You Control the Terms',
    icon: Settings2,
    body: "Choose daily, weekly, or monthly rates. Block dates for maintenance or personal use. Set house rules—cleaning, mileage limits, power usage—and require documents like insurance or permits from renters.",
  },
  {
    number: '03',
    label: 'Get verified and stand out',
    headline: 'Build Your Reputation',
    icon: BadgeCheck,
    body: "Complete ID and business verification. Add walkthrough photos and descriptions. Earn badges for fast responses, great reviews, and repeat bookings—hosts with badges get 3x more inquiries.",
  },
  {
    number: '04',
    label: 'Review booking requests',
    headline: 'Choose Your Renters',
    icon: ClipboardCheck,
    body: "See each renter's profile, experience level, and ratings. Review their concept, dates, and target locations. Approve, decline, or ask follow-up questions—all through in-app messaging.",
  },
  {
    number: '05',
    label: 'Handover and get paid',
    headline: 'Seamless Operations',
    icon: Wallet,
    body: "Use in-app checklists and photo logs for check-in and check-out. Track equipment condition, keys, and usage. Payments are processed by Vendibook and released on your schedule—no chasing invoices.",
  },
];

const WHY_POINTS = [
  {
    icon: DollarSign,
    text: 'Turn idle trucks, kitchens, and spaces into reliable monthly income.',
  },
  {
    icon: Shield,
    text: 'Built-in renter screening and contracts reduce your risk exposure.',
  },
  {
    icon: Calendar,
    text: 'One calendar view shows all upcoming bookings across every asset.',
  },
  {
    icon: TrendingUp,
    text: 'Analytics show your earnings, occupancy rate, and top-performing listings.',
  },
];

export default function HowItWorksHostPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#FF5124] blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            How Vendibook Works for Hosts
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Turn Your Idle Food Assets Into Reliable Income
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            List your vehicle, kitchen, or event space. Control when it's available. Get paid securely while Vendibook handles bookings, screening, and paperwork.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-[#FF5124] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-xl"
            >
              Start Hosting
            </button>
            <button
              type="button"
              onClick={() => navigate('/listings')}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
            >
              See What Hosts Earn
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              From Idle to Income in Five Steps
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Whether you have one truck or ten kitchens, our tools make hosting simple.
            </p>
          </div>

          {/* Horizontal cards on desktop, vertical on mobile */}
          <div className="grid gap-8 lg:grid-cols-5">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg"
              >
                {/* Connecting line (desktop) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-emerald-200 to-transparent lg:block" />
                )}
                
                {/* Step number */}
                <div className="mb-4 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    Step {step.number}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <step.icon className="h-6 w-6 text-emerald-600" />
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
              Why Hosts Choose Vendibook
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {WHY_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <point.icon className="h-5 w-5 text-emerald-600" />
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
      <section className="bg-emerald-600 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Your Assets Are Waiting to Earn
          </h2>
          <p className="mb-8 text-white/90">
            Join hundreds of hosts already earning passive income on Vendibook.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-emerald-600 shadow-lg transition-all hover:bg-white/95"
            >
              Create Your First Listing
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border-2 border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Talk to a Host Advisor
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
