import { z } from "zod";
import type { Meal, MealSummary } from "../contracts";
import { fetchJson } from "./http";
import { foldNumberedSlots, readSlot } from "./numbered-slots";

const BASE_URL = "https://www.themealdb.com/api/json/v1/1";
const MAX_INGREDIENT_SLOTS = 20;

const filterResponseSchema = z.object({
  meals: z
    .array(
      z.object({
        idMeal: z.string(),
        strMeal: z.string(),
        strMealThumb: z.string(),
      }),
    )
    .nullable(),
});

const lookupResponseSchema = z.object({
  meals: z
    .array(
      z.looseObject({
        idMeal: z.string(),
        strMeal: z.string(),
        strMealThumb: z.string(),
        strCategory: z.string().nullable().optional(),
        strArea: z.string().nullable().optional(),
        strInstructions: z.string().nullable().optional(),
        strTags: z.string().nullable().optional(),
        strSource: z.string().nullable().optional(),
      }),
    )
    .nullable(),
});

async function filterMeals(
  parameter: "a" | "i" | "c",
  value: string,
  fetchImpl?: typeof fetch,
): Promise<MealSummary[]> {
  const params = new URLSearchParams({ [parameter]: value });
  const body = await fetchJson({
    provider: "themealdb",
    url: `${BASE_URL}/filter.php?${params.toString()}`,
    schema: filterResponseSchema,
    fetchImpl,
  });

  return (body.meals ?? []).map((entry) => ({
    id: entry.idMeal,
    name: entry.strMeal,
    thumbnailUrl: entry.strMealThumb,
  }));
}

export const filterMealsByArea = (area: string, fetchImpl?: typeof fetch): Promise<MealSummary[]> =>
  filterMeals("a", area, fetchImpl);

export const filterMealsByIngredient = (
  ingredient: string,
  fetchImpl?: typeof fetch,
): Promise<MealSummary[]> => filterMeals("i", ingredient, fetchImpl);

export const filterMealsByCategory = (
  category: string,
  fetchImpl?: typeof fetch,
): Promise<MealSummary[]> => filterMeals("c", category, fetchImpl);

export async function lookupMeal(id: string, fetchImpl?: typeof fetch): Promise<Meal | null> {
  const params = new URLSearchParams({ i: id });
  const body = await fetchJson({
    provider: "themealdb",
    url: `${BASE_URL}/lookup.php?${params.toString()}`,
    schema: lookupResponseSchema,
    fetchImpl,
  });

  const raw = body.meals?.[0];
  if (raw === undefined) {
    return null;
  }

  const tags = readSlot(raw, "strTags");
  return {
    id: raw.idMeal,
    name: raw.strMeal,
    thumbnailUrl: raw.strMealThumb,
    category: readSlot(raw, "strCategory"),
    area: readSlot(raw, "strArea"),
    tags: tags === "" ? [] : tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    ingredients: foldNumberedSlots(raw, MAX_INGREDIENT_SLOTS),
    instructions: readSlot(raw, "strInstructions"),
    sourceUrl: readSlot(raw, "strSource") || null,
  };
}
