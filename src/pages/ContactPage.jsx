import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-slate-900">Message Sent!</h1>
            <p className="mt-3 text-slate-600">
              Thanks for reaching out. Our team typically responds within 24 hours during business days.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-500 px-8 py-3 font-semibold text-white transition-all hover:bg-orange-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="bg-slate-900 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="mx-auto max-w-5xl px-4 -mt-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Email Us</h3>
              <p className="mt-1 text-slate-500">support@vendibook.com</p>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-lg text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Live Chat</h3>
              <p className="mt-1 text-slate-500">Available 9am-6pm PT</p>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-lg text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">Response Time</h3>
              <p className="mt-1 text-slate-500">Within 24 hours</p>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl bg-white p-8 shadow-xl sm:p-12">
            <h2 className="text-2xl font-bold text-slate-900">Send us a message</h2>
            <p className="mt-2 text-slate-500">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value="">Select a category</option>
                  <option value="booking">Booking Help</option>
                  <option value="hosting">Hosting Questions</option>
                  <option value="payment">Payments & Refunds</option>
                  <option value="account">Account Issues</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                  placeholder="Tell us more about your question or issue..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-orange-500 py-4 font-semibold text-white shadow-lg transition-all hover:bg-orange-600 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin\" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* Help Center CTA */}
        <section className="bg-slate-100 py-12">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-slate-600">
              Looking for quick answers? Check out our{' '}
              <Link to="/help" className="font-semibold text-orange-600 hover:underline">
                Help Center
              </Link>
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
