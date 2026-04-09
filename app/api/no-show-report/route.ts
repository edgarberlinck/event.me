import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma.server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const noShowBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        status: "no_show",
      },
      select: {
        guestName: true,
        guestEmail: true,
        startTime: true,
        eventType: {
          select: { title: true },
        },
      },
      orderBy: { startTime: "desc" },
    });

    // Aggregate by email
    const aggregated = new Map<
      string,
      { name: string; email: string; count: number }
    >();
    for (const booking of noShowBookings) {
      const key = booking.guestEmail.toLowerCase();
      const existing = aggregated.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        aggregated.set(key, {
          name: booking.guestName,
          email: booking.guestEmail,
          count: 1,
        });
      }
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "csv") {
      const rows = [["Name", "Email", "No Show Count"]];
      for (const entry of aggregated.values()) {
        rows.push([entry.name, entry.email, String(entry.count)]);
      }
      const csv = rows
        .map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="no-show-report.csv"',
        },
      });
    }

    return NextResponse.json(Array.from(aggregated.values()));
  } catch (error) {
    console.error("No show report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
