import { useNavigate } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  ImageIcon, 
  Heart, 
  MessageSquare, 
  Truck,
  Search,
  ShieldCheck,
  FileCheck,
  Zap
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

const STEPS = [
  {
    number: '01',
    label: 'Define your ideal setup',
    headline: 'Know What You Need',
    icon: SlidersHorizontal,
    body: "Choose your format: truck, trailer, cart, or turn-key business. Filter by equipment—fryers, flat-top, smoker, espresso, refrigeration. Set budget, age, mileage, and preferred regions.",
  },
  {
    number: '02',
    label: 'Explore vetted listings',
    headline: 'See the Real Details',
    icon: ImageIcon,
    body: "Every listing includes high-quality photos of exterior, interior, and kitchen layout. Review equipment lists, power specs, service windows, and—where available—revenue history and inspection docs.",
  },
  {
    number: '03',
    label: 'Shortlist and compare',
    headline: 'Find Your Favorites',
    icon: Heart,
    body: "Save listings to your favorites and compare them side by side. Request video walkthroughs or schedule in-person viewings. Ask questions through secure messaging—no phone number required.",
  },
  {
    number: '04',
    label: 'Make an offer with confidence',
    headline: 'Negotiate Securely',
    icon: MessageSquare,
    body: "Submit offers and counter-offers in a structured flow. Use optional escrow for payment protection. Access checklists for inspection and roadworthiness before you commit.",
  },
  {
    number: '05',
    label: 'Take delivery and launch',
    headline: 'Start Your Journey',
    icon: Truck,
    body: "Coordinate pickup or delivery with the seller. Store all documents, photos, and specs in your Vendibook account. Then use the marketplace to find commissaries and events for your first gig.",
  },
];

const WHY_POINTS = [
  {
    icon: Search,
    text: 'See only relevant, well-described units—not vague classifieds with missing info.',
  },
  {
    icon: ShieldCheck,
    text: 'Reduce risk with seller verification, uploaded documents, and optional escrow.',
  },
  {
    icon: FileCheck,
    text: "Built-in checklists help you inspect like a pro, even if it's your first truck.",
  },
  {
    icon: Zap,
    text: 'Go from idea to owner with clear next steps and ongoing marketplace support.',
  },
];

export default function HowItWorksBuyerPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-500 to-[#FF5124] px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            How Vendibook Works for Buyers
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find a Proven Food Truck Without Wasting Months Hunting
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90">
            Browse inspected, verified units. Talk directly with serious sellers. Close with secure tools and guidance from Vendibook.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/listings?mode=sale')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-white/95 hover:shadow-xl"
            >
              Browse Trucks for Sale
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border-2 border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Read Buyer Stories
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              From Search to Keys in Five Steps
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Skip the Craigslist headaches. Buy with confidence and support.
            </p>
          </div>

          {/* Alternating layout */}
          <div className="space-y-12">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className={`group flex flex-col gap-8 lg:flex-row lg:items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Visual side */}
                <div className="flex-1">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 lg:p-12">
                    <div className="flex items-center justify-center">
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg lg:h-32 lg:w-32">
                        <step.icon className="h-12 w-12 text-[#FF5124] lg:h-16 lg:w-16" />
                      </div>
                    </div>
                    {/* Step number overlay */}
                    <div className="absolute bottom-4 right-4 text-6xl font-bold text-[#FF5124]/10 lg:text-8xl">
                      {step.number}
                    </div>
                  </div>
                </div>
                
                {/* Content side */}
                <div className="flex-1">
                  <div className="mb-3 inline-flex items-center rounded-full bg-[#FF5124] px-3 py-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Step {step.number}
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-900">
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
      </section>

      {/* Why Section */}
      <section className="bg-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Why Buyers Choose Vendibook
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {WHY_POINTS.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <point.icon className="h-5 w-5 text-amber-600" />
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
            Your Perfect Truck Is Already Listed
          </h2>
          <p className="mb-8 text-white/90">
            Stop scrolling through junk. Start your search with quality, verified listings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/listings?mode=sale')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-white/95"
            >
              Find Your Truck
            </button>
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="rounded-full border-2 border-white/30 px-8 py-4 text-[15px] font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10"
            >
              Talk to a Buying Advisor
            </button>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
