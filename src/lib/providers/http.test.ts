import { describe, expect, it } from "vitest";
import { z } from "zod";
import { UpstreamError, fetchJson } from "./http";

const schema = z.object({ ok: z.boolean() });
const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("fetchJson", () => {
  it("returns the parsed body", async () => {
    const result = await fetchJson({
      provider: "test",
      url: "https://example.test/ok",
      schema,
      fetchImpl: async () => jsonResponse({ ok: true }),
    });
    expect(result).toEqual({ ok: true });
  });

  it("raises http_error on a non-2xx response without leaking the body", async () => {
    const failure = fetchJson({
      provider: "test",
      url: "https://example.test/boom",
      schema,
      fetchImpl: async () => jsonResponse({ secret: "leak me" }, 503),
    });
    await expect(failure).rejects.toBeInstanceOf(UpstreamError);
    await expect(failure).rejects.toMatchObject({ kind: "http_error", provider: "test" });
    await expect(failure).rejects.not.toThrow(/leak me/);
  });

  it("raises invalid_body when the payload does not match the schema", async () => {
    const failure = fetchJson({
      provider: "test",
      url: "https://example.test/wrong",
      schema,
      fetchImpl: async () => jsonResponse({ ok: "yes" }),
    });
    await expect(failure).rejects.toMatchObject({ kind: "invalid_body" });
  });

  it("raises timeout when the request outlives its budget", async () => {
    const hangingFetch: typeof fetch = (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      });
    const failure = fetchJson({
      provider: "test",
      url: "https://example.test/slow",
      schema,
      timeoutMs: 10,
      fetchImpl: hangingFetch,
    });
    await expect(failure).rejects.toMatchObject({ kind: "timeout" });
  });

  it("raises network when the transport fails", async () => {
    const failure = fetchJson({
      provider: "test",
      url: "https://example.test/down",
      schema,
      fetchImpl: async () => {
        throw new TypeError("fetch failed");
      },
    });
    await expect(failure).rejects.toMatchObject({ kind: "network" });
  });
});
