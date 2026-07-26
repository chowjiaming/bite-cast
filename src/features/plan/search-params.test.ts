import { describe, expect, it } from "vitest";
import { normalisePlanSearch, planQueryString } from "./search-params";

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
