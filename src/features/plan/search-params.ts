import type { PlanRequest } from "@/lib/contracts";

const ORDERED_KEYS = ["q", "date", "cuisine", "ingredient", "diet"] as const;

const present = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? undefined : trimmed;
};

export function normalisePlanSearch(search: PlanRequest): PlanRequest {
  const cleaned: PlanRequest = { alcohol: search.alcohol };
  const q = present(search.q);
  if (q !== undefined) {
    cleaned.q = q;
  }
  const date = present(search.date);
  if (date !== undefined) {
    cleaned.date = date;
  }
  const cuisine = present(search.cuisine);
  if (cuisine !== undefined) {
    cleaned.cuisine = cuisine;
  }
  const ingredient = present(search.ingredient);
  if (ingredient !== undefined) {
    cleaned.ingredient = ingredient;
  }
  if (search.diet !== undefined) {
    cleaned.diet = search.diet;
  }
  return cleaned;
}

export function planQueryString(search: PlanRequest): string {
  const normalised = normalisePlanSearch(search);
  const params = new URLSearchParams();
  for (const key of ORDERED_KEYS) {
    const value = normalised[key];
    if (value !== undefined) {
      params.set(key, value);
    }
  }
  if (!normalised.alcohol) {
    params.set("alcohol", "false");
  }
  return params.toString();
}
