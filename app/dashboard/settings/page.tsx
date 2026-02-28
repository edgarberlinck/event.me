import { Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";
import { isGoogleCalendarConnected } from "@/lib/google-calendar";
import { BookingLinkCard } from "./booking-link-card";
import { SettingsForm } from "./settings-form";
import { GoogleCalendarCard } from "./google-calendar-card";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true, email: true, timezone: true },
  });

  if (!user) {
    redirect("/login");
  }

  const googleConnected = await isGoogleCalendarConnected(session.user.id);

  async function updateSettings(prevState: any, formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user) return { error: "Not authenticated" };

    const username = formData.get("username") as string;
    const name = formData.get("name") as string;
    const timezone = formData.get("timezone") as string;

    // Check if username is already taken
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        return { error: "Username already taken" };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: username || null,
        name,
        timezone,
      },
    });

    redirect("/dashboard/settings");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center">
                <Calendar className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold">Event.me</span>
              </Link>
              <nav className="flex gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/dashboard/event-types" className="text-gray-600 hover:text-gray-900">
                  Event Types
                </Link>
                <Link href="/availability" className="text-gray-600 hover:text-gray-900">
                  Availability
                </Link>
                <Link href="/dashboard/settings" className="text-indigo-600 font-medium">
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings
          </p>
        </div>

        {user?.username && (
          <BookingLinkCard username={user.username} />
        )}

        <GoogleCalendarCard isConnected={googleConnected} />

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your profile information. Username is required to share your booking link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm user={user} updateSettings={updateSettings} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
