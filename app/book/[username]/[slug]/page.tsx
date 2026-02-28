import { Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

interface BookingPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { username, slug } = await params;

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{eventType.title}</CardTitle>
                <CardDescription className="mt-2">
                  {eventType.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {eventType.duration} min
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BookingForm eventType={eventTypeWithUser} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
