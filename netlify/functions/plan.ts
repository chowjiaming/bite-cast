import type { Config } from "@netlify/functions";
import type { ApiErrorBody, ApiErrorCode } from "../../src/lib/contracts";
import { planRequestFromSearchParams, planRequestSchema } from "../../src/lib/contracts";
import { PlanError, buildDayPlan, type PlanDependencies } from "../../src/lib/plan/build-day-plan";
import { createLiveDependencies } from "../../src/lib/plan/live-dependencies";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  invalid_request: 400,
  place_not_found: 404,
  location_required: 422,
  weather_unavailable: 502,
  upstream_timeout: 504,
  internal_error: 500,
};

const CACHEABLE_HEADERS = {
  "cache-control": "public, max-age=0, must-revalidate",
  "netlify-cdn-cache-control": "public, s-maxage=900, stale-while-revalidate=3600",
};

const PRIVATE_HEADERS = { "cache-control": "private, no-store" };

const jsonResponse = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

const errorResponse = (code: ApiErrorCode, message: string, issues?: ApiErrorBody["issues"]) =>
  jsonResponse(
    issues === undefined ? { error: code, message } : { error: code, message, issues },
    STATUS_BY_CODE[code],
    PRIVATE_HEADERS,
  );

export function createHandler(deps: PlanDependencies) {
  return async function handler(request: Request): Promise<Response> {
    if (request.method !== "GET") {
      return jsonResponse({ error: "invalid_request", message: "Use GET." }, 405, PRIVATE_HEADERS);
    }

    const url = new URL(request.url);
    const parsed = planRequestSchema.safeParse(planRequestFromSearchParams(url.searchParams));
    if (!parsed.success) {
      return errorResponse(
        "invalid_request",
        "Some search parameters were not understood.",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      );
    }

    try {
      const plan = await buildDayPlan(
        {
          request: parsed.data,
          clientIp: request.headers.get("x-nf-client-connection-ip"),
        },
        deps,
      );
      return jsonResponse(plan, 200, plan.place.source === "ip" ? PRIVATE_HEADERS : CACHEABLE_HEADERS);
    } catch (error) {
      if (error instanceof PlanError) {
        return errorResponse(error.code, error.message);
      }
      return errorResponse("internal_error", "Something went wrong building the plan.");
    }
  };
}

export default createHandler(createLiveDependencies());

export const config: Config = { path: "/api/plan" };
