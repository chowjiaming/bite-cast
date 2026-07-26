import { describe, expect, it } from "vitest";
import { normalisePlanSearch, planQueryString, recoverPlanSearch } from "./search-params";

describe("recoverPlanSearch", () => {
  it("returns a valid search unchanged", () => {
    expect(recoverPlanSearch({ alcohol: true, q: "Paris" })).toEqual({
      alcohol: true,
      q: "Paris",
    });
  });

  it("drops an invalid date and keeps sibling filters", () => {
    expect(
      recoverPlanSearch({
        alcohol: true,
        q: "Paris",
        date: "26-07-2026",
        cuisine: "French",
      }),
    ).toEqual({ alcohol: true, q: "Paris", cuisine: "French" });
  });

  it("falls back to defaults when the whole payload is unusable", () => {
    expect(recoverPlanSearch(null)).toEqual({ alcohol: true });
  });
});

describe("normalisePlanSearch", () => {
  it("drops blank strings so they never reach the api", () => {
    expect(normalisePlanSearch({ alcohol: true, q: "   ", cuisine: "Italian" })).toEqual({
      alcohol: true,
      cuisine: "Italian",
    });
  });
});

describe("planQueryString", () => {
  it("omits the alcohol default", () => {
    expect(planQueryString({ alcohol: true, q: "Paris" })).toBe("q=Paris");
  });

  it("includes alcohol when it is switched off", () => {
    expect(planQueryString({ alcohol: false })).toBe("alcohol=false");
  });

  it("serialises every filter in a stable order", () => {
    const query = planQueryString({
      alcohol: true,
      q: "Paris",
      date: "2026-07-27",
      cuisine: "French",
      ingredient: "butter",
      diet: "vegetarian",
    });
    expect(query).toBe(
      "q=Paris&date=2026-07-27&cuisine=French&ingredient=butter&diet=vegetarian",
    );
  });

  it("returns an empty string for a default request", () => {
    expect(planQueryString({ alcohol: true })).toBe("");
  });
});
