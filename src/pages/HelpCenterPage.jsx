import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ChevronRight, ChevronDown, Truck, Users, Shield, 
  CreditCard, Calendar, MessageCircle, HelpCircle, FileText,
  Home, MapPin, Star, AlertCircle
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const FAQ_CATEGORIES = [
  {
    id: 'renters',
    title: 'For Renters',
    icon: Users,
    color: 'bg-blue-500',
    faqs: [
      {
        q: 'How do I book a food truck or trailer?',
        a: 'Search for available listings in your area, select your dates, and click "Book Now". You\'ll be guided through our secure checkout process. Once payment is confirmed, the host will receive your booking request.'
      },
      {
        q: 'What if I need to cancel my booking?',
        a: 'Cancellation policies vary by host. You can find the specific policy on each listing page. Generally, cancellations made 48+ hours before the rental start time receive a full refund. Check your booking confirmation for details.'
      },
      {
        q: 'Is the address shown on the listing accurate?',
        a: 'For privacy, we mask the exact address until your booking is confirmed and paid. Once confirmed, you\'ll receive the full address and contact information to coordinate pickup or delivery.'
      },
      {
        q: 'What\'s included in the rental?',
        a: 'Each listing specifies what\'s included. Most rentals include the vehicle/equipment as described, basic cleaning, and any listed amenities. Additional services like delivery, generators, or staff may be available as add-ons.'
      },
      {
        q: 'Do I need insurance to rent?',
        a: 'Insurance requirements vary by host and listing type. Some hosts require proof of liability insurance, while others offer coverage as part of the rental. Check the listing requirements before booking.'
      }
    ]
  },
  {
    id: 'hosts',
    title: 'For Hosts',
    icon: Truck,
    color: 'bg-orange-500',
    faqs: [
      {
        q: 'How do I list my food truck or equipment?',
        a: 'Click "Create a Listing" in the navigation bar. Our 7-step wizard will guide you through adding photos, setting prices, defining availability, and publishing your listing.'
      },
      {
        q: 'How much does it cost to list?',
        a: 'Listing on VendiBook is free. We charge a small service fee (typically 3-5%) on completed bookings to cover payment processing and platform maintenance.'
      },
      {
        q: 'How do I get paid?',
        a: 'Payouts are processed within 24-48 hours after the rental begins. You can set up direct deposit to your bank account in your dashboard settings. We support all major banks.'
      },
      {
        q: 'Can I set my own cancellation policy?',
        a: 'Yes! You can choose from flexible, moderate, or strict cancellation policies when creating your listing. Each policy balances renter flexibility with host protection.'
      },
      {
        q: 'How do I handle equipment damage?',
        a: 'Document your equipment\'s condition before and after each rental. If damage occurs, you can file a claim through our resolution center. Security deposits help protect against damages.'
      }
    ]
  },
  {
    id: 'sellers',
    title: 'For Sellers',
    icon: CreditCard,
    color: 'bg-green-500',
    faqs: [
      {
        q: 'How do I list my food truck for sale?',
        a: 'Select "For Sale" when creating a new listing. Add detailed photos, specifications, maintenance history, and your asking price. You can also indicate if you offer financing or delivery.'
      },
      {
        q: 'What documentation do I need?',
        a: 'For vehicle sales, you\'ll need the title, VIN, and ideally a recent inspection report. Having maintenance records and equipment certifications can help attract serious buyers.'
      },
      {
        q: 'How are payments handled for sales?',
        a: 'We offer secure escrow services for equipment sales. Funds are held until the buyer confirms receipt and condition of the purchase. We can also connect you with notary services.'
      },
      {
        q: 'Can I offer financing to buyers?',
        a: 'Yes, you can indicate financing availability on your listing. We partner with equipment lenders who can facilitate financing for qualified buyers.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Security',
    icon: Shield,
    color: 'bg-purple-500',
    faqs: [
      {
        q: 'Is my payment information secure?',
        a: 'Absolutely. We use Stripe for payment processing, which is PCI-DSS Level 1 certified. Your card information is never stored on our servers and all transactions are encrypted.'
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover). Some bookings may also support Apple Pay and Google Pay.'
      },
      {
        q: 'Are there any hidden fees?',
        a: 'No hidden fees. The price you see includes the rental cost and any add-ons you select. Service fees are clearly displayed before you complete your booking.'
      },
      {
        q: 'How do refunds work?',
        a: 'Refunds are processed according to the host\'s cancellation policy. Once approved, refunds typically appear in your account within 5-10 business days, depending on your bank.'
      }
    ]
  }
];

const QUICK_LINKS = [
  { icon: Calendar, label: 'Booking help', href: '#renters' },
  { icon: Truck, label: 'Hosting guide', href: '#hosts' },
  { icon: CreditCard, label: 'Payments', href: '#payments' },
  { icon: MessageCircle, label: 'Contact us', href: '/contact' }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (categoryId, index) => {
    const key = `${categoryId}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredCategories = FAQ_CATEGORIES.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      searchQuery === '' || 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="bg-slate-900 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-5xl">
              How can we help you?
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Search our help center or browse categories below
            </p>
            
            {/* Search */}
            <div className="mt-8 relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-6 text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mx-auto max-w-5xl px-4 -mt-8">
          <div className="grid gap-4 sm:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <link.icon className="h-5 w-5 text-orange-600" />
                </div>
                <span className="font-semibold text-slate-900">{link.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
              </a>
            ))}
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          {filteredCategories.map((category) => (
            <div key={category.id} id={category.id} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.color}`}>
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
              </div>

              <div className="space-y-3">
                {category.faqs.map((faq, idx) => {
                  const isExpanded = expandedItems[`${category.id}-${idx}`];
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                    >
                      <button
                        onClick={() => toggleItem(category.id, idx)}
                        className="flex w-full items-center justify-between p-5 text-left"
                      >
                        <span className="font-semibold text-slate-900">{faq.q}</span>
                        <ChevronDown 
                          className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                          <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No results found</h3>
              <p className="mt-2 text-slate-500">Try a different search term or browse our categories above.</p>
            </div>
          )}
        </section>

        {/* Still need help? */}
        <section className="bg-slate-100 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Still need help?</h2>
            <p className="mt-2 text-slate-600">
              Our support team is here to assist you
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-orange-600"
              >
                <MessageCircle className="h-5 w-5" />
                Contact Support
              </Link>
              <Link
                to="/how-it-works/renters"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition-all hover:border-slate-400"
              >
                <FileText className="h-5 w-5" />
                View Guides
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
