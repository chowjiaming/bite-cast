import { describe, expect, it, vi } from "vitest";
import geocoding from "../../../tests/fixtures/open-meteo-geocoding.json";
import ipSuccess from "../../../tests/fixtures/ipwho-success.json";
import ipFailure from "../../../tests/fixtures/ipwho-failure.json";
import { UpstreamError } from "./http";
import { geocodeCity, locateByIp } from "./geo";

const respondWith = (body: unknown, status = 200): typeof fetch =>
  vi.fn(async () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    }),
  ) as unknown as typeof fetch;

describe("geocodeCity", () => {
  it("maps the first result onto a place tagged as a search", async () => {
    const place = await geocodeCity("Singapore", respondWith(geocoding));
    expect(place).toEqual({
      name: "Singapore",
      country: "Singapore",
      latitude: 1.28967,
      longitude: 103.85007,
      source: "search",
    });
  });

  it("returns null when the city is unknown", async () => {
    expect(await geocodeCity("Nowhereville", respondWith({}))).toBeNull();
  });

  it("encodes the query into the request URL", async () => {
    const fetchImpl = respondWith(geocoding);
    await geocodeCity("São Paulo", fetchImpl);
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("name=S%C3%A3o+Paulo"),
      expect.anything(),
    );
  });

  it("surfaces an upstream failure", async () => {
    await expect(geocodeCity("Singapore", respondWith({}, 500))).rejects.toBeInstanceOf(
      UpstreamError,
    );
  });
});

describe("locateByIp", () => {
  it("maps a successful lookup onto a place tagged as ip", async () => {
    const place = await locateByIp("203.0.113.7", respondWith(ipSuccess));
    expect(place).toEqual({
      name: "Toronto",
      country: "Canada",
      latitude: 43.7064895,
      longitude: -79.3986647,
      source: "ip",
    });
  });

  it("returns null when the provider reports failure", async () => {
    expect(await locateByIp("127.0.0.1", respondWith(ipFailure))).toBeNull();
  });

  it("returns null without calling out when there is no ip", async () => {
    const fetchImpl = respondWith(ipSuccess);
    expect(await locateByIp(null, fetchImpl)).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
