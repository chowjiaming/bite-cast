/** Formats an ISO calendar date for the day-track chips (UTC calendar day). */
export function formatDayChip(dateIso: string): { weekday: string; day: string } {
  const [year = 0, month = 1, day = 1] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return {
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(date),
    day: String(day),
  };
}

/** Short place + weekday label for the outing hero. */
export function formatOutingDate(dateIso: string): string {
  const [year = 0, month = 1, day = 1] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(
    date,
  );
  const monthDay = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  return `${weekday} · ${monthDay}`;
}
