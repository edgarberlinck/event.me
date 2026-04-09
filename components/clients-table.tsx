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
    const rows: string[] = [
      ["Name", "Email", "Event Type", "Bookings"].join(","),
    ];

    for (const client of clients) {
      for (const et of client.eventTypes) {
        rows.push(
          [
            `"${client.guestName.replace(/"/g, '""')}"`,
            `"${client.guestEmail.replace(/"/g, '""')}"`,
            `"${et.title.replace(/"/g, '""')}"`,
            et.count,
          ].join(","),
        );
      }
    }

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "clients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Event Types</th>
              <th className="pb-3 font-medium text-right">Total Bookings</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.guestEmail}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="py-3 pr-4 font-medium">{client.guestName}</td>
                <td className="py-3 pr-4 text-gray-600">{client.guestEmail}</td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {client.eventTypes.map((et) => (
                      <Badge key={et.title} variant="secondary">
                        {et.title} &times; {et.count}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-3 text-right font-medium">
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
