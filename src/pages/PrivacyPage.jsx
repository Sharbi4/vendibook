import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-slate-900 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-slate-300">
              Last updated: November 28, 2025
            </p>
          </div>
        </section>

        {/* Content */}
        <article className="mx-auto max-w-3xl px-4 py-12">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              VendiBook ("we," "our," or "us") respects your privacy and is committed to protecting your 
              personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
            
            <h3 className="mt-6 text-lg font-semibold text-slate-800">Personal Information</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              When you create an account or use our services, we may collect:
            </p>
            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
              <li>Name, email address, and phone number</li>
              <li>Billing and payment information</li>
              <li>Profile photo and business information</li>
              <li>Government-issued ID for verification purposes</li>
              <li>Location data when you use location-based features</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-slate-800">Automatically Collected Information</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              We automatically collect certain information when you visit our platform:
            </p>
            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
              <li>Device type, browser type, and operating system</li>
              <li>IP address and approximate location</li>
              <li>Pages visited and time spent on each page</li>
              <li>Referring website or search terms</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">How We Use Your Information</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">We use the information we collect to:</p>
            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related communications</li>
              <li>Verify user identities and prevent fraud</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Information Sharing</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We may share your information in the following circumstances:
            </p>
            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
              <li><strong>With other users:</strong> To facilitate bookings and transactions</li>
              <li><strong>With service providers:</strong> Who help us operate our platform</li>
              <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Address Masking</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              To protect our Hosts' privacy, we mask exact listing addresses until a booking is confirmed. 
              Only the general neighborhood or area is shown to prospective renters. Full address details 
              are shared only after payment is processed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Data Security</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              data, including encryption, secure servers, and regular security assessments. However, 
              no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Your Rights</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Depending on your location, you may have the right to:
            </p>
            <ul className="mt-4 space-y-2 text-slate-600 list-disc list-inside">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Cookies</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze usage, and 
              deliver personalized content. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Children's Privacy</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Our platform is not intended for individuals under 18 years of age. We do not knowingly 
              collect personal information from children.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Changes to This Policy</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@vendibook.com" className="text-orange-600 hover:underline">
                privacy@vendibook.com
              </a>
            </p>
          </section>
        </article>

        {/* Footer CTA */}
        <section className="bg-slate-100 py-8">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-slate-600">
              Questions about your data?{' '}
              <Link to="/contact" className="font-semibold text-orange-600 hover:underline">
                Contact our privacy team
              </Link>
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
