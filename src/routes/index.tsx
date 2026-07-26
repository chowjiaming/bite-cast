import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { DayPicker } from "@/components/day-picker";
import { DrinkIdea } from "@/components/drink-idea";
import { FilterPanel } from "@/components/filter-panel";
import { LocationBar } from "@/components/location-bar";
import { MealIdeas } from "@/components/meal-ideas";
import { PlanSkeleton } from "@/components/plan-skeleton";
import { PlanSummary } from "@/components/plan-summary";
import { SourcesFooter } from "@/components/sources-footer";
import { ApiError } from "@/features/plan/api";
import { useDayPlan } from "@/features/plan/use-day-plan";
import { FORECAST_DAYS, planRequestSchema, type PlanRequest } from "@/lib/contracts";
import { forecastDates, todayInTimeZone } from "@/lib/date";

export const Route = createFileRoute("/")({
  validateSearch: planRequestSchema,
  component: PlanPage,
});

export function PlanErrorAlerts({ error }: { error: unknown }) {
  if (!(error instanceof ApiError)) {
    return null;
  }

  if (error.code === "location_required") {
    return <p role="alert">We could not place you automatically. Enter a city to get started.</p>;
  }

  if (error.code === "place_not_found") {
    return <p role="alert">No place matched that search. Try another city.</p>;
  }

  return <p role="alert">{error.message}</p>;
}

function PlanPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: plan, error, isPending } = useDayPlan(search);

  const patchSearch = (patch: Partial<PlanRequest>) => {
    void navigate({ search: (current) => ({ ...current, ...patch }) });
  };

  useEffect(() => {
    if (error instanceof ApiError && error.status >= 500) {
      toast.error(error.message);
    }
  }, [error]);

  const timezone = plan?.place.timezone ?? "UTC";
  const dates = forecastDates(todayInTimeZone(timezone), FORECAST_DAYS);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">BiteCast</h1>
        <p className="text-muted-foreground text-sm">
          What the weather says about going out, and what to eat either way.
        </p>
      </header>

      <LocationBar
        placeLabel={
          plan === undefined
            ? null
            : [plan.place.name, plan.place.country].filter(Boolean).join(", ")
        }
        onSearch={(query) => patchSearch({ q: query, date: undefined })}
      />
      <DayPicker
        dates={dates}
        selected={search.date ?? plan?.date ?? null}
        onSelect={(date) => patchSearch({ date })}
      />
      <FilterPanel value={search} onChange={patchSearch} />

      {isPending ? <PlanSkeleton /> : null}

      <PlanErrorAlerts error={error} />

      {plan === undefined ? null : (
        <div className="space-y-6">
          <PlanSummary plan={plan} />
          <MealIdeas
            meals={plan.meals}
            relaxedFilters={plan.meta.relaxedFilters}
            onRelaxFilters={() =>
              patchSearch({ cuisine: undefined, ingredient: undefined, diet: undefined })
            }
          />
          <DrinkIdea drink={plan.drink} />
          {plan.meta.warnings.map((warning) => (
            <p key={warning} className="text-muted-foreground text-sm">
              {warning}
            </p>
          ))}
          <SourcesFooter sources={plan.meta.sources} />
        </div>
      )}
    </main>
  );
}
