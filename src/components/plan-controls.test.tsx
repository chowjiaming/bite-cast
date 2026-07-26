// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DayPicker } from "./day-picker";
import { FilterPanel } from "./filter-panel";
import { LocationBar } from "./location-bar";

describe("LocationBar", () => {
  it("submits a trimmed city query", async () => {
    const onSearch = vi.fn();
    render(<LocationBar placeLabel="Toronto" onSearch={onSearch} />);
    await userEvent.type(screen.getByLabelText(/city/i), "  Singapore  ");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalledWith("Singapore");
  });

  it("does not submit an empty query and explains why", async () => {
    const onSearch = vi.fn();
    render(<LocationBar placeLabel={null} onSearch={onSearch} />);
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(await screen.findByText(/enter a city/i)).toBeInTheDocument();
  });

  it("clears the input after a successful search", async () => {
    render(<LocationBar placeLabel={null} onSearch={vi.fn()} />);
    const input = screen.getByLabelText(/city/i);
    await userEvent.type(input, "Osaka");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(input).toHaveValue("");
  });

  it("shows the resolved place", () => {
    render(<LocationBar placeLabel="Toronto, Canada" onSearch={vi.fn()} />);
    expect(screen.getByText(/Toronto, Canada/)).toBeInTheDocument();
  });

  it("offers to return to ip geolocation when a city override is active", async () => {
    const onUseMyLocation = vi.fn();
    render(
      <LocationBar
        placeLabel="Singapore, Singapore"
        onSearch={vi.fn()}
        onUseMyLocation={onUseMyLocation}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /use my location/i }));
    expect(onUseMyLocation).toHaveBeenCalledOnce();
  });

  it("hides the location reset when there is no city override", () => {
    render(<LocationBar placeLabel={null} onSearch={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /use my location/i })).not.toBeInTheDocument();
  });
});

describe("DayPicker", () => {
  it("marks the selected day and reports a change", async () => {
    const onSelect = vi.fn();
    render(
      <DayPicker
        dates={["2026-07-27", "2026-07-28"]}
        selected="2026-07-27"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole("button", { name: /2026-07-27/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(screen.getByRole("button", { name: /2026-07-28/ }));
    expect(onSelect).toHaveBeenCalledWith("2026-07-28");
  });
});

describe("FilterPanel", () => {
  it("reports an ingredient change once the field is left", async () => {
    const onChange = vi.fn();
    render(<FilterPanel value={{ alcohol: true }} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/ingredient/i), "tomato");
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith({ ingredient: "tomato" });
  });

  it("reports a cuisine change immediately", async () => {
    const onChange = vi.fn();
    render(<FilterPanel value={{ alcohol: true }} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText(/cuisine/i), "Italian");
    expect(onChange).toHaveBeenCalledWith({ cuisine: "Italian" });
  });

  it("reports the alcohol toggle", async () => {
    const onChange = vi.fn();
    render(<FilterPanel value={{ alcohol: true }} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText(/alcoholic/i));
    expect(onChange).toHaveBeenCalledWith({ alcohol: false });
  });

  it("reflects filters that arrive from the url", () => {
    render(<FilterPanel value={{ alcohol: true, cuisine: "Thai" }} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/cuisine/i)).toHaveValue("Thai");
  });
});
