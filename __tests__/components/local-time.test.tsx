import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocalTime } from "@/components/local-time";

describe("LocalTime Component", () => {
  it("renders a time string from a UTC ISO date", () => {
    const isoString = "2024-01-15T11:00:00.000Z";
    render(<LocalTime isoString={isoString} />);

    // The rendered text should be a non-empty string (exact value depends on
    // the runtime's local timezone, which is the desired behaviour)
    const text = screen.getByText(/.+/);
    expect(text).toBeInTheDocument();
  });

  it("uses the local timezone for formatting (not UTC-only)", () => {
    const isoString = "2024-01-15T11:00:00.000Z";
    const date = new Date(isoString);

    render(<LocalTime isoString={isoString} />);

    // The rendered output should match what toLocaleString produces in the
    // current runtime timezone (not necessarily "11:00").
    const expected = date.toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("accepts custom format options", () => {
    const isoString = "2024-06-15T14:30:00.000Z";
    const date = new Date(isoString);
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };

    render(<LocalTime isoString={isoString} formatOptions={formatOptions} />);

    const expected = date.toLocaleString(undefined, formatOptions);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
