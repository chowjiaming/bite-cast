import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CUISINES } from "@/features/plan/cuisines";
import { DIETS, type PlanRequest } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  value: PlanRequest;
  onChange: (patch: Partial<PlanRequest>) => void;
};

type FilterValues = {
  cuisine: string;
  ingredient: string;
  diet: string;
  alcohol: boolean;
};

const SELECT_CLASS =
  "border-border bg-transparent h-8 rounded-lg border px-3 text-[11px] font-medium text-muted-foreground";

const valuesFrom = (value: PlanRequest): FilterValues => ({
  cuisine: value.cuisine ?? "",
  ingredient: value.ingredient ?? "",
  diet: value.diet ?? "",
  alcohol: value.alcohol,
});

const orUndefined = (raw: string): string | undefined => (raw.trim() === "" ? undefined : raw.trim());

export function FilterPanel({ value, onChange }: FilterPanelProps) {
  const form = useForm({ defaultValues: valuesFrom(value) });

  // The URL is the source of truth, so a filter cleared elsewhere must clear here too.
  useEffect(() => {
    form.reset(valuesFrom(value));
  }, [form, value.cuisine, value.ingredient, value.diet, value.alcohol]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form.Field
        name="cuisine"
        listeners={{ onChange: ({ value: raw }) => onChange({ cuisine: orUndefined(raw) }) }}
      >
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="cuisine" className="sr-only">
              Cuisine
            </Label>
            <select
              id="cuisine"
              className={SELECT_CLASS}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option value="">Cuisine</option>
              {CUISINES.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="ingredient"
        listeners={{ onBlur: ({ value: raw }) => onChange({ ingredient: orUndefined(raw) }) }}
      >
        {(field) => {
          const active = field.state.value.trim() !== "";
          return (
            <div className="space-y-1">
              <Label htmlFor="ingredient" className="sr-only">
                Ingredient
              </Label>
              <Input
                id="ingredient"
                placeholder="Ingredient"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className={cn(
                  "h-8 w-28 px-3 text-[11px] font-medium",
                  active
                    ? "bg-honey border-honey text-primary-foreground placeholder:text-primary-foreground/80 font-semibold"
                    : "text-muted-foreground",
                )}
              />
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="diet"
        listeners={{
          onChange: ({ value: raw }) =>
            onChange({ diet: orUndefined(raw) as PlanRequest["diet"] }),
        }}
      >
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="diet" className="sr-only">
              Diet
            </Label>
            <select
              id="diet"
              className={SELECT_CLASS}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option value="">Diet</option>
              {DIETS.map((diet) => (
                <option key={diet} value={diet}>
                  {diet}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="alcohol"
        listeners={{ onChange: ({ value: checked }) => onChange({ alcohol: checked }) }}
      >
        {(field) => (
          <div
            className={cn(
              "border-border flex h-8 items-center gap-2 rounded-lg border px-3",
              field.state.value ? "" : "bg-honey border-honey",
            )}
          >
            <Switch
              id="alcohol"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
            <Label
              htmlFor="alcohol"
              className={cn(
                "text-[11px] font-medium",
                field.state.value ? "text-muted-foreground" : "text-primary-foreground font-semibold",
              )}
            >
              {field.state.value ? "Alcoholic drink" : "Spirit-free"}
            </Label>
          </div>
        )}
      </form.Field>
    </div>
  );
}
