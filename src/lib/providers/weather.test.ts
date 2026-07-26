import { describe, expect, it, vi } from "vitest";
import forecastFixture from "../../../tests/fixtures/open-meteo-forecast.json";
import { UpstreamError } from "./http";
import { fetchForecast, selectDay } from "./weather";

const respondWith = (body: unknown, status = 200): typeof fetch =>
  vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  ) as unknown as typeof fetch;

describe("fetchForecast", () => {
  it("maps the daily arrays into one row per day", async () => {
    const forecast = await fetchForecast(
      { latitude: 1.29, longitude: 103.85 },
      respondWith(forecastFixture),
    );
    expect(forecast.timezone).toBe("Asia/Singapore");
    expect(forecast.days).toHaveLength(3);
    expect(forecast.days[0]).toEqual({
      date: "2026-07-27",
      weatherCode: 51,
      tempMax: 30.5,
      tempMin: 27,
      precipitationProbability: 94,
      windSpeedMax: 14.2,
    });
  });

  it("treats a missing precipitation probability as zero", async () => {
    const forecast = await fetchForecast(
      { latitude: 1.29, longitude: 103.85 },
      respondWith(forecastFixture),
    );
    expect(forecast.days[1]?.precipitationProbability).toBe(0);
  });

  it("requests the coordinates with an automatic time zone", async () => {
    const fetchImpl = respondWith(forecastFixture);
    await fetchForecast({ latitude: 1.29, longitude: 103.85 }, fetchImpl);
    const [url] = vi.mocked(fetchImpl).mock.calls[0] ?? [];
    expect(String(url)).toContain("latitude=1.29");
    expect(String(url)).toContain("timezone=auto");
  });

  it("surfaces an upstream failure", async () => {
    await expect(
      fetchForecast({ latitude: 1, longitude: 1 }, respondWith({}, 502)),
    ).rejects.toBeInstanceOf(UpstreamError);
  });
});

describe("selectDay", () => {
  const forecast = {
    timezone: "Asia/Singapore",
    days: [
      {
        date: "2026-07-27",
        weatherCode: 51,
        tempMax: 30.5,
        tempMin: 27,
        precipitationProbability: 94,
        windSpeedMax: 14.2,
      },
    ],
  };

  it("finds the requested day", () => {
    expect(selectDay(forecast, "2026-07-27")?.weatherCode).toBe(51);
  });

  it("returns null for a day outside the window", () => {
    expect(selectDay(forecast, "2026-09-01")).toBeNull();
  });
});
