import { describe, expect, it, vi } from "vitest";
import type { Drink, Meal, MealSummary } from "../../src/lib/contracts";
import { PlanError, type PlanDependencies } from "../../src/lib/plan/build-day-plan";
import { createHandler } from "./plan";

const summary = (id: string): MealSummary => ({ id, name: `Meal ${id}`, thumbnailUrl: `${id}.jpg` });

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
  id: "1",
  name: "Afterglow",
  thumbnailUrl: "a.jpg",
  alcoholic: false,
  ingredients: [],
  instructions: "Mix.",
};

const makeDeps = (overrides: Partial<PlanDependencies> = {}): PlanDependencies => ({
  geocodeCity: vi.fn(async () => ({
    name: "Singapore",
    country: "Singapore",
    latitude: 1.29,
    longitude: 103.85,
    source: "search" as const,
  })),
  locateByIp: vi.fn(async () => null),
  fetchForecast: vi.fn(async () => ({
    timezone: "Asia/Singapore",
    days: [
      {
        date: "2026-07-27",
        weatherCode: 0,
        tempMax: 24,
        tempMin: 18,
        precipitationProbability: 5,
        windSpeedMax: 9,
      },
    ],
  })),
  filterMealsByArea: vi.fn(async () => [summary("1")]),
  filterMealsByIngredient: vi.fn(async () => [summary("1")]),
  filterMealsByCategory: vi.fn(async () => [summary("1")]),
  lookupMeal: vi.fn(async () => meal),
  filterDrinks: vi.fn(async () => [{ id: "1", name: "Afterglow", thumbnailUrl: "a.jpg" }]),
  lookupDrink: vi.fn(async () => drink),
  now: () => new Date("2026-07-27T04:00:00Z"),
  random: () => 0,
  ...overrides,
});

const get = (url: string, headers: Record<string, string> = {}): Request =>
  new Request(url, { headers });

describe("plan handler", () => {
  it("returns a plan for a valid request", async () => {
    const response = await createHandler(makeDeps())(
      get("https://bitecast.test/api/plan?q=Singapore"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.place.name).toBe("Singapore");
  });

  it("caches searched plans at the edge", async () => {
    const response = await createHandler(makeDeps())(
      get("https://bitecast.test/api/plan?q=Singapore"),
    );
    expect(response.headers.get("netlify-cdn-cache-control")).toContain("s-maxage=900");
  });

  it("never caches ip-resolved plans", async () => {
    const deps = makeDeps({
      locateByIp: vi.fn(async () => ({
        name: "Toronto",
        country: "Canada",
        latitude: 43.7,
        longitude: -79.4,
        source: "ip" as const,
      })),
    });
    const response = await createHandler(deps)(
      get("https://bitecast.test/api/plan", { "x-nf-client-connection-ip": "203.0.113.7" }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("passes the client ip header to the geolocation provider", async () => {
    const deps = makeDeps();
    await createHandler(deps)(
      get("https://bitecast.test/api/plan", { "x-nf-client-connection-ip": "203.0.113.7" }),
    );
    expect(deps.locateByIp).toHaveBeenCalledWith("203.0.113.7");
  });

  it("rejects a malformed date with 400 and issues", async () => {
    const response = await createHandler(makeDeps())(
      get("https://bitecast.test/api/plan?q=Singapore&date=26-07-2026"),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("invalid_request");
    expect(body.issues?.[0]?.path).toBe("date");
  });

  it("maps place_not_found to 404", async () => {
    const deps = makeDeps({ geocodeCity: vi.fn(async () => null) });
    const response = await createHandler(deps)(
      get("https://bitecast.test/api/plan?q=Nowhereville"),
    );
    expect(response.status).toBe(404);
  });

  it("maps location_required to 422", async () => {
    const response = await createHandler(makeDeps())(get("https://bitecast.test/api/plan"));
    expect(response.status).toBe(422);
    expect((await response.json()).error).toBe("location_required");
  });

  it("maps weather_unavailable to 502", async () => {
    const deps = makeDeps({
      fetchForecast: vi.fn(async () => {
        throw new PlanError("weather_unavailable", "nope");
      }),
    });
    const response = await createHandler(deps)(get("https://bitecast.test/api/plan?q=Singapore"));
    expect(response.status).toBe(502);
  });

  it("maps an unexpected failure to 500 without leaking the message", async () => {
    const deps = makeDeps({
      geocodeCity: vi.fn(async () => {
        throw new Error("connection string leaked");
      }),
    });
    const response = await createHandler(deps)(get("https://bitecast.test/api/plan?q=Singapore"));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("connection string");
  });

  it("rejects a non-GET request", async () => {
    const response = await createHandler(makeDeps())(
      new Request("https://bitecast.test/api/plan", { method: "POST" }),
    );
    expect(response.status).toBe(405);
  });
});
