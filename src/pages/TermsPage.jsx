import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-slate-900 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-slate-300">
              Last updated: November 28, 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="mx-auto max-w-3xl px-4 py-12 prose prose-slate prose-lg">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">1. Agreement to Terms</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              By accessing or using VendiBook ("the Platform"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of these terms, you may not access the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">2. Description of Service</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              VendiBook is an online marketplace that connects food truck owners, trailer operators, and mobile 
              business equipment providers ("Hosts") with individuals and businesses seeking to rent or purchase 
              such equipment ("Renters" or "Buyers"). We also facilitate bookings for event professionals 
              ("Event Pros").
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">3. User Accounts</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              To access certain features of the Platform, you must create an account. You agree to:
            </p>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">4. Listings and Bookings</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              <strong>For Hosts:</strong> You are responsible for ensuring your listings are accurate and that 
              you have the legal right to rent or sell the listed equipment. You agree to honor confirmed 
              bookings and maintain your equipment in safe, operational condition.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              <strong>For Renters:</strong> You agree to use rented equipment responsibly, return it in the 
              condition received (normal wear excepted), and comply with all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">5. Payments and Fees</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              VendiBook facilitates payments between Hosts and Renters through our secure payment system. 
              We charge service fees to both parties as disclosed at the time of booking. All fees are 
              non-refundable unless otherwise stated in our refund policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">6. Cancellations and Refunds</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Cancellation policies are set by individual Hosts and displayed on each listing. VendiBook 
              will process refunds according to the applicable cancellation policy. Service fees may be 
              retained in accordance with our fee policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">7. Insurance and Liability</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              While VendiBook provides certain protections, we strongly recommend that both Hosts and 
              Renters maintain appropriate insurance coverage. VendiBook is not responsible for damages, 
              injuries, or losses that may occur during the use of listed equipment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">8. Prohibited Activities</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">You may not:</p>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Use the Platform for illegal purposes</li>
              <li>Misrepresent your identity or affiliation</li>
              <li>Post false or misleading content</li>
              <li>Interfere with the Platform's operation</li>
              <li>Circumvent our payment system for off-platform transactions</li>
              <li>Harass, threaten, or discriminate against other users</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">9. Intellectual Property</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              The Platform and its original content, features, and functionality are owned by VendiBook 
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">10. Termination</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We reserve the right to terminate or suspend your account and access to the Platform 
              immediately, without prior notice, for conduct that we believe violates these Terms or 
              is harmful to other users or the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">11. Disclaimer of Warranties</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE 
              THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY CONTENT ON THE PLATFORM.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">12. Contact Us</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@vendibook.com" className="text-orange-600 hover:underline">
                legal@vendibook.com
              </a>
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <section className="bg-slate-100 py-8">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-slate-600">
              Have questions?{' '}
              <Link to="/contact" className="font-semibold text-orange-600 hover:underline">
                Contact our team
              </Link>
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
