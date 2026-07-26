import { describe, expect, it } from "vitest";
import type { MealSummary } from "../contracts";
import {
  chooseSample,
  intersectMealSets,
  nextRelaxation,
  preferredPool,
  unionMealSets,
} from "./meal-selection";

const meal = (id: string): MealSummary => ({ id, name: `Meal ${id}`, thumbnailUrl: `${id}.jpg` });

describe("intersectMealSets", () => {
  it("keeps only meals present in every set", () => {
    const result = intersectMealSets([
      [meal("1"), meal("2"), meal("3")],
      [meal("2"), meal("3")],
      [meal("3")],
    ]);
    expect(result.map((entry) => entry.id)).toEqual(["3"]);
  });

  it("returns the single set unchanged", () => {
    expect(intersectMealSets([[meal("1")]]).map((entry) => entry.id)).toEqual(["1"]);
  });

  it("returns nothing when given no sets", () => {
    expect(intersectMealSets([])).toEqual([]);
  });
});

describe("unionMealSets", () => {
  it("merges sets and de-duplicates by id", () => {
    const result = unionMealSets([[meal("1"), meal("2")], [meal("2"), meal("3")]]);
    expect(result.map((entry) => entry.id)).toEqual(["1", "2", "3"]);
  });
});

describe("preferredPool", () => {
  it("narrows to preferred meals when there are any", () => {
    const result = preferredPool([meal("1"), meal("2")], new Set(["2"]));
    expect(result.map((entry) => entry.id)).toEqual(["2"]);
  });

  it("falls back to every candidate when none is preferred", () => {
    const result = preferredPool([meal("1"), meal("2")], new Set(["9"]));
    expect(result.map((entry) => entry.id)).toEqual(["1", "2"]);
  });
});

describe("chooseSample", () => {
  it("takes the leading items with a zero random source", () => {
    const result = chooseSample([meal("1"), meal("2"), meal("3")], 2, () => 0);
    expect(result.map((entry) => entry.id)).toEqual(["1", "2"]);
  });

  it("never returns more than the pool holds", () => {
    expect(chooseSample([meal("1")], 3, () => 0)).toHaveLength(1);
  });

  it("does not mutate the input", () => {
    const items = [meal("1"), meal("2")];
    chooseSample(items, 1, () => 0);
    expect(items).toHaveLength(2);
  });
});

describe("nextRelaxation", () => {
  it("drops ingredient before cuisine", () => {
    expect(nextRelaxation(["cuisine", "ingredient", "diet"])).toBe("ingredient");
  });

  it("drops cuisine when no ingredient is set", () => {
    expect(nextRelaxation(["cuisine", "diet"])).toBe("cuisine");
  });

  it("never drops diet", () => {
    expect(nextRelaxation(["diet"])).toBeNull();
  });
});
