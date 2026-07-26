import { describe, expect, it } from "vitest";
import { addDays, forecastDates, isIsoDate, todayInTimeZone } from "./date";

describe("todayInTimeZone", () => {
  it("returns the local calendar date, not the UTC date", () => {
    const instant = new Date("2026-07-26T23:30:00Z");
    expect(todayInTimeZone("Asia/Singapore", instant)).toBe("2026-07-27");
    expect(todayInTimeZone("America/Toronto", instant)).toBe("2026-07-26");
  });
});

describe("addDays", () => {
  it("crosses month boundaries", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
  });

  it("handles leap days", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });
});

describe("forecastDates", () => {
  it("returns a contiguous run starting at the given date", () => {
    expect(forecastDates("2026-07-30", 3)).toEqual([
      "2026-07-30",
      "2026-07-31",
      "2026-08-01",
    ]);
  });
});

describe("isIsoDate", () => {
  it("accepts a real date", () => {
    expect(isIsoDate("2026-07-26")).toBe(true);
  });

  it("rejects a malformed or impossible date", () => {
    expect(isIsoDate("26-07-2026")).toBe(false);
    expect(isIsoDate("2026-02-30")).toBe(false);
  });
});
