import { describe, expect, it, vi } from "vitest";
import { dayPlanFixture } from "../../../tests/fixtures/day-plan";
import { ApiError, fetchDayPlan, planQueryKey, shouldRetryPlan } from "./api";

const respondWith = (body: unknown, status = 200): typeof fetch =>
  vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  ) as unknown as typeof fetch;

describe("fetchDayPlan", () => {
  it("requests /api/plan with the serialised search", async () => {
    const fetchImpl = respondWith(dayPlanFixture);
    await fetchDayPlan({ alcohol: true, q: "Singapore" }, fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith("/api/plan?q=Singapore", expect.anything());
  });

  it("returns the validated plan", async () => {
    const plan = await fetchDayPlan({ alcohol: true }, respondWith(dayPlanFixture));
    expect(plan.place.name).toBe("Singapore");
  });

  it("throws a typed ApiError for a known error body", async () => {
    const failure = fetchDayPlan(
      { alcohol: true, q: "Nowhereville" },
      respondWith({ error: "place_not_found", message: "No place matched." }, 404),
    );
    await expect(failure).rejects.toBeInstanceOf(ApiError);
    await expect(failure).rejects.toMatchObject({ code: "place_not_found", status: 404 });
  });

  it("throws internal_error when the error body is unreadable", async () => {
    const failure = fetchDayPlan({ alcohol: true }, respondWith("not json at all", 500));
    await expect(failure).rejects.toMatchObject({ code: "internal_error" });
  });

  it("throws internal_error when a 200 body does not match the contract", async () => {
    const failure = fetchDayPlan({ alcohol: true }, respondWith({ place: {} }));
    await expect(failure).rejects.toMatchObject({ code: "internal_error" });
  });
});

describe("shouldRetryPlan", () => {
  it("retries a server failure once", () => {
    const error = new ApiError("weather_unavailable", 502, "nope");
    expect(shouldRetryPlan(0, error)).toBe(true);
    expect(shouldRetryPlan(1, error)).toBe(false);
  });

  it("never retries a client failure", () => {
    expect(shouldRetryPlan(0, new ApiError("location_required", 422, "nope"))).toBe(false);
  });

  it("retries an unknown failure once", () => {
    expect(shouldRetryPlan(0, new Error("offline"))).toBe(true);
  });
});

describe("planQueryKey", () => {
  it("keys on the serialised search so identical searches share a cache entry", () => {
    expect(planQueryKey({ alcohol: true, q: "Paris" })).toEqual(["plan", "q=Paris"]);
  });
});
