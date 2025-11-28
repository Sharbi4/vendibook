import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Camera, 
  ShieldCheck, 
  MessageSquare, 
  Banknote,
  CheckCircle2,
  Users,
  Lock,
  TrendingUp
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout.jsx';

const STEPS = [
  {
    number: '01',
    label: 'Create your seller profile',
    headline: 'Set Up Your Account',
    icon: UserPlus,
    body: "Sign up with your email, add your business name and location, and tell us what you're selling—truck, trailer, cart, or full build. Link your socials so buyers can see your operation's story.",
  },
  {
    number: '02',
    label: 'Build a high-converting listing',
    headline: 'Showcase Your Asset',
    icon: Camera,
    body: "Upload clear photos of exterior, interior, and key equipment. Add specs like year, make, mileage, dimensions, and included permits. Set your price and share your story—why you're selling and who it's perfect for.",
  },
  {
    number: '03',
    label: 'Get verified and stand out',
    headline: 'Build Trust Instantly',
    icon: ShieldCheck,
    body: "Upload inspection reports, maintenance logs, or build receipts. Complete identity verification and earn a Verified badge that tells buyers you're serious and legit.",
  },
  {
    number: '04',
    label: 'Manage inquiries in one place',
    headline: 'Talk to Real Buyers',
    icon: MessageSquare,
    body: "Serious buyers contact you through secure messaging—no spam, no tire-kickers. Pre-screen by experience and timeline, answer questions, and negotiate offers directly on the platform.",
  },
  {
    number: '05',
    label: 'Close the sale securely',
    headline: 'Seal the Deal',
    icon: Banknote,
    body: "Use secure deposit handling and optional escrow. Access bill of sale templates, coordinate inspections and pickup, then mark it sold and download records for your books.",
  },
];

const WHY_POINTS = [
  {
    icon: Users,
    text: 'Reach a focused audience of motivated food entrepreneurs actively looking to buy.',
  },
  {
    icon: Lock,
    text: 'Fewer tire-kickers—our verification filters out casual browsers and scammers.',
  },
  {
    icon: TrendingUp,
    text: 'Professional listings with specs and photos that actually convert.',
  },
  {
    icon: ShieldCheck,
    text: 'Secure payments and escrow options protect both sides of every transaction.',
  },
];

export default function HowItWorksSellerPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-5" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#FF5124]">
            How Vendibook Works for Sellers
          </p>
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sell Your Mobile Food Business to Serious, Verified Buyers
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            List your truck, trailer, or cart in minutes. Reach entrepreneurs nationwide. Close the sale with secure tools and support from Vendibook.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-[#FF5124] px-8 py-4 text-[15px] font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] hover:shadow-xl"
            >
              List Your Truck
            </button>
            <button
              type="button"
              onClick={() => navigate('/listings?mode=sale')}
              className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[15px] font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
            >
              Browse Active Listings
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              Five Steps to a Successful Sale
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              From listing to closing, we've built every tool you need to sell confidently.
            </p>
          </div>

          <div className="space-y-6">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-[#FF5124]/20 hover:shadow-lg sm:p-8"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F2]">
                      <step.icon className="h-6 w-6 text-[#FF5124]" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF5124] sm:text-center">
                      Step {step.number}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                      {step.headline}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-slate-600">
                      {step.body}
                    </p>
                  </div>
                </div>
                
                {/* Connecting line (except last) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute -bottom-6 left-[39px] hidden h-6 w-px bg-gradient-to-b from-[#FF5124]/20 to-transparent sm:block" />
                )}
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
              Why Sellers Choose Vendibook
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
            Ready to Sell?
          </h2>
          <p className="mb-8 text-white/90">
            Create your listing in under 10 minutes and reach thousands of motivated buyers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/host/onboarding')}
              className="rounded-full bg-white px-8 py-4 text-[15px] font-semibold text-[#FF5124] shadow-lg transition-all hover:bg-white/95"
            >
              List Your Truck Now
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
