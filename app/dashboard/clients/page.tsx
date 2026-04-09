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
      guestEmail: "asc",
    },
  });

  // Group bookings by guest email and count event types
  const clientMap = new Map<string, Client>();

  for (const booking of bookings) {
    const key = booking.guestEmail.toLowerCase();
    const existing = clientMap.get(key);

    if (existing) {
      const etEntry = existing.eventTypes.find(
        (et) => et.title === booking.eventType.title,
      );
      if (etEntry) {
        etEntry.count += 1;
      } else {
        existing.eventTypes.push({ title: booking.eventType.title, count: 1 });
      }
      existing.totalBookings += 1;
    } else {
      clientMap.set(key, {
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        eventTypes: [{ title: booking.eventType.title, count: 1 }],
        totalBookings: 1,
      });
    }
  }

  const clients = Array.from(clientMap.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-gray-500">
          People who have scheduled events with you
        </p>
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
