import { describe, expect, it } from "vitest";
import type { DayWeather } from "../contracts";
import { recommend } from "./recommend";
import { HEARTY_CATEGORIES, LIGHT_CATEGORIES } from "./thresholds";

const baseWeather: DayWeather = {
  date: "2026-07-26",
  weatherCode: 3,
  tempMax: 22,
  tempMin: 14,
  precipitationProbability: 10,
  windSpeedMax: 12,
};

describe("recommend", () => {
  it("stays in when precipitation is likely and biases hearty food", () => {
    const result = recommend({ ...baseWeather, precipitationProbability: 84, weatherCode: 61 });
    expect(result.decision).toBe("stay-in");
    expect(result.preferredCategories).toEqual([...HEARTY_CATEGORIES]);
    expect(result.reason).toContain("84%");
  });

  it("stays in during a thunderstorm even when the probability is low", () => {
    expect(
      recommend({ ...baseWeather, weatherCode: 95, precipitationProbability: 5 }).decision,
    ).toBe("stay-in");
  });

  it("stays in when it snows", () => {
    expect(
      recommend({ ...baseWeather, weatherCode: 75, precipitationProbability: 5, tempMax: 12 })
        .decision,
    ).toBe("stay-in");
  });

  it("stays in when it is cold", () => {
    const result = recommend({ ...baseWeather, tempMax: 4 });
    expect(result.decision).toBe("stay-in");
    expect(result.reason).toContain("4°C");
  });

  it("stays in when it is very windy", () => {
    expect(recommend({ ...baseWeather, windSpeedMax: 55 }).decision).toBe("stay-in");
  });

  it("goes out with a heat caveat when it is hot", () => {
    const result = recommend({ ...baseWeather, tempMax: 34, weatherCode: 0 });
    expect(result.decision).toBe("go-out");
    expect(result.reason).toContain("shade");
    expect(result.reason).not.toContain("ideal for getting outside");
    expect(result.preferredCategories).toContain("Dessert");
  });

  it("goes out with a light bias when it is clear and comfortable", () => {
    const result = recommend({ ...baseWeather, weatherCode: 0, tempMax: 24 });
    expect(result.decision).toBe("go-out");
    expect(result.preferredCategories).toEqual([...LIGHT_CATEGORIES]);
  });

  it("goes out with no bias when conditions are unremarkable", () => {
    const result = recommend(baseWeather);
    expect(result.decision).toBe("go-out");
    expect(result.preferredCategories).toEqual([]);
  });

  it("prefers wet reason over cold when precipitation and low temperature overlap", () => {
    const result = recommend({
      ...baseWeather,
      precipitationProbability: 75,
      tempMax: 4,
    });
    expect(result.reason).toContain("75%");
    expect(result.reason).not.toContain("warm up");
  });

  it("prefers cold reason over windy when low temperature and strong wind overlap", () => {
    const result = recommend({
      ...baseWeather,
      tempMax: 4,
      windSpeedMax: 55,
    });
    expect(result.reason).toContain("4°C");
    expect(result.reason).toContain("warm up");
    expect(result.reason).not.toContain("Wind gusting");
  });

  it("prefers windy stay-in over hot go-out when strong wind and high temperature overlap", () => {
    const result = recommend({
      ...baseWeather,
      windSpeedMax: 55,
      tempMax: 34,
    });
    expect(result.decision).toBe("stay-in");
    expect(result.reason).toContain("Wind gusting");
    expect(result.reason).not.toContain("shade");
  });

  it("prefers wet stay-in over hot go-out during a thunderstorm with high temperature", () => {
    const result = recommend({
      ...baseWeather,
      weatherCode: 95,
      tempMax: 34,
      precipitationProbability: 5,
    });
    expect(result.decision).toBe("stay-in");
    expect(result.reason).toContain("5%");
    expect(result.reason).not.toContain("shade");
  });
});
