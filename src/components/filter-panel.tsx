import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CUISINES } from "@/features/plan/cuisines";
import { DIETS, type PlanRequest } from "@/lib/contracts";

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

const SELECT_CLASS = "border-input bg-background h-9 w-full rounded-md border px-3 text-sm";

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
    <div className="grid gap-4 sm:grid-cols-4">
      <form.Field
        name="cuisine"
        listeners={{ onChange: ({ value: raw }) => onChange({ cuisine: orUndefined(raw) }) }}
      >
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="cuisine">Cuisine</Label>
            <select
              id="cuisine"
              className={SELECT_CLASS}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option value="">Any</option>
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
        {(field) => (
          <div className="space-y-1">
            <Label htmlFor="ingredient">Ingredient</Label>
            <Input
              id="ingredient"
              placeholder="tomato"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </div>
        )}
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
            <Label htmlFor="diet">Diet</Label>
            <select
              id="diet"
              className={SELECT_CLASS}
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option value="">Any</option>
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
          <div className="flex items-center gap-2 pt-6">
            <Switch
              id="alcohol"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
            />
            <Label htmlFor="alcohol">Alcoholic drink</Label>
          </div>
        )}
      </form.Field>
    </div>
  );
}
