const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export const SNOW_CODES: ReadonlySet<number> = new Set([71, 73, 75, 77, 85, 86]);
export const THUNDERSTORM_CODES: ReadonlySet<number> = new Set([95, 96, 99]);
export const CLEAR_CODES: ReadonlySet<number> = new Set([0, 1]);

export function describeWeatherCode(code: number): string {
  return WMO_DESCRIPTIONS[code] ?? "Unsettled conditions";
}
