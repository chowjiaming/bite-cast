import { describe, expect, it, vi } from "vitest";
import type { Meal, MealSummary, PlanRequest } from "../contracts";
import { UpstreamError } from "../providers/http";
import { selectMeals, type MealSelectionDeps } from "./select-meals";

const summary = (id: string): MealSummary => ({
  id,
  name: `Meal ${id}`,
  thumbnailUrl: `${id}.jpg`,
});

const fullMeal = (id: string): Meal => ({
  ...summary(id),
  category: "Pasta",
  area: "Italian",
  tags: [],
  ingredients: [{ name: "Tomato", measure: "2" }],
  instructions: "Cook.",
  sourceUrl: null,
});

const request = (overrides: Partial<PlanRequest> = {}): PlanRequest => ({
  alcohol: true,
  ...overrides,
});

const makeDeps = (overrides: Partial<MealSelectionDeps> = {}): MealSelectionDeps => ({
  filterMealsByArea: vi.fn(async () => [summary("1"), summary("2")]),
  filterMealsByIngredient: vi.fn(async () => [summary("2"), summary("3")]),
  filterMealsByCategory: vi.fn(async () => [summary("2")]),
  lookupMeal: vi.fn(async (id: string) => fullMeal(id)),
  random: () => 0,
  ...overrides,
});

describe("selectMeals", () => {
  it("intersects the active user filters", async () => {
    const deps = makeDeps();
    const result = await selectMeals(
      request({ cuisine: "Italian", ingredient: "tomato" }),
      [],
      deps,
    );
    expect(result.meals.map((meal) => meal.id)).toEqual(["2"]);
    expect(result.relaxedFilters).toEqual([]);
  });

  it("draws from the weather-preferred categories when no filter is set", async () => {
    const filterMealsByCategory = vi.fn(async (category: string) =>
      category === "Pasta" ? [summary("7")] : [],
    );
    const result = await selectMeals(request(), ["Pasta"], makeDeps({ filterMealsByCategory }));
    expect(filterMealsByCategory).toHaveBeenCalledWith("Pasta");
    expect(result.meals.map((meal) => meal.id)).toEqual(["7"]);
  });

  it("falls back to the default categories when there is no bias and no filter", async () => {
    const filterMealsByCategory = vi.fn(async () => [summary("9")]);
    await selectMeals(request(), [], makeDeps({ filterMealsByCategory }));
    expect(filterMealsByCategory).toHaveBeenCalledWith("Chicken");
  });

  it("relaxes the ingredient filter when the intersection is empty", async () => {
    const deps = makeDeps({
      filterMealsByArea: vi.fn(async () => [summary("1")]),
      filterMealsByIngredient: vi.fn(async () => [summary("42")]),
    });
    const result = await selectMeals(
      request({ cuisine: "Italian", ingredient: "durian" }),
      [],
      deps,
    );
    expect(result.relaxedFilters).toEqual(["ingredient"]);
    expect(result.meals.map((meal) => meal.id)).toEqual(["1"]);
  });

  it("never relaxes the diet filter", async () => {
    const result = await selectMeals(
      request({ diet: "vegan" }),
      [],
      makeDeps({ filterMealsByCategory: vi.fn(async () => []) }),
    );
    expect(result.relaxedFilters).toEqual([]);
    expect(result.meals).toEqual([]);
    expect(result.warnings).toHaveLength(1);
  });

  it("returns at most two meals", async () => {
    const many = [summary("1"), summary("2"), summary("3"), summary("4")];
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      [],
      makeDeps({ filterMealsByArea: vi.fn(async () => many) }),
    );
    expect(result.meals).toHaveLength(2);
  });

  it("does not narrow an explicit filter by the default categories", async () => {
    const filterMealsByCategory = vi.fn(async () => [summary("2")]);
    const many = [summary("1"), summary("2"), summary("3")];
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      [],
      makeDeps({ filterMealsByArea: vi.fn(async () => many), filterMealsByCategory }),
    );
    expect(filterMealsByCategory).not.toHaveBeenCalled();
    expect(result.meals).toHaveLength(2);
  });

  it("falls back to the default pool when relaxation drops the last filter", async () => {
    const filterMealsByCategory = vi.fn(async () => [summary("9")]);
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      [],
      makeDeps({ filterMealsByArea: vi.fn(async () => []), filterMealsByCategory }),
    );
    expect(result.relaxedFilters).toEqual(["cuisine"]);
    expect(filterMealsByCategory).toHaveBeenCalledWith("Chicken");
    expect(result.meals.map((meal) => meal.id)).toEqual(["9"]);
  });

  it("still ranks by the weather bias when the user has filtered", async () => {
    const filterMealsByCategory = vi.fn(async () => [summary("3")]);
    const many = [summary("1"), summary("2"), summary("3")];
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      ["Pasta"],
      makeDeps({ filterMealsByArea: vi.fn(async () => many), filterMealsByCategory }),
    );
    expect(filterMealsByCategory).toHaveBeenCalledWith("Pasta");
    expect(result.meals.map((meal) => meal.id)).toEqual(["3"]);
  });

  it("warns when some recipe details fail to load", async () => {
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      [],
      makeDeps({
        filterMealsByArea: vi.fn(async () => [summary("1"), summary("2")]),
        lookupMeal: vi.fn(async (id: string) => (id === "1" ? fullMeal(id) : null)),
      }),
    );
    expect(result.meals).toHaveLength(1);
    expect(result.warnings).toContain("Some recipe details were unavailable.");
  });

  it("degrades to a warning when the recipe API fails", async () => {
    const result = await selectMeals(
      request({ cuisine: "Italian" }),
      [],
      makeDeps({
        filterMealsByArea: vi.fn(async () => {
          throw new UpstreamError("themealdb", "http_error", "themealdb returned 503");
        }),
      }),
    );
    expect(result.meals).toEqual([]);
    expect(result.warnings).toEqual(["Recipe suggestions are temporarily unavailable."]);
  });
});
