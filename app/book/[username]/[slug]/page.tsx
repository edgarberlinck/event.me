import { Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { BuyMeACoffeeButton } from "@/components/buy-me-a-coffee-button";
import { BookingForm } from "@/components/booking-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <BuyMeACoffeeButton />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "User"}
                />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.name || user.username}
                </h2>
                <p className="text-sm text-gray-500">
                  {user.username ? `@${user.username}` : user.email}
                </p>
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{eventType.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {eventType.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{eventType.duration} min</span>
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
