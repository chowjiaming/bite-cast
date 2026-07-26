import { z } from "zod";
import type { Drink, DrinkSummary } from "../contracts";
import { fetchJson } from "./http";
import { foldNumberedSlots, readSlot } from "./numbered-slots";

const BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";
const MAX_INGREDIENT_SLOTS = 15;

const filterResponseSchema = z.object({
  drinks: z
    .array(
      z.object({
        idDrink: z.string(),
        strDrink: z.string(),
        strDrinkThumb: z.string(),
      }),
    )
    .nullable(),
});

const lookupResponseSchema = z.object({
  drinks: z
    .array(
      z.looseObject({
        idDrink: z.string(),
        strDrink: z.string(),
        strDrinkThumb: z.string(),
        strAlcoholic: z.string().nullable().optional(),
        strInstructions: z.string().nullable().optional(),
      }),
    )
    .nullable(),
});

export async function filterDrinks(
  alcoholic: boolean,
  fetchImpl?: typeof fetch,
): Promise<DrinkSummary[]> {
  const params = new URLSearchParams({ a: alcoholic ? "Alcoholic" : "Non_Alcoholic" });
  const body = await fetchJson({
    provider: "thecocktaildb",
    url: `${BASE_URL}/filter.php?${params.toString()}`,
    schema: filterResponseSchema,
    fetchImpl,
  });

  return (body.drinks ?? []).map((entry) => ({
    id: entry.idDrink,
    name: entry.strDrink,
    thumbnailUrl: entry.strDrinkThumb,
  }));
}

export async function lookupDrink(id: string, fetchImpl?: typeof fetch): Promise<Drink | null> {
  const params = new URLSearchParams({ i: id });
  const body = await fetchJson({
    provider: "thecocktaildb",
    url: `${BASE_URL}/lookup.php?${params.toString()}`,
    schema: lookupResponseSchema,
    fetchImpl,
  });

  const raw = body.drinks?.[0];
  if (raw === undefined) {
    return null;
  }

  return {
    id: raw.idDrink,
    name: raw.strDrink,
    thumbnailUrl: raw.strDrinkThumb,
    alcoholic: readSlot(raw, "strAlcoholic").toLowerCase() === "alcoholic",
    ingredients: foldNumberedSlots(raw, MAX_INGREDIENT_SLOTS),
    instructions: readSlot(raw, "strInstructions"),
  };
}
