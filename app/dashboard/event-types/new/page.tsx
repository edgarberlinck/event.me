import { Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma.server";

async function createEventType(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const duration = Number.parseInt(formData.get("duration") as string, 10);
  const maxBookingsPerWeek = formData.get("maxBookingsPerWeek")
    ? Number.parseInt(formData.get("maxBookingsPerWeek") as string, 10)
    : null;
  const minimumNoticeHours = formData.get("minimumNoticeHours")
    ? Number.parseInt(formData.get("minimumNoticeHours") as string, 10)
    : 24;
  const maximumNoticeDays = formData.get("maximumNoticeDays")
    ? Number.parseInt(formData.get("maximumNoticeDays") as string, 10)
    : 14;

  if (!title || !slug || !duration) {
    throw new Error("Missing required fields");
  }

  await prisma.eventType.create({
    data: {
      userId: session.user.id,
      title,
      slug,
      description,
      duration,
      maxBookingsPerWeek,
      minimumNoticeHours,
      maximumNoticeDays,
    },
  });

  redirect("/dashboard/event-types");
}

export default async function NewEventTypePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold">Event.me</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/event-types"
            className="text-indigo-600 hover:text-indigo-700 text-sm"
          >
            ← Back to Event Types
          </Link>
          <h1 className="text-3xl font-bold mt-4">Create Event Type</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define a new type of meeting you want to offer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Provide information about this event type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createEventType} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="30 Minute Meeting"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="30min"
                  required
                  pattern="[a-z0-9-]+"
                  title="Only lowercase letters, numbers, and hyphens"
                />
                <p className="text-sm text-gray-500">
                  This will be part of your booking URL
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A brief 30-minute meeting to discuss..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  placeholder="30"
                  min="15"
                  max="240"
                  step="15"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBookingsPerWeek">
                  Max Bookings Per Week
                </Label>
                <Input
                  id="maxBookingsPerWeek"
                  name="maxBookingsPerWeek"
                  type="number"
                  placeholder="Unlimited"
                  min="1"
                />
                <p className="text-sm text-gray-500">
                  Leave empty for unlimited bookings
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumNoticeHours">
                  Minimum Notice (hours) *
                </Label>
                <Input
                  id="minimumNoticeHours"
                  name="minimumNoticeHours"
                  type="number"
                  placeholder="24"
                  defaultValue="24"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Minimum hours before event can start (e.g., 24 or 48)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumNoticeDays">
                  Maximum Notice (days) *
                </Label>
                <Input
                  id="maximumNoticeDays"
                  name="maximumNoticeDays"
                  type="number"
                  placeholder="14"
                  defaultValue="14"
                  min="1"
                  max="365"
                  required
                />
                <p className="text-sm text-gray-500">
                  Maximum days in advance for booking (e.g., 7 or 14)
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit">Create Event Type</Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/event-types">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
