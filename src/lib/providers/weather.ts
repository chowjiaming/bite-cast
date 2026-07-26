import { z } from "zod";
import { FORECAST_DAYS, type DayWeather } from "../contracts";
import { fetchJson } from "./http";

export type Forecast = { timezone: string; days: DayWeather[] };

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "wind_speed_10m_max",
] as const;

const numbers = z.array(z.number().nullable());

const forecastResponseSchema = z.object({
  timezone: z.string(),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: numbers,
    temperature_2m_min: numbers,
    precipitation_probability_max: numbers,
    wind_speed_10m_max: numbers,
  }),
});

const orZero = (value: number | null | undefined): number => value ?? 0;

export async function fetchForecast(
  coords: { latitude: number; longitude: number },
  fetchImpl?: typeof fetch,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    daily: DAILY_FIELDS.join(","),
    timezone: "auto",
    forecast_days: String(FORECAST_DAYS),
  });

  const body = await fetchJson({
    provider: "open-meteo",
    url: `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    schema: forecastResponseSchema,
    fetchImpl,
  });

  const { daily } = body;
  const days = daily.time.map((date, index) => ({
    date,
    weatherCode: daily.weather_code[index] ?? 0,
    tempMax: orZero(daily.temperature_2m_max[index]),
    tempMin: orZero(daily.temperature_2m_min[index]),
    precipitationProbability: orZero(daily.precipitation_probability_max[index]),
    windSpeedMax: orZero(daily.wind_speed_10m_max[index]),
  }));

  return { timezone: body.timezone, days };
}

export function selectDay(forecast: Forecast, dateIso: string): DayWeather | null {
  return forecast.days.find((day) => day.date === dateIso) ?? null;
}
