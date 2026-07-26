import { describe, expect, it } from "vitest";
import { dayPlanSchema } from "./day-plan";

const validPlan = {
  place: {
    name: "Toronto",
    country: "Canada",
    latitude: 43.7,
    longitude: -79.4,
    timezone: "America/Toronto",
    source: "ip",
  },
  date: "2026-07-26",
  weather: {
    weatherCode: 61,
    description: "Slight rain",
    tempMax: 22.4,
    tempMin: 15.1,
    precipitationProbability: 84,
    windSpeedMax: 18,
  },
  outing: { decision: "stay-in", reason: "Rain likely." },
  meals: [],
  drink: null,
  meta: {
    generatedAt: "2026-07-26T12:00:00.000Z",
    sources: ["Open-Meteo"],
    relaxedFilters: [],
    warnings: [],
  },
};

describe("dayPlanSchema", () => {
  it("accepts a plan with no meals and no drink", () => {
    expect(dayPlanSchema.parse(validPlan).drink).toBeNull();
  });

  it("rejects an unknown outing decision", () => {
    const invalid = { ...validPlan, outing: { decision: "maybe", reason: "?" } };
    expect(dayPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a plan missing weather", () => {
    const { weather: _weather, ...rest } = validPlan;
    expect(dayPlanSchema.safeParse(rest).success).toBe(false);
  });
});
