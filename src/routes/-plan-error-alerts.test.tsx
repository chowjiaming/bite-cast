// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/features/plan/api";
import { PlanErrorAlerts } from "./index";

describe("PlanErrorAlerts", () => {
  it("shows the location_required prompt", () => {
    render(
      <PlanErrorAlerts
        error={new ApiError("location_required", 422, "Could not place you from your connection.")}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("We could not place you automatically");
  });

  it("lists field-level issues from an invalid_request", () => {
    render(
      <PlanErrorAlerts
        error={new ApiError("invalid_request", 400, "Some search parameters were not understood.", [
          { path: "date", message: "expected a real YYYY-MM-DD date" },
        ])}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Some search parameters were not understood.");
    expect(screen.getByText(/date: expected a real YYYY-MM-DD date/)).toBeInTheDocument();
  });
});
