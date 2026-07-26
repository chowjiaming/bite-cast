import { z } from "zod";
import { fetchJson } from "./http";

export type ResolvedPlace = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "ip" | "search";
};

const geocodingSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        country: z.string().optional(),
        latitude: z.number(),
        longitude: z.number(),
      }),
    )
    .optional(),
});

const ipLookupSchema = z.union([
  z.object({
    success: z.literal(true),
    city: z.string().nullable(),
    country: z.string().nullable().optional(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  z.object({ success: z.literal(false) }),
]);

export async function geocodeCity(
  query: string,
  fetchImpl?: typeof fetch,
): Promise<ResolvedPlace | null> {
  const params = new URLSearchParams({ name: query, count: "1", language: "en", format: "json" });
  const body = await fetchJson({
    provider: "open-meteo-geocoding",
    url: `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    schema: geocodingSchema,
    fetchImpl,
  });

  const first = body.results?.[0];
  if (first === undefined) {
    return null;
  }
  return {
    name: first.name,
    country: first.country ?? "",
    latitude: first.latitude,
    longitude: first.longitude,
    source: "search",
  };
}

export async function locateByIp(
  ip: string | null,
  fetchImpl?: typeof fetch,
): Promise<ResolvedPlace | null> {
  if (ip === null || ip.trim() === "") {
    return null;
  }

  const body = await fetchJson({
    provider: "ipwho.is",
    url: `https://ipwho.is/${encodeURIComponent(ip)}`,
    schema: ipLookupSchema,
    fetchImpl,
  });

  if (!body.success || body.city === null) {
    return null;
  }
  return {
    name: body.city,
    country: body.country ?? "",
    latitude: body.latitude,
    longitude: body.longitude,
    source: "ip",
  };
}
