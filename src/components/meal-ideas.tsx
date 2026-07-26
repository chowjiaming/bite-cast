import type { Meal } from "@/lib/contracts";
import { Button } from "@/components/ui/button";

type MealIdeasProps = {
  meals: Meal[];
  relaxedFilters: string[];
  onRelaxFilters: () => void;
  ingredientFilter?: string;
};

export function MealIdeas({
  meals,
  relaxedFilters,
  onRelaxFilters,
  ingredientFilter,
}: MealIdeasProps) {
  if (meals.length === 0) {
    return (
      <section className="space-y-3">
        <p>No recipes matched those filters.</p>
        <Button variant="secondary" onClick={onRelaxFilters}>
          Clear filters
        </Button>
      </section>
    );
  }

  const filterKept =
    ingredientFilter !== undefined &&
    ingredientFilter !== "" &&
    !relaxedFilters.includes("ingredient");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            After you&apos;re back
          </p>
          <h2 className="font-display text-[34px] leading-none font-semibold tracking-[-0.02em]">
            {ingredientFilter === undefined || ingredientFilter === ""
              ? "Meal ideas"
              : `${ingredientFilter.charAt(0).toUpperCase()}${ingredientFilter.slice(1)}-bright plates`}
          </h2>
        </div>
        <p className="text-muted-foreground text-xs font-medium">
          {meals.length} idea{meals.length === 1 ? "" : "s"}
          {filterKept ? " · filter kept" : ""}
        </p>
      </div>

      {relaxedFilters.includes("ingredient") ? (
        <p className="text-muted-foreground text-sm">
          Nothing matched exactly, so the ingredient filter was dropped.
        </p>
      ) : null}
      {relaxedFilters.includes("cuisine") ? (
        <p className="text-muted-foreground text-sm">
          Nothing matched exactly, so the cuisine filter was dropped.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {meals.map((meal) => {
          const blurb = meal.ingredients
            .slice(0, 5)
            .map((entry) => `${entry.measure} ${entry.name}`.trim())
            .join(", ");
          return (
            <article key={meal.id} className="flex flex-col gap-3.5">
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
                <img
                  src={meal.thumbnailUrl}
                  alt={meal.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-[rgba(20,13,8,0.12)]" />
              </div>
              <div className="space-y-1.5">
                <p className="text-honey text-xs font-medium">
                  {[meal.area, meal.category].filter(Boolean).join(" · ")}
                </p>
                <h3 className="font-display text-[22px] leading-snug font-semibold tracking-[-0.01em]">
                  {meal.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-snug">{blurb}</p>
                {meal.sourceUrl === null ? null : (
                  <a
                    className="text-primary inline-flex items-center gap-1.5 text-[13px] font-semibold"
                    href={meal.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Full recipe <span aria-hidden="true">→</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
