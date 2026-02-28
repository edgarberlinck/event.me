import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" alt="Event.me" width={40} height={40} />
            <span className="text-xl font-bold">Event.me</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Use</CardTitle>
            <p className="text-gray-500 text-sm">
              Last updated: February 28, 2026
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                By accessing and using Event.me, you accept and agree to be
                bound by these Terms of Use. If you do not agree to these terms,
                please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                2. Description of Service
              </h2>
              <p className="text-gray-700">
                Event.me is a scheduling platform that allows users to share
                their availability and enable others to book meetings with them.
                The service integrates with Google Calendar to manage
                appointments.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-gray-700 mb-2">To use Event.me, you must:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Create an account with accurate information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 13 years of age</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
              <p className="text-gray-700 mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service to spam or harass others</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                5. Content and Intellectual Property
              </h2>
              <p className="text-gray-700">
                You retain ownership of any content you submit to Event.me. By
                using our service, you grant us a license to use, store, and
                display your content as necessary to provide the service. All
                service features, design, and functionality are owned by
                Event.me and protected by copyright and trademark laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                6. Third-Party Services
              </h2>
              <p className="text-gray-700">
                Event.me integrates with Google Calendar and other third-party
                services. Your use of these services is subject to their
                respective terms and conditions. We are not responsible for the
                availability or functionality of third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                7. Service Availability
              </h2>
              <p className="text-gray-700">
                We strive to provide reliable service but do not guarantee
                uninterrupted access. We may modify, suspend, or discontinue any
                part of the service at any time without notice. We are not
                liable for any modification, suspension, or discontinuation of
                the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                8. Booking and Cancellations
              </h2>
              <p className="text-gray-700">
                Users are responsible for managing their bookings. Event
                organizers may set their own cancellation and rescheduling
                policies. Event.me is not responsible for missed appointments or
                scheduling conflicts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                9. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700">
                Event.me is provided "as is" without warranties of any kind,
                either express or implied. We do not warrant that the service
                will be error-free, secure, or meet your requirements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                10. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                To the maximum extent permitted by law, Event.me shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use or inability to use the
                service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                11. Indemnification
              </h2>
              <p className="text-gray-700">
                You agree to indemnify and hold Event.me harmless from any
                claims, damages, losses, liabilities, and expenses arising from
                your use of the service or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                12. Account Termination
              </h2>
              <p className="text-gray-700">
                We reserve the right to suspend or terminate your account at any
                time for violation of these terms or for any other reason. You
                may delete your account at any time through your account
                settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                13. Modifications to Terms
              </h2>
              <p className="text-gray-700">
                We may revise these terms at any time. Changes will be effective
                immediately upon posting. Your continued use of Event.me after
                changes constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance
                with applicable laws, without regard to conflict of law
                provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                15. Contact Information
              </h2>
              <p className="text-gray-700">
                If you have any questions about these Terms of Use, please
                contact us through our support channels.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">16. Severability</h2>
              <p className="text-gray-700">
                If any provision of these terms is found to be unenforceable,
                the remaining provisions will continue in full force and effect.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <div className="space-x-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="hover:underline">
              Terms of Use
            </Link>
          </div>
          <p className="mt-2">
            © {new Date().getFullYear()} Event.me. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
