import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Store, Users, UtensilsCrossed, Truck, ShieldCheck, CheckCircle2, Star, ArrowRight } from 'lucide-react';

const marketingBullets = [
  {
    title: 'Rent food trucks & trailers',
    copy: 'Weekend pop-ups, residencies, and turnkey tour support.',
    icon: Truck
  },
  {
    title: 'Book Event Pros & catering',
    copy: 'Chefs, DJs, photographers built for experiences.',
    icon: Users
  },
  {
    title: 'Secure vendor market spaces',
    copy: 'Reserve high-traffic booths at festivals and markets.',
    icon: Store
  },
  {
    title: 'Buy or sell equipment',
    copy: 'Marketplace for ready-to-roll trucks and trailers.',
    icon: UtensilsCrossed
  }
];

const testimonial = {
  quote: "Vendibook made launching my food truck business so easy. Found the perfect truck and was serving customers within a week!",
  author: "Maria Rodriguez",
  role: "Owner, Maria's Tacos",
  rating: 5,
  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
};

const heroImage = 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=1600&q=80';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Logo Header */}
        <header className="px-8 py-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Vendibook</span>
          </Link>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 text-center text-sm text-slate-500">
          <p>© 2025 Vendibook LLC. All rights reserved.</p>
        </footer>
      </div>

      {/* Right Panel - Marketing (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Food truck event"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Top Content */}
          <div>
            <span className="inline-block bg-orange-500/20 text-orange-300 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Join 2,000+ entrepreneurs
            </span>
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-4">
              Start your mobile food business today
            </h2>
            <p className="text-lg text-white/80 max-w-lg">
              Vendibook connects you with verified equipment, talented event pros, and vendor markets — all in one platform.
            </p>

            {/* Features */}
            <div className="mt-10 space-y-4">
              {marketingBullets.map(({ title, copy, icon: Icon }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="text-sm text-white/70">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-white/90 mb-6 leading-relaxed">"{testimonial.quote}"</p>
            <div className="flex items-center gap-4">
              <img
                src={testimonial.image}
                alt={testimonial.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-sm text-white/60">{testimonial.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
