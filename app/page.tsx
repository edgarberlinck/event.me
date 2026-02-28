import { Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Event.me" width={32} height={32} />
              <span className="text-xl font-bold">Event.me</span>
            </Link>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl">
            Simple Scheduling
            <span className="block text-indigo-600">Made Easy</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Let people book meetings with you based on your available time
            slots. No complexity, no fuss - just clean, efficient appointment
            scheduling.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Set Availability"
                width={48}
                height={48}
                className="text-indigo-600"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold">
              Set Your Availability
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Define your working hours and available time slots for each day of
              the week.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center">
              <Clock className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Create Event Types</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Set up different meeting types with custom durations and
              descriptions.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center">
              <Users className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="mt-4 text-xl font-semibold">Share & Book</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Share your booking link and let people schedule meetings with you
              instantly.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-24 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <div className="space-x-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Terms of Use
              </Link>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              © 2026 Event.me - Simple scheduling for everyone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
