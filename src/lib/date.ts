const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function todayInTimeZone(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const valueOf = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${valueOf("year")}-${valueOf("month")}-${valueOf("day")}`;
}

export function addDays(dateIso: string, days: number): string {
  const [year = 0, month = 1, day = 1] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function forecastDates(startIso: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addDays(startIso, index));
}

/** Rejects impossible dates such as 2026-02-30, which `Date.UTC` would silently roll forward. */
export function isIsoDate(value: string): boolean {
  return ISO_DATE_PATTERN.test(value) && addDays(value, 0) === value;
}
