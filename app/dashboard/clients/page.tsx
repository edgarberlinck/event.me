import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { Client } from "@/components/clients-table";
import { ClientsTable } from "@/components/clients-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma.server";

export default async function ClientsPage() {
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
      createdAt: "desc",
    },
  });

  // Group bookings by guest email to build the clients list
  const clientsMap = new Map<
    string,
    { guestName: string; eventTypeCounts: Map<string, number> }
  >();

  for (const booking of bookings) {
    const existing = clientsMap.get(booking.guestEmail);
    if (existing) {
      const count = existing.eventTypeCounts.get(booking.eventType.title) ?? 0;
      existing.eventTypeCounts.set(booking.eventType.title, count + 1);
    } else {
      clientsMap.set(booking.guestEmail, {
        guestName: booking.guestName,
        eventTypeCounts: new Map([[booking.eventType.title, 1]]),
      });
    }
  }

  const clients: Client[] = Array.from(clientsMap.entries()).map(
    ([email, data]) => {
      const eventTypes = Array.from(data.eventTypeCounts.entries()).map(
        ([title, count]) => ({ title, count }),
      );
      return {
        guestEmail: email,
        guestName: data.guestName,
        eventTypes,
        totalBookings: eventTypes.reduce((sum, et) => sum + et.count, 0),
      };
    },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-gray-500">People who have booked events with you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientsTable clients={clients} />
        </CardContent>
      </Card>
    </div>
  );
}
