import { describe, expect, it } from "vitest";
import { foldNumberedSlots, readSlot } from "./numbered-slots";

describe("readSlot", () => {
  it("returns trimmed strings and empty string for non-strings", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: "  Salt  ",
      strIngredient2: null,
      strMeasure3: 42,
    };
    expect(readSlot(raw, "strIngredient1")).toBe("Salt");
    expect(readSlot(raw, "strIngredient2")).toBe("");
    expect(readSlot(raw, "strMeasure3")).toBe("");
    expect(readSlot(raw, "strMissing")).toBe("");
  });
});

describe("foldNumberedSlots", () => {
  it("folds a dense run of slots", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: "Gin",
      strMeasure1: "2 oz",
      strIngredient2: "Tonic",
      strMeasure2: "4 oz",
    };
    expect(foldNumberedSlots(raw, 15)).toEqual([
      { name: "Gin", measure: "2 oz" },
      { name: "Tonic", measure: "4 oz" },
    ]);
  });

  it("skips gaps in the middle", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: "A",
      strMeasure1: "1",
      strIngredient3: "C",
      strMeasure3: "3",
    };
    expect(foldNumberedSlots(raw, 5)).toEqual([
      { name: "A", measure: "1" },
      { name: "C", measure: "3" },
    ]);
  });

  it("drops whitespace-only names", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: "  ",
      strMeasure1: "1",
      strIngredient2: "Valid",
      strMeasure2: "2",
    };
    expect(foldNumberedSlots(raw, 5)).toEqual([{ name: "Valid", measure: "2" }]);
  });

  it("drops null and absent values", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: null,
      strMeasure1: "1",
      strIngredient2: "Valid",
      strMeasure2: null,
    };
    expect(foldNumberedSlots(raw, 5)).toEqual([{ name: "Valid", measure: "" }]);
  });

  it("drops a measure present with no name", () => {
    const raw: Record<string, unknown> = {
      strMeasure1: "1 oz",
      strIngredient2: "Gin",
      strMeasure2: "2 oz",
    };
    expect(foldNumberedSlots(raw, 5)).toEqual([{ name: "Gin", measure: "2 oz" }]);
  });

  it("keeps a name with a missing measure as empty measure", () => {
    const raw: Record<string, unknown> = {
      strIngredient1: "Salt",
    };
    expect(foldNumberedSlots(raw, 5)).toEqual([{ name: "Salt", measure: "" }]);
  });
});
