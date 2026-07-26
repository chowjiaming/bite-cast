import {
  apiErrorSchema,
  dayPlanSchema,
  type ApiErrorCode,
  type DayPlan,
  type PlanRequest,
} from "@/lib/contracts";
import { planQueryString } from "./search-params";

const MAX_RETRIES = 1;

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function planQueryKey(search: PlanRequest): readonly ["plan", string] {
  return ["plan", planQueryString(search)] as const;
}

export async function fetchDayPlan(
  search: PlanRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<DayPlan> {
  const query = planQueryString(search);
  const response = await fetchImpl(`/api/plan${query === "" ? "" : `?${query}`}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const parsed = apiErrorSchema.safeParse(body);
    throw parsed.success
      ? new ApiError(parsed.data.error, response.status, parsed.data.message)
      : new ApiError("internal_error", response.status, "The server response was unreadable.");
  }

  const parsed = dayPlanSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    throw new ApiError("internal_error", response.status, "The plan payload was malformed.");
  }
  return parsed.data;
}

export function shouldRetryPlan(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) {
    return false;
  }
  return error instanceof ApiError ? error.status >= 500 : true;
}
