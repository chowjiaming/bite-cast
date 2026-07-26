// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { dayPlanFixture } from "../../tests/fixtures/day-plan";
import { DrinkIdea } from "./drink-idea";
import { MealIdeas } from "./meal-ideas";
import { PlanSummary } from "./plan-summary";
import { SourcesFooter } from "./sources-footer";

describe("PlanSummary", () => {
  it("shows the place, the date and the outing reason", () => {
    render(<PlanSummary plan={dayPlanFixture} />);
    expect(screen.getByText(/Singapore/)).toBeInTheDocument();
    expect(screen.getByText(/2026-07-27/)).toBeInTheDocument();
    expect(screen.getByText(/Stay in/i)).toBeInTheDocument();
    expect(screen.getByText(dayPlanFixture.outing.reason)).toBeInTheDocument();
  });

  it("shows the weather figures", () => {
    render(<PlanSummary plan={dayPlanFixture} />);
    expect(screen.getByText("Slight rain", { exact: true })).toBeInTheDocument();
    expect(screen.getByText(/^94%$/)).toBeInTheDocument();
  });
});

describe("MealIdeas", () => {
  it("renders a card per meal", () => {
    render(<MealIdeas meals={dayPlanFixture.meals} relaxedFilters={[]} onRelaxFilters={vi.fn()} />);
    expect(screen.getByText("Budino Di Ricotta")).toBeInTheDocument();
    expect(screen.getByText("500g Ricotta")).toBeInTheDocument();
  });

  it("offers to widen the filters when nothing matched", async () => {
    const onRelaxFilters = vi.fn();
    render(<MealIdeas meals={[]} relaxedFilters={[]} onRelaxFilters={onRelaxFilters} />);
    expect(screen.getByText(/No recipes matched/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(onRelaxFilters).toHaveBeenCalledOnce();
  });

  it("says which filter was relaxed", () => {
    render(
      <MealIdeas
        meals={dayPlanFixture.meals}
        relaxedFilters={["ingredient"]}
        onRelaxFilters={vi.fn()}
      />,
    );
    expect(screen.getByText(/ingredient filter/i)).toBeInTheDocument();
  });
});

describe("DrinkIdea", () => {
  it("renders the drink", () => {
    render(<DrinkIdea drink={dayPlanFixture.drink} />);
    expect(screen.getByText("Afterglow")).toBeInTheDocument();
  });

  it("renders nothing when there is no drink", () => {
    const { container } = render(<DrinkIdea drink={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SourcesFooter", () => {
  it("credits every source", () => {
    render(<SourcesFooter sources={dayPlanFixture.meta.sources} />);
    expect(screen.getByText(/TheMealDB/)).toBeInTheDocument();
    expect(screen.getByText(/Open-Meteo/)).toBeInTheDocument();
  });
});
