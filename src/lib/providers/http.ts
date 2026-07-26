import type { z } from "zod";

export type UpstreamFailureKind = "timeout" | "http_error" | "network" | "invalid_body";

/** Carries no upstream body: responses may contain data we must not log or forward. */
export class UpstreamError extends Error {
  constructor(
    readonly provider: string,
    readonly kind: UpstreamFailureKind,
    message: string,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

export const UPSTREAM_TIMEOUT_MS = 4000;

type FetchJsonOptions<T> = {
  provider: string;
  url: string;
  schema: z.ZodType<T>;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

export async function fetchJson<T>({
  provider,
  url,
  schema,
  timeoutMs = UPSTREAM_TIMEOUT_MS,
  fetchImpl = fetch,
}: FetchJsonOptions<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
  } catch {
    const timedOut = controller.signal.aborted;
    throw new UpstreamError(
      provider,
      timedOut ? "timeout" : "network",
      timedOut ? `${provider} timed out after ${timeoutMs}ms` : `${provider} was unreachable`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new UpstreamError(provider, "http_error", `${provider} returned ${response.status}`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new UpstreamError(provider, "invalid_body", `${provider} returned malformed JSON`);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new UpstreamError(provider, "invalid_body", `${provider} returned an unexpected shape`);
  }
  return parsed.data;
}
