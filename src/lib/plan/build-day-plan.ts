import {
  dayPlanSchema,
  type ApiErrorCode,
  type DayPlan,
  type Drink,
  type DrinkSummary,
  type PlanRequest,
} from "../contracts";
import { todayInTimeZone } from "../date";
import type { ResolvedPlace } from "../providers/geo";
import { UpstreamError } from "../providers/http";
import { selectDay, type Forecast } from "../providers/weather";
import { recommend } from "../recommend/recommend";
import { describeWeatherCode } from "../recommend/weather-codes";
import { selectMeals, type MealSelectionDeps } from "./select-meals";

export class PlanError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "PlanError";
  }
}

export type PlanDependencies = MealSelectionDeps & {
  geocodeCity: (query: string) => Promise<ResolvedPlace | null>;
  locateByIp: (ip: string | null) => Promise<ResolvedPlace | null>;
  fetchForecast: (coords: { latitude: number; longitude: number }) => Promise<Forecast>;
  filterDrinks: (alcoholic: boolean) => Promise<DrinkSummary[]>;
  lookupDrink: (id: string) => Promise<Drink | null>;
  now: () => Date;
};

export type BuildPlanInput = { request: PlanRequest; clientIp: string | null };

function mapGeocodeUpstreamError(error: UpstreamError): PlanError {
  if (error.kind === "timeout") {
    return new PlanError("upstream_timeout", "Place lookup timed out. Try again.");
  }
  return new PlanError("upstream_timeout", "Place lookup is temporarily unavailable. Try again.");
}

async function resolvePlace(input: BuildPlanInput, deps: PlanDependencies): Promise<ResolvedPlace> {
  if (input.request.q !== undefined) {
    try {
      const place = await deps.geocodeCity(input.request.q);
      if (place === null) {
        throw new PlanError("place_not_found", "No place matched that search.");
      }
      return place;
    } catch (error) {
      if (error instanceof UpstreamError) {
        throw mapGeocodeUpstreamError(error);
      }
      throw error;
    }
  }

  try {
    const place = await deps.locateByIp(input.clientIp);
    if (place === null) {
      throw new PlanError("location_required", "Could not place you from your connection.");
    }
    return place;
  } catch (error) {
    if (error instanceof UpstreamError) {
      throw new PlanError("location_required", "Could not place you from your connection.");
    }
    throw error;
  }
}

async function loadForecast(place: ResolvedPlace, deps: PlanDependencies): Promise<Forecast> {
  try {
    return await deps.fetchForecast({ latitude: place.latitude, longitude: place.longitude });
  } catch (error) {
    if (error instanceof UpstreamError) {
      throw new PlanError(
        error.kind === "timeout" ? "upstream_timeout" : "weather_unavailable",
        "The forecast is unavailable right now.",
      );
    }
    throw error;
  }
}

async function pickDrink(
  alcohol: boolean,
  deps: PlanDependencies,
): Promise<{ drink: Drink | null; warnings: string[] }> {
  try {
    const candidates = await deps.filterDrinks(alcohol);
    const chosen = candidates[Math.floor(deps.random() * candidates.length)];
    if (chosen === undefined) {
      return { drink: null, warnings: [] };
    }
    return { drink: await deps.lookupDrink(chosen.id), warnings: [] };
  } catch (error) {
    if (error instanceof UpstreamError) {
      return { drink: null, warnings: ["Drink suggestions are temporarily unavailable."] };
    }
    throw error;
  }
}

export async function buildDayPlan(
  input: BuildPlanInput,
  deps: PlanDependencies,
): Promise<DayPlan> {
  const place = await resolvePlace(input, deps);
  const forecast = await loadForecast(place, deps);

  const date = input.request.date ?? todayInTimeZone(forecast.timezone, deps.now());
  const weather = selectDay(forecast, date);
  if (weather === null) {
    throw new PlanError("invalid_request", `${date} is outside the available forecast window.`);
  }

  const recommendation = recommend(weather);
  const [mealSelection, drinkResult] = await Promise.all([
    selectMeals(input.request, recommendation.preferredCategories, deps),
    pickDrink(input.request.alcohol, deps),
  ]);

  const plan: DayPlan = {
    place: { ...place, timezone: forecast.timezone },
    date,
    weather: {
      weatherCode: weather.weatherCode,
      description: describeWeatherCode(weather.weatherCode),
      tempMax: weather.tempMax,
      tempMin: weather.tempMin,
      precipitationProbability: weather.precipitationProbability,
      windSpeedMax: weather.windSpeedMax,
    },
    outing: { decision: recommendation.decision, reason: recommendation.reason },
    meals: mealSelection.meals,
    drink: drinkResult.drink,
    meta: {
      generatedAt: deps.now().toISOString(),
      sources: [
        "Open-Meteo",
        place.source === "ip" ? "ipwho.is" : "Open-Meteo Geocoding",
        "TheMealDB",
        "TheCocktailDB",
      ],
      relaxedFilters: mealSelection.relaxedFilters,
      warnings: [...mealSelection.warnings, ...drinkResult.warnings],
    },
  };

  return dayPlanSchema.parse(plan);
}
