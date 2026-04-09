"use client";

import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ClientEventTypeSummary {
  title: string;
  count: number;
}

export interface Client {
  guestName: string;
  guestEmail: string;
  eventTypes: ClientEventTypeSummary[];
  totalBookings: number;
}

interface ClientsTableProps {
  clients: Client[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const handleExportCSV = () => {
    const rows: string[][] = [["Name", "Email", "Event Type", "Bookings"]];

    for (const client of clients) {
      for (const et of client.eventTypes) {
        rows.push([
          client.guestName,
          client.guestEmail,
          et.title,
          String(et.count),
        ]);
      }
    }

    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "clients.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No clients yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Name
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Email
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Event Types
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Total Bookings
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.guestEmail}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 px-4 font-medium">{client.guestName}</td>
                <td className="py-3 px-4 text-gray-600">{client.guestEmail}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {client.eventTypes.map((et) => (
                      <Badge key={et.title} variant="secondary">
                        {et.title} × {et.count}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-600">
                  {client.totalBookings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
