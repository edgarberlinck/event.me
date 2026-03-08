"use client";

interface LocalTimeProps {
  isoString: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

const defaultFormatOptions: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

export function LocalTime({
  isoString,
  formatOptions = defaultFormatOptions,
}: LocalTimeProps) {
  const date = new Date(isoString);
  return <>{date.toLocaleString(undefined, formatOptions)}</>;
}
