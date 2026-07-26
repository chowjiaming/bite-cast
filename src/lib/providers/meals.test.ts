import { describe, expect, it, vi } from "vitest";
import filterFixture from "../../../tests/fixtures/mealdb-filter.json";
import emptyFixture from "../../../tests/fixtures/mealdb-empty.json";
import lookupFixture from "../../../tests/fixtures/mealdb-lookup.json";
import {
  filterMealsByArea,
  filterMealsByCategory,
  filterMealsByIngredient,
  lookupMeal,
} from "./meals";

const respondWith = (body: unknown, status = 200): typeof fetch =>
  vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  ) as unknown as typeof fetch;

const urlOf = (fetchImpl: typeof fetch): string =>
  String(vi.mocked(fetchImpl).mock.calls[0]?.[0] ?? "");

describe("meal filters", () => {
  it("maps summaries and sends only the area parameter", async () => {
    const fetchImpl = respondWith(filterFixture);
    const meals = await filterMealsByArea("Italian", fetchImpl);
    expect(meals[0]).toEqual({
      id: "52961",
      name: "Budino Di Ricotta",
      thumbnailUrl: "https://www.themealdb.com/images/media/meals/1549542877.jpg",
    });
    expect(urlOf(fetchImpl)).toContain("filter.php?a=Italian");
    expect(urlOf(fetchImpl)).not.toContain("&i=");
  });

  it("sends only the ingredient parameter", async () => {
    const fetchImpl = respondWith(filterFixture);
    await filterMealsByIngredient("chicken breast", fetchImpl);
    expect(urlOf(fetchImpl)).toContain("filter.php?i=chicken+breast");
  });

  it("sends only the category parameter", async () => {
    const fetchImpl = respondWith(filterFixture);
    await filterMealsByCategory("Vegetarian", fetchImpl);
    expect(urlOf(fetchImpl)).toContain("filter.php?c=Vegetarian");
  });

  it("treats a null meals array as no matches", async () => {
    expect(await filterMealsByArea("Atlantean", respondWith(emptyFixture))).toEqual([]);
  });
});

describe("lookupMeal", () => {
  it("normalises ingredients, tags and the source url", async () => {
    const meal = await lookupMeal("52961", respondWith(lookupFixture));
    expect(meal).toEqual({
      id: "52961",
      name: "Budino Di Ricotta",
      thumbnailUrl: "https://www.themealdb.com/images/media/meals/1549542877.jpg",
      category: "Dessert",
      area: "Italian",
      tags: ["Pudding", "Baking"],
      ingredients: [
        { name: "Ricotta", measure: "500g" },
        { name: "Sugar", measure: "100g" },
      ],
      instructions: "Mash the ricotta and mix well with the sugar.",
      sourceUrl: "https://example.test/budino",
    });
  });

  it("returns null when the id is unknown", async () => {
    expect(await lookupMeal("0", respondWith(emptyFixture))).toBeNull();
  });
});
