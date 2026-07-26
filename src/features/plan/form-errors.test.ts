import { describe, expect, it } from "vitest";
import { firstErrorMessage } from "./form-errors";

describe("firstErrorMessage", () => {
  it("reads a plain string error", () => {
    expect(firstErrorMessage(["Enter a city"])).toBe("Enter a city");
  });

  it("reads a standard-schema issue object", () => {
    expect(firstErrorMessage([{ message: "Enter a city" }])).toBe("Enter a city");
  });

  it("returns null when there is no error", () => {
    expect(firstErrorMessage([])).toBeNull();
    expect(firstErrorMessage([undefined])).toBeNull();
  });

  it("ignores a shape it does not recognise", () => {
    expect(firstErrorMessage([{ code: 42 }])).toBeNull();
  });
});
