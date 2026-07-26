import type { DayWeather } from "../contracts";
import { THRESHOLDS, HEARTY_CATEGORIES, HOT_WEATHER_CATEGORIES, LIGHT_CATEGORIES } from "./thresholds";
import { CLEAR_CODES, SNOW_CODES, THUNDERSTORM_CODES, describeWeatherCode } from "./weather-codes";

export type Recommendation = {
  decision: "go-out" | "stay-in";
  reason: string;
  preferredCategories: string[];
};

const celsius = (value: number): string => `${Math.round(value)}°C`;

export function recommend(weather: DayWeather): Recommendation {
  const { weatherCode, tempMax, precipitationProbability, windSpeedMax } = weather;
  const conditions = describeWeatherCode(weatherCode);

  const wet =
    precipitationProbability >= THRESHOLDS.wetPrecipitationProbability ||
    THUNDERSTORM_CODES.has(weatherCode) ||
    SNOW_CODES.has(weatherCode);

  if (wet) {
    return {
      decision: "stay-in",
      reason: `${conditions} with a ${precipitationProbability}% chance of precipitation and a high of ${celsius(tempMax)} — a good day to cook something hearty indoors.`,
      preferredCategories: [...HEARTY_CATEGORIES],
    };
  }

  if (tempMax < THRESHOLDS.coldTempMaxC) {
    return {
      decision: "stay-in",
      reason: `${conditions} and only ${celsius(tempMax)} — warm up with something hearty at home.`,
      preferredCategories: [...HEARTY_CATEGORIES],
    };
  }

  if (windSpeedMax > THRESHOLDS.windyWindSpeedMaxKmh) {
    return {
      decision: "stay-in",
      reason: `Wind gusting to ${Math.round(windSpeedMax)} km/h — an indoor day.`,
      preferredCategories: [...HEARTY_CATEGORIES],
    };
  }

  if (tempMax > THRESHOLDS.hotTempMaxC) {
    return {
      decision: "go-out",
      reason: `${conditions} and ${celsius(tempMax)} — worth going out, but keep to the shade and eat light.`,
      preferredCategories: [...HOT_WEATHER_CATEGORIES],
    };
  }

  if (CLEAR_CODES.has(weatherCode) && tempMax >= THRESHOLDS.comfortableTempMinC) {
    return {
      decision: "go-out",
      reason: `${conditions} at ${celsius(tempMax)} — ideal for getting outside.`,
      preferredCategories: [...LIGHT_CATEGORIES],
    };
  }

  return {
    decision: "go-out",
    reason: `${conditions} at ${celsius(tempMax)} — nothing stopping you going out.`,
    preferredCategories: [],
  };
}
