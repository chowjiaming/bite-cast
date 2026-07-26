import type { Meal } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MealIdeasProps = {
  meals: Meal[];
  relaxedFilters: string[];
  onRelaxFilters: () => void;
};

export function MealIdeas({ meals, relaxedFilters, onRelaxFilters }: MealIdeasProps) {
  if (meals.length === 0) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <p>No recipes matched those filters.</p>
          <Button variant="secondary" onClick={onRelaxFilters}>
            Clear filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-3">
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
      <div className="grid gap-4 sm:grid-cols-2">
        {meals.map((meal) => (
          <Card key={meal.id}>
            <img
              src={meal.thumbnailUrl}
              alt={meal.name}
              className="h-40 w-full rounded-t-xl object-cover"
              loading="lazy"
            />
            <CardHeader>
              <CardTitle>{meal.name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {[meal.area, meal.category].filter(Boolean).join(" · ")}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {meal.ingredients
                  .map((entry) => `${entry.measure} ${entry.name}`.trim())
                  .join(", ")}
              </p>
              {meal.sourceUrl === null ? null : (
                <a className="underline" href={meal.sourceUrl} target="_blank" rel="noreferrer">
                  Full recipe
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
