function toGCalDate(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function googleCalendarLink(opts: {
  title: string;
  startISO: string;
  endISO: string;
  location: string;
  details?: string;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${toGCalDate(opts.startISO)}/${toGCalDate(opts.endISO)}`,
    location: opts.location,
    details: opts.details ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function mapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}
