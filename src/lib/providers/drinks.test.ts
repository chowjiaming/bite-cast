import { describe, expect, it, vi } from "vitest";
import filterFixture from "../../../tests/fixtures/cocktaildb-filter.json";
import lookupFixture from "../../../tests/fixtures/cocktaildb-lookup.json";
import { filterDrinks, lookupDrink } from "./drinks";

const respondWith = (body: unknown, status = 200): typeof fetch =>
  vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  ) as unknown as typeof fetch;

const urlOf = (fetchImpl: typeof fetch): string =>
  String(vi.mocked(fetchImpl).mock.calls[0]?.[0] ?? "");

describe("filterDrinks", () => {
  it("asks for alcoholic drinks", async () => {
    const fetchImpl = respondWith(filterFixture);
    const drinks = await filterDrinks(true, fetchImpl);
    expect(drinks[0]?.id).toBe("12560");
    expect(urlOf(fetchImpl)).toContain("filter.php?a=Alcoholic");
  });

  it("asks for non-alcoholic drinks", async () => {
    const fetchImpl = respondWith(filterFixture);
    await filterDrinks(false, fetchImpl);
    expect(urlOf(fetchImpl)).toContain("filter.php?a=Non_Alcoholic");
  });

  it("treats a null drinks array as no matches", async () => {
    expect(await filterDrinks(true, respondWith({ drinks: null }))).toEqual([]);
  });
});

describe("lookupDrink", () => {
  it("normalises ingredients and the alcoholic flag", async () => {
    const drink = await lookupDrink("12560", respondWith(lookupFixture));
    expect(drink).toEqual({
      id: "12560",
      name: "Afterglow",
      thumbnailUrl: "https://www.thecocktaildb.com/images/media/drink/vuquyv1468876052.jpg",
      alcoholic: false,
      ingredients: [
        { name: "Grenadine", measure: "1 part" },
        { name: "Orange juice", measure: "4 parts" },
      ],
      instructions: "Mix. Serve chilled.",
    });
  });

  it("returns null when the id is unknown", async () => {
    expect(await lookupDrink("0", respondWith({ drinks: null }))).toBeNull();
  });
});
