import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';

export default function TermsOfServicePage() {
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
              <FileText className="h-7 w-7 text-[#FF5124]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
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
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>Summary:</strong> By using Vendibook, you agree to these terms. We provide a platform connecting equipment owners with renters. You're responsible for your listings, bookings, and conduct on our platform.
            </p>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing or using Vendibook's services, website, or mobile applications (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
          </p>
          <p className="text-slate-600 mb-4">
            We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-slate-600 mb-4">
            Vendibook provides an online marketplace platform that connects owners of food trucks, trailers, commercial kitchen equipment, and event services ("Hosts") with individuals and businesses seeking to rent, purchase, or hire such equipment and services ("Renters" or "Buyers").
          </p>
          <p className="text-slate-600 mb-4">
            Vendibook acts solely as an intermediary facilitating transactions between Hosts and Renters. We do not own, operate, maintain, or control any of the equipment or services listed on our platform.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
          <p className="text-slate-600 mb-4">
            To access certain features of the Service, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Host Responsibilities</h2>
          <p className="text-slate-600 mb-4">
            As a Host listing equipment or services on Vendibook, you agree to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Provide accurate and complete information about your listings</li>
            <li>Maintain equipment in safe, working condition</li>
            <li>Comply with all applicable laws, regulations, and licensing requirements</li>
            <li>Honor confirmed bookings unless cancellation is unavoidable</li>
            <li>Respond to booking requests within 48 hours</li>
            <li>Provide clear cancellation and refund policies</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Renter Responsibilities</h2>
          <p className="text-slate-600 mb-4">
            As a Renter using Vendibook, you agree to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Use rented equipment only for its intended purpose</li>
            <li>Return equipment in the same condition as received</li>
            <li>Comply with all Host rules and local regulations</li>
            <li>Report any damage or issues immediately</li>
            <li>Maintain appropriate insurance coverage where required</li>
            <li>Pay all fees and charges on time</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Payments and Fees</h2>
          <p className="text-slate-600 mb-4">
            All payments are processed through our secure payment platform. By completing a transaction, you agree to pay all applicable fees, including rental charges, service fees, security deposits, and any additional charges disclosed at checkout.
          </p>
          <p className="text-slate-600 mb-4">
            Hosts receive payouts within 48 hours of rental completion, minus applicable service fees. Vendibook charges a service fee to both Hosts and Renters, which is disclosed before booking confirmation.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">7. Cancellations and Refunds</h2>
          <p className="text-slate-600 mb-4">
            Cancellation policies vary by listing and are set by individual Hosts. Before booking, review the cancellation policy carefully. Vendibook may issue refunds at our discretion in cases of service failures, safety issues, or extenuating circumstances.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">8. Prohibited Activities</h2>
          <p className="text-slate-600 mb-4">
            You may not use the Service to:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Post false, misleading, or fraudulent content</li>
            <li>Circumvent Vendibook's payment system</li>
            <li>Harass, threaten, or discriminate against other users</li>
            <li>Use equipment for illegal activities</li>
            <li>Infringe on intellectual property rights</li>
          </ul>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="text-slate-600 mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, VENDIBOOK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO VENDIBOOK IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">10. Dispute Resolution</h2>
          <p className="text-slate-600 mb-4">
            Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive any right to participate in class actions.
          </p>

          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">11. Contact Information</h2>
          <p className="text-slate-600 mb-4">
            For questions about these Terms, please contact us at:
          </p>
          <p className="text-slate-600 mb-4">
            <strong>Email:</strong> legal@vendibook.com<br />
            <strong>Address:</strong> 123 Market Street, San Francisco, CA 94102
          </p>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            to="/privacy"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-[#FF5124]/40 hover:bg-slate-50"
          >
            Privacy Policy
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
