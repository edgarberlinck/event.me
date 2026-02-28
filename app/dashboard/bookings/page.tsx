import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingsTable } from "@/components/bookings-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

export default async function BookingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
    },
    include: {
      eventType: true,
    },
    orderBy: {
      startTime: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-gray-500">Manage all your scheduled meetings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingsTable bookings={bookings} />
        </CardContent>
      </Card>
    </div>
  );
}
