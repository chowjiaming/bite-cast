import { describe, expect, it, vi } from "vitest";
import type { Drink, Meal, MealSummary, PlanRequest } from "../contracts";
import { UpstreamError } from "../providers/http";
import type { Forecast } from "../providers/weather";
import { PlanError, buildDayPlan, type PlanDependencies } from "./build-day-plan";

const forecast: Forecast = {
  timezone: "Asia/Singapore",
  days: [
    {
      date: "2026-07-27",
      weatherCode: 61,
      tempMax: 30.5,
      tempMin: 27,
      precipitationProbability: 94,
      windSpeedMax: 14.2,
    },
    {
      date: "2026-07-28",
      weatherCode: 0,
      tempMax: 24,
      tempMin: 18,
      precipitationProbability: 5,
      windSpeedMax: 9,
    },
  ],
};

const summary = (id: string): MealSummary => ({
  id,
  name: `Meal ${id}`,
  thumbnailUrl: `${id}.jpg`,
});

const meal: Meal = {
  ...summary("1"),
  category: "Pasta",
  area: "Italian",
  tags: [],
  ingredients: [],
  instructions: "Cook.",
  sourceUrl: null,
};

const drink: Drink = {
  id: "12560",
  name: "Afterglow",
  thumbnailUrl: "afterglow.jpg",
  alcoholic: false,
  ingredients: [],
  instructions: "Mix.",
};

const request = (overrides: Partial<PlanRequest> = {}): PlanRequest => ({
  alcohol: true,
  ...overrides,
});

const makeDeps = (overrides: Partial<PlanDependencies> = {}): PlanDependencies => ({
  geocodeCity: vi.fn(async () => ({
    name: "Singapore",
    country: "Singapore",
    latitude: 1.29,
    longitude: 103.85,
    source: "search" as const,
  })),
  locateByIp: vi.fn(async () => ({
    name: "Toronto",
    country: "Canada",
    latitude: 43.7,
    longitude: -79.4,
    source: "ip" as const,
  })),
  fetchForecast: vi.fn(async () => forecast),
  filterMealsByArea: vi.fn(async () => [summary("1")]),
  filterMealsByIngredient: vi.fn(async () => [summary("1")]),
  filterMealsByCategory: vi.fn(async () => [summary("1")]),
  lookupMeal: vi.fn(async () => meal),
  filterDrinks: vi.fn(async () => [{ id: "12560", name: "Afterglow", thumbnailUrl: "a.jpg" }]),
  lookupDrink: vi.fn(async () => drink),
  now: () => new Date("2026-07-27T04:00:00Z"),
  random: () => 0,
  ...overrides,
});

describe("buildDayPlan", () => {
  it("builds a plan for a searched city and defaults to today in that time zone", async () => {
    const plan = await buildDayPlan({ request: request({ q: "Singapore" }), clientIp: null }, makeDeps());
    expect(plan.place.name).toBe("Singapore");
    expect(plan.place.timezone).toBe("Asia/Singapore");
    expect(plan.place.source).toBe("search");
    expect(plan.date).toBe("2026-07-27");
    expect(plan.weather.description).toBe("Slight rain");
    expect(plan.outing.decision).toBe("stay-in");
    expect(plan.meals).toHaveLength(1);
    expect(plan.drink?.name).toBe("Afterglow");
    expect(plan.meta.sources).toContain("Open-Meteo");
  });

  it("honours an explicit date inside the window", async () => {
    const plan = await buildDayPlan(
      { request: request({ q: "Singapore", date: "2026-07-28" }), clientIp: null },
      makeDeps(),
    );
    expect(plan.date).toBe("2026-07-28");
    expect(plan.outing.decision).toBe("go-out");
  });

  it("resolves the place from the ip when no city is given", async () => {
    const deps = makeDeps();
    const plan = await buildDayPlan({ request: request(), clientIp: "203.0.113.7" }, deps);
    expect(deps.locateByIp).toHaveBeenCalledWith("203.0.113.7");
    expect(plan.place.source).toBe("ip");
    expect(plan.meta.sources).toContain("ipwho.is");
  });

  it("raises place_not_found for an unknown city", async () => {
    const deps = makeDeps({ geocodeCity: vi.fn(async () => null) });
    await expect(
      buildDayPlan({ request: request({ q: "Nowhereville" }), clientIp: null }, deps),
    ).rejects.toMatchObject({ code: "place_not_found" });
  });

  it("raises location_required when the ip cannot be placed", async () => {
    const deps = makeDeps({ locateByIp: vi.fn(async () => null) });
    await expect(
      buildDayPlan({ request: request(), clientIp: "127.0.0.1" }, deps),
    ).rejects.toMatchObject({ code: "location_required" });
  });

  it("raises weather_unavailable when the forecast fails", async () => {
    const deps = makeDeps({
      fetchForecast: vi.fn(async () => {
        throw new UpstreamError("open-meteo", "http_error", "open-meteo returned 502");
      }),
    });
    await expect(
      buildDayPlan({ request: request({ q: "Singapore" }), clientIp: null }, deps),
    ).rejects.toMatchObject({ code: "weather_unavailable" });
  });

  it("raises upstream_timeout when the forecast times out", async () => {
    const deps = makeDeps({
      fetchForecast: vi.fn(async () => {
        throw new UpstreamError("open-meteo", "timeout", "open-meteo timed out");
      }),
    });
    await expect(
      buildDayPlan({ request: request({ q: "Singapore" }), clientIp: null }, deps),
    ).rejects.toMatchObject({ code: "upstream_timeout" });
  });

  it("raises invalid_request for a date outside the forecast window", async () => {
    await expect(
      buildDayPlan(
        { request: request({ q: "Singapore", date: "2026-09-01" }), clientIp: null },
        makeDeps(),
      ),
    ).rejects.toMatchObject({ code: "invalid_request" });
  });

  it("returns a plan with no drink and a warning when the drink lookup fails", async () => {
    const deps = makeDeps({
      filterDrinks: vi.fn(async () => {
        throw new UpstreamError("thecocktaildb", "http_error", "thecocktaildb returned 500");
      }),
    });
    const plan = await buildDayPlan({ request: request({ q: "Singapore" }), clientIp: null }, deps);
    expect(plan.drink).toBeNull();
    expect(plan.meta.warnings).toContain("Drink suggestions are temporarily unavailable.");
  });

  it("carries relaxed filters through to the payload", async () => {
    const deps = makeDeps({
      filterMealsByArea: vi.fn(async () => [summary("1")]),
      filterMealsByIngredient: vi.fn(async () => [summary("99")]),
    });
    const plan = await buildDayPlan(
      { request: request({ q: "Singapore", cuisine: "Italian", ingredient: "durian" }), clientIp: null },
      deps,
    );
    expect(plan.meta.relaxedFilters).toEqual(["ingredient"]);
  });

  it("throws PlanError instances so the handler can map them", async () => {
    const deps = makeDeps({ geocodeCity: vi.fn(async () => null) });
    await expect(
      buildDayPlan({ request: request({ q: "Nowhereville" }), clientIp: null }, deps),
    ).rejects.toBeInstanceOf(PlanError);
  });
});
