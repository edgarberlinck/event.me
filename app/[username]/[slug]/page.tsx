import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BuyMeACoffeeButton } from "@/components/buy-me-a-coffee-button";
import { BookingForm } from "@/components/booking-form";
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

type Props = {
  params: Promise<{
    username: string;
    slug: string;
  }>;
  searchParams: Promise<{
    date?: string;
    time?: string;
    error?: string;
  }>;
};

async function createBooking(formData: FormData) {
  "use server";

  const eventTypeId = formData.get("eventTypeId") as string;
  const guestName = formData.get("guestName") as string;
  const guestEmail = formData.get("guestEmail") as string;
  const guestNotes = formData.get("guestNotes") as string;
  const startTime = formData.get("startTime") as string;
  const duration = Number.parseInt(formData.get("duration") as string, 10);
  const username = formData.get("username") as string;
  const slug = formData.get("slug") as string;
  const bookingDate = formData.get("bookingDate") as string;
  const bookingTime = formData.get("bookingTime") as string;

  if (!eventTypeId || !guestName || !guestEmail || !startTime || !duration) {
    throw new Error("Missing required fields");
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);

  // Use the API route which handles Google Calendar integration
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventTypeId,
      guestName,
      guestEmail,
      guestNotes,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    }),
  });

  if (!response.ok) {
    const error = await response.json();

    if (
      response.status === 403 &&
      error.error ===
        "This email address has been blocked by the No Show policy." &&
      username &&
      slug &&
      bookingDate &&
      bookingTime
    ) {
      redirect(
        `/${username}/${slug}?date=${bookingDate}&time=${bookingTime}&error=no_show_blocked`,
      );
    }

    throw new Error(error.error || "Failed to create booking");
  }

  redirect("/booking/success");
}

export default async function PublicBookingPage({
  params,
  searchParams,
}: Props) {
  const { username, slug } = await params;
  const { date, time, error } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      availability: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const eventType = await prisma.eventType.findFirst({
    where: {
      slug,
      userId: user.id,
      active: true,
    },
  });

  if (!eventType) {
    notFound();
  }

  const eventTypeWithUser = {
    ...eventType,
    user: {
      availability: user.availability,
      timezone: user.timezone,
    },
  };

  const showBookingForm = date && time;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold">Event.me</span>
            </div>
            <BuyMeACoffeeButton />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showBookingForm ? (
          <div>
            <Link
              href={`/${username}/${slug}`}
              className="text-indigo-600 hover:text-indigo-700 text-sm inline-flex items-center gap-1 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to date selection
            </Link>

            <Card>
              <CardHeader>
                <CardTitle>Book {eventType.title}</CardTitle>
                <CardDescription>
                  {eventType.description || "Please provide your details"}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {eventType.duration} minutes
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(`${date}T${time}`).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form action={createBooking} className="space-y-6">
                  <input
                    type="hidden"
                    name="eventTypeId"
                    value={eventType.id}
                  />
                  <input type="hidden" name="username" value={username} />
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="bookingDate" value={date} />
                  <input type="hidden" name="bookingTime" value={time} />
                  <input
                    type="hidden"
                    name="duration"
                    value={eventType.duration}
                  />
                  <input
                    type="hidden"
                    name="startTime"
                    value={`${date}T${time}:00`}
                  />

                  {error === "no_show_blocked" && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      This email address has been blocked by the No Show policy.
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="guestName">Your Name *</Label>
                    <Input
                      id="guestName"
                      name="guestName"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestEmail">Your Email *</Label>
                    <Input
                      id="guestEmail"
                      name="guestEmail"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guestNotes">Additional Notes</Label>
                    <Textarea
                      id="guestNotes"
                      name="guestNotes"
                      placeholder="Let us know if you have any specific topics or questions..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Confirm Booking
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <h2 className="text-base text-muted-foreground">
                      {eventType.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {eventType.duration} min
                  </div>
                </div>
                {eventType.description && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    {eventType.description}
                  </p>
                )}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select a Date & Time</CardTitle>
                <CardDescription>
                  Choose a time that works best for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingForm eventType={eventTypeWithUser} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
