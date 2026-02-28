import { redirect } from "next/navigation";
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
    <>
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
    </>
  );
}
