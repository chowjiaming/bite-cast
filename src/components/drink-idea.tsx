import type { Drink } from "@/lib/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DrinkIdea({ drink }: { drink: Drink | null }) {
  if (drink === null) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{drink.name}</CardTitle>
        <p className="text-muted-foreground text-sm">
          {drink.alcoholic ? "Alcoholic" : "Non-alcoholic"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{drink.ingredients.map((entry) => `${entry.measure} ${entry.name}`.trim()).join(", ")}</p>
        <p>{drink.instructions}</p>
      </CardContent>
    </Card>
  );
}
