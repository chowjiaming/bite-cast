import { z } from "zod";

export const dayWeatherSchema = z.object({
  date: z.string(),
  weatherCode: z.number().int(),
  tempMax: z.number(),
  tempMin: z.number(),
  precipitationProbability: z.number(),
  windSpeedMax: z.number(),
});
export type DayWeather = z.infer<typeof dayWeatherSchema>;

export const planWeatherSchema = dayWeatherSchema
  .omit({ date: true })
  .extend({ description: z.string() });
export type PlanWeather = z.infer<typeof planWeatherSchema>;

export const placeSchema = z.object({
  name: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  source: z.enum(["ip", "search"]),
});
export type Place = z.infer<typeof placeSchema>;

export const mealSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  thumbnailUrl: z.string(),
});
export type MealSummary = z.infer<typeof mealSummarySchema>;

const ingredientSchema = z.object({ name: z.string(), measure: z.string() });

export const mealSchema = mealSummarySchema.extend({
  category: z.string(),
  area: z.string(),
  tags: z.array(z.string()),
  ingredients: z.array(ingredientSchema),
  instructions: z.string(),
  sourceUrl: z.string().nullable(),
});
export type Meal = z.infer<typeof mealSchema>;

export const drinkSummarySchema = mealSummarySchema;
export type DrinkSummary = z.infer<typeof drinkSummarySchema>;

export const drinkSchema = mealSummarySchema.extend({
  alcoholic: z.boolean(),
  ingredients: z.array(ingredientSchema),
  instructions: z.string(),
});
export type Drink = z.infer<typeof drinkSchema>;

export const dayPlanSchema = z.object({
  place: placeSchema,
  date: z.string(),
  weather: planWeatherSchema,
  outing: z.object({
    decision: z.enum(["go-out", "stay-in"]),
    reason: z.string(),
  }),
  meals: z.array(mealSchema),
  drink: drinkSchema.nullable(),
  meta: z.object({
    generatedAt: z.string(),
    sources: z.array(z.string()),
    relaxedFilters: z.array(z.string()),
    warnings: z.array(z.string()),
  }),
});
export type DayPlan = z.infer<typeof dayPlanSchema>;
