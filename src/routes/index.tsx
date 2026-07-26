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
import { recoverPlanSearch } from "@/features/plan/search-params";
import { useDayPlan } from "@/features/plan/use-day-plan";
import { FORECAST_DAYS, type PlanRequest } from "@/lib/contracts";
import { forecastDates, todayInTimeZone } from "@/lib/date";

export const Route = createFileRoute("/")({
  validateSearch: recoverPlanSearch,
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

  return (
    <div role="alert" className="space-y-1">
      <p>{error.message}</p>
      {error.issues.length === 0 ? null : (
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          {error.issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`}>
              {issue.path === "" ? issue.message : `${issue.path}: ${issue.message}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
  const placeLabel =
    plan === undefined
      ? null
      : [plan.place.name, plan.place.country].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pt-10 pb-5 md:px-16">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.02em]">BiteCast</h1>
            <p className="text-muted-foreground text-xs font-medium">Sky · plate · glass</p>
          </div>
          {placeLabel === null ? null : (
            <div className="border-border bg-card flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium">
              <span className="bg-honey size-1.5 rounded-full" aria-hidden="true" />
              <span className="text-muted-foreground">{placeLabel}</span>
            </div>
          )}
        </header>

        <div className="border-border bg-card flex flex-col gap-3.5 rounded-2xl border p-4 shadow-[0_10px_28px_-4px_rgba(64,46,31,0.08)]">
          <LocationBar
            placeLabel={placeLabel}
            onSearch={(query) => patchSearch({ q: query, date: undefined })}
            onUseMyLocation={
              search.q === undefined
                ? undefined
                : () => patchSearch({ q: undefined, date: undefined })
            }
          />
          <DayPicker
            dates={dates}
            selected={search.date ?? plan?.date ?? null}
            onSelect={(date) => patchSearch({ date })}
          />
          <FilterPanel value={search} onChange={patchSearch} />
        </div>

        <PlanErrorAlerts error={error} />
      </div>

      {isPending ? (
        <div className="mx-auto max-w-5xl px-6 md:px-16">
          <PlanSkeleton />
        </div>
      ) : null}

      {plan === undefined ? null : (
        <>
          <PlanSummary plan={plan} />
          <div className="mx-auto flex max-w-5xl flex-col gap-9 px-6 pt-10 pb-14 md:px-16">
            <MealIdeas
              meals={plan.meals}
              relaxedFilters={plan.meta.relaxedFilters}
              ingredientFilter={search.ingredient}
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
        </>
      )}
    </main>
  );
}
