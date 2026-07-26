export const THRESHOLDS = {
  wetPrecipitationProbability: 60,
  coldTempMaxC: 10,
  windyWindSpeedMaxKmh: 40,
  hotTempMaxC: 30,
  comfortableTempMinC: 15,
} as const;

export const HEARTY_CATEGORIES = ["Pasta", "Beef", "Lamb", "Pork"] as const;
export const LIGHT_CATEGORIES = ["Seafood", "Side", "Starter", "Breakfast"] as const;
export const HOT_WEATHER_CATEGORIES = [
  "Seafood",
  "Side",
  "Starter",
  "Breakfast",
  "Dessert",
] as const;

/** Used when neither the weather nor the user narrows the field, so there is always a pool to draw from. */
export const DEFAULT_CATEGORIES = ["Chicken", "Vegetarian", "Pasta", "Seafood"] as const;
