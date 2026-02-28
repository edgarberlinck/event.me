"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/event-types", label: "Event Types" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/availability", label: "Availability" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-4">
        {navLinks.map((link) => (
          <Button key={link.href} variant="ghost" asChild>
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b shadow-lg md:hidden z-50"
        >
          <div className="flex flex-col px-4 py-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className="justify-start"
              >
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
