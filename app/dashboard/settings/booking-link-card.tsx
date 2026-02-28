"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BookingLinkCard({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${username}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard API failed, using fallback:", err);
      // Fallback for environments where clipboard API is unavailable
      const textarea = document.createElement("textarea");
      textarea.value = bookingUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const success = document.execCommand("copy");
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <Card className="mb-6 bg-indigo-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="text-indigo-900">Your Booking Link</CardTitle>
        <CardDescription className="text-indigo-700">
          Share this link with people to allow them to book meetings with you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 bg-white rounded-md border">
          <code className="text-sm flex-1 text-indigo-600 font-mono break-all">
            {bookingUrl}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
