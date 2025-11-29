import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Calendar } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border-b border-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#FF5124] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5124]/10">
              <Shield className="h-7 w-7 text-[#FF5124]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                Last updated: January 15, 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-6 mb-8">
            <p className="text-emerald-800 text-sm">
              <strong>Your Privacy Matters:</strong> We collect only what we need to provide our services, keep your data secure, and never sell your personal information to third parties.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Information You Provide</h3>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, phone number, and profile photo</li>
            <li><strong>Verification Information:</strong> Government ID, business licenses, and address verification</li>
            <li><strong>Payment Information:</strong> Credit card details, bank account information, and billing address</li>
            <li><strong>Listing Information:</strong> Equipment descriptions, photos, pricing, and availability</li>
            <li><strong>Communications:</strong> Messages, reviews, and support inquiries</li>
          </ul>

          <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">Information We Collect Automatically</h3>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Usage Information:</strong> Pages visited, search queries, and interactions with listings</li>
            <li><strong>Location Information:</strong> Approximate location based on IP address or precise location with permission</li>
            <li><strong>Cookies:</strong> Session cookies, preference cookies, and analytics cookies</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Connect Hosts and Renters for bookings</li>
            <li>Send service-related communications and updates</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, investigate, and prevent fraud and abuse</li>
            <li>Personalize and improve your experience</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Information Sharing</h2>
          <p className="text-slate-600 mb-4">We may share your information in the following circumstances:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>With Other Users:</strong> When you book or list equipment, relevant information is shared with the other party</li>
            <li><strong>With Service Providers:</strong> Third parties who help us operate our platform (payment processors, hosting, analytics)</li>
            <li><strong>For Legal Reasons:</strong> To comply with laws, respond to legal requests, or protect rights and safety</li>
            <li><strong>With Your Consent:</strong> When you explicitly authorize us to share information</li>
          </ul>
          <p className="text-slate-600 mb-4">
            <strong>We never sell your personal information to third parties for marketing purposes.</strong>
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
          <p className="text-slate-600 mb-4">
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>SSL/TLS encryption for data in transit</li>
            <li>Encrypted storage for sensitive data at rest</li>
            <li>Regular security audits and vulnerability testing</li>
            <li>Employee access controls and training</li>
            <li>Two-factor authentication options</li>
          </ul>
          <p className="text-slate-600 mb-4">
            No system is 100% secure. We encourage you to use strong passwords and protect your account credentials.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Your Rights and Choices</h2>
          <p className="text-slate-600 mb-4">Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
          </ul>
          <p className="text-slate-600 mb-4">
            To exercise these rights, contact us at privacy@vendibook.com or through your account settings.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Cookies and Tracking</h2>
          <p className="text-slate-600 mb-4">
            We use cookies and similar technologies to provide and improve our services. You can manage cookie preferences through your browser settings or our cookie consent tool.
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Essential Cookies:</strong> Required for the platform to function</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
            <li><strong>Marketing Cookies:</strong> Used for relevant advertising (with consent)</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Data Retention</h2>
          <p className="text-slate-600 mb-4">
            We retain your information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes (e.g., fraud prevention, dispute resolution).
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. International Data Transfers</h2>
          <p className="text-slate-600 mb-4">
            Vendibook is based in the United States. If you access our services from outside the US, your information may be transferred to and processed in the US or other countries with different data protection laws. We implement appropriate safeguards for international transfers.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-slate-600 mb-4">
            Our services are not directed to children under 18. We do not knowingly collect personal information from children. If we learn we have collected information from a child, we will delete it promptly.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Changes to This Policy</h2>
          <p className="text-slate-600 mb-4">
            We may update this Privacy Policy periodically. We will notify you of material changes by email or through the platform. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">11. Contact Us</h2>
          <p className="text-slate-600 mb-4">
            For questions about this Privacy Policy or our data practices:
          </p>
          <p className="text-slate-600 mb-4">
            <strong>Email:</strong> privacy@vendibook.com<br />
            <strong>Address:</strong> Vendibook Inc., 123 Market Street, San Francisco, CA 94102<br />
            <strong>Data Protection Officer:</strong> dpo@vendibook.com
          </p>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/terms"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
          >
            Terms of Service
          </Link>
          <Link
            to="/help"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
          >
            Help Center
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
          >
            Contact Us
          </Link>
        </div>
      </main>
    </AppLayout>
  );
}
