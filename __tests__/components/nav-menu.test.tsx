import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NavMenu } from "@/components/nav-menu";

describe("NavMenu Component", () => {
  it("renders desktop nav links", () => {
    render(<NavMenu />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Event Types")).toBeInTheDocument();
    expect(screen.getByText("Bookings")).toBeInTheDocument();
    expect(screen.getByText("Availability")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders hamburger button for mobile", () => {
    render(<NavMenu />);
    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it("opens and closes mobile menu on hamburger click", () => {
    render(<NavMenu />);
    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });

    // Mobile menu links are not visible initially (hidden via CSS in jsdom)
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("closes mobile menu when a nav link is clicked", () => {
    render(<NavMenu />);
    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    // Click on a mobile nav link (there are two sets of links: desktop hidden + mobile visible)
    const allDashboardLinks = screen.getAllByText("Dashboard");
    // The second one is in the mobile dropdown
    fireEvent.click(allDashboardLinks[allDashboardLinks.length - 1]);

    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });
});
