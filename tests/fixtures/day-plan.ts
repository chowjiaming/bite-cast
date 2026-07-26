import type { DayPlan } from "@/lib/contracts";

export const dayPlanFixture: DayPlan = {
  place: {
    name: "Singapore",
    country: "Singapore",
    latitude: 1.29,
    longitude: 103.85,
    timezone: "Asia/Singapore",
    source: "search",
  },
  date: "2026-07-27",
  weather: {
    weatherCode: 61,
    description: "Slight rain",
    tempMax: 30.5,
    tempMin: 27,
    precipitationProbability: 94,
    windSpeedMax: 14.2,
  },
  outing: {
    decision: "stay-in",
    reason: "Slight rain with a 94% chance of precipitation and a high of 31°C — a good day to cook something hearty indoors.",
  },
  meals: [
    {
      id: "52961",
      name: "Budino Di Ricotta",
      thumbnailUrl: "https://www.themealdb.com/images/media/meals/1549542877.jpg",
      category: "Dessert",
      area: "Italian",
      tags: ["Pudding"],
      ingredients: [{ name: "Ricotta", measure: "500g" }],
      instructions: "Mash the ricotta and mix well with the sugar.",
      sourceUrl: "https://example.test/budino",
    },
  ],
  drink: {
    id: "12560",
    name: "Afterglow",
    thumbnailUrl: "https://www.thecocktaildb.com/images/media/drink/vuquyv1468876052.jpg",
    alcoholic: false,
    ingredients: [{ name: "Grenadine", measure: "1 part" }],
    instructions: "Mix. Serve chilled.",
  },
  meta: {
    generatedAt: "2026-07-27T04:00:00.000Z",
    sources: ["Open-Meteo", "Open-Meteo Geocoding", "TheMealDB", "TheCocktailDB"],
    relaxedFilters: [],
    warnings: [],
  },
};
