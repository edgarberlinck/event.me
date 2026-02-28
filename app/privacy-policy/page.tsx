import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-gray-500 text-sm">
              Last updated: February 28, 2026
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700">
                Welcome to Event.me. We respect your privacy and are committed
                to protecting your personal data. This privacy policy will
                inform you about how we look after your personal data and tell
                you about your privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Data We Collect</h2>
              <p className="text-gray-700 mb-2">
                We may collect, use, store and transfer different kinds of
                personal data about you:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  <strong>Identity Data:</strong> name, username
                </li>
                <li>
                  <strong>Contact Data:</strong> email address
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type,
                  timezone, location
                </li>
                <li>
                  <strong>Usage Data:</strong> information about how you use our
                  service
                </li>
                <li>
                  <strong>Calendar Data:</strong> availability settings, event
                  types, booking information
                </li>
                <li>
                  <strong>Google Account Data:</strong> when you connect your
                  Google Calendar
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                3. How We Use Your Data
              </h2>
              <p className="text-gray-700 mb-2">
                We use your personal data to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Provide and maintain our scheduling service</li>
                <li>Create and manage bookings</li>
                <li>Sync with your Google Calendar</li>
                <li>Send booking confirmations and reminders</li>
                <li>Improve our service and user experience</li>
                <li>Communicate with you about service updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
              <p className="text-gray-700">
                We do not sell your personal data. We may share your data with:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Google Calendar (when you connect your account)</li>
                <li>Service providers who help us operate our platform</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your
                personal data. However, no method of transmission over the
                internet is 100% secure, and we cannot guarantee absolute
                security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
              <p className="text-gray-700 mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request transfer of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to track
                activity on our service and store certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                8. Third-Party Services
              </h2>
              <p className="text-gray-700">
                Our service integrates with Google Calendar. When you connect
                your Google account, you are subject to Google's Privacy Policy
                in addition to ours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Data Retention</h2>
              <p className="text-gray-700">
                We retain your personal data only for as long as necessary to
                fulfill the purposes outlined in this privacy policy, unless a
                longer retention period is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700">
                Our service is not directed to individuals under the age of 13.
                We do not knowingly collect personal data from children under
                13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">
                11. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy, please
                contact us through our support channels.
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
