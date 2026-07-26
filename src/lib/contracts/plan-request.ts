import { z } from "zod";
import { isIsoDate } from "../date";

export const DIETS = ["vegetarian", "vegan"] as const;
export const FORECAST_DAYS = 7;

const QUERY_KEYS = ["q", "date", "cuisine", "ingredient", "diet", "alcohol"] as const;

const booleanFromQuery = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

export const planRequestSchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  date: z.string().refine(isIsoDate, "expected a real YYYY-MM-DD date").optional(),
  cuisine: z.string().trim().min(1).max(40).optional(),
  ingredient: z.string().trim().min(1).max(40).optional(),
  diet: z.enum(DIETS).optional(),
  alcohol: booleanFromQuery.default(true),
});

export type PlanRequest = z.infer<typeof planRequestSchema>;

/** The city field is required at the point of search, unlike the optional `q` on a plan request. */
export const citySearchSchema = z.string().trim().min(1, "Enter a city").max(80);

export function planRequestFromSearchParams(params: URLSearchParams): Record<string, string> {
  const raw: Record<string, string> = {};
  for (const key of QUERY_KEYS) {
    const value = params.get(key);
    if (value !== null && value.trim() !== "") {
      raw[key] = value;
    }
  }
  return raw;
}
