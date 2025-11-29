import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

const CONTACT_REASONS = [
  'General Inquiry',
  'Booking Help',
  'Payment Issue',
  'Report a Problem',
  'Partnership Opportunity',
  'Press Inquiry',
  'Other'
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h1 className="mt-6 text-3xl font-bold text-slate-900">Message Sent!</h1>
            <p className="mt-3 text-lg text-slate-600 max-w-md mx-auto">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF5124] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F]"
            >
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="mb-4 inline-flex items-center rounded-full bg-[#FF5124]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#FF5124]">
            Contact Us
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            We'd love to hear from you
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Have a question, feedback, or need help? Our team is ready to assist.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Contact Form */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Send us a message</h2>
            <p className="mt-2 text-slate-600">Fill out the form below and we'll get back to you shortly.</p>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-slate-700">
                  Reason for Contact
                </label>
                <select
                  id="reason"
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20"
                >
                  <option value="">Select a reason...</option>
                  {CONTACT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-[#FF5124] focus:outline-none focus:ring-2 focus:ring-[#FF5124]/20 resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5124] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF5124]/25 transition-all hover:bg-[#E5481F] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Contact Info</h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF5124]/10">
                    <Mail className="h-5 w-5 text-[#FF5124]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <a href="mailto:support@vendibook.com" className="text-slate-900 hover:text-[#FF5124]">
                      support@vendibook.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF5124]/10">
                    <Phone className="h-5 w-5 text-[#FF5124]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Phone</p>
                    <a href="tel:+18001234567" className="text-slate-900 hover:text-[#FF5124]">
                      1-800-123-4567
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#FF5124]/10">
                    <MapPin className="h-5 w-5 text-[#FF5124]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Office</p>
                    <p className="text-slate-900">
                      123 Market Street<br />
                      San Francisco, CA 94102
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Response Time */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/30 p-6 ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Clock className="h-5 w-5 text-[#FF5124]" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Quick Response</p>
                  <p className="text-sm text-slate-600">Usually within 24 hours</p>
                </div>
              </div>
            </div>
            
            {/* Live Chat CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-[#FF5124] to-[#FF8C00] p-6 text-white">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                <h3 className="text-lg font-bold">Need immediate help?</h3>
              </div>
              <p className="mt-2 text-sm text-white/90">
                Chat with our support team in real-time for faster assistance.
              </p>
              <button className="mt-4 w-full rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/30">
                Start Live Chat
              </button>
            </div>
            
            {/* Help Center Link */}
            <Link
              to="/help"
              className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-[#FF5124]/40"
            >
              <div>
                <p className="font-semibold text-slate-900">Help Center</p>
                <p className="text-sm text-slate-600">Browse FAQs and guides</p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
