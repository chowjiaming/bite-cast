import { z } from "zod";

export const API_ERROR_CODES = [
  "invalid_request",
  "place_not_found",
  "location_required",
  "weather_unavailable",
  "upstream_timeout",
  "internal_error",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export const apiErrorSchema = z.object({
  error: z.enum(API_ERROR_CODES),
  message: z.string(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;
