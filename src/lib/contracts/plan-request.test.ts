import { describe, expect, it } from "vitest";
import { planRequestFromSearchParams, planRequestSchema } from "./plan-request";

describe("planRequestSchema", () => {
  it("defaults alcohol to true and leaves everything else optional", () => {
    expect(planRequestSchema.parse({})).toEqual({ alcohol: true });
  });

  it("coerces the alcohol query string", () => {
    expect(planRequestSchema.parse({ alcohol: "false" }).alcohol).toBe(false);
    expect(planRequestSchema.parse({ alcohol: "true" }).alcohol).toBe(true);
  });

  it("trims a city query", () => {
    expect(planRequestSchema.parse({ q: "  Paris " }).q).toBe("Paris");
  });

  it("rejects an unknown diet", () => {
    expect(planRequestSchema.safeParse({ diet: "keto" }).success).toBe(false);
  });

  it("rejects a malformed date", () => {
    expect(planRequestSchema.safeParse({ date: "26-07-2026" }).success).toBe(false);
    expect(planRequestSchema.safeParse({ date: "2026-02-30" }).success).toBe(false);
  });
});

describe("planRequestFromSearchParams", () => {
  it("keeps known keys and drops blank ones", () => {
    const params = new URLSearchParams("q=Paris&ingredient=&diet=vegan&nope=1");
    expect(planRequestFromSearchParams(params)).toEqual({ q: "Paris", diet: "vegan" });
  });
});
