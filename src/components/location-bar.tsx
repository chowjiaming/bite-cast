import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firstErrorMessage } from "@/features/plan/form-errors";
import { citySearchSchema } from "@/lib/contracts";

type LocationBarProps = {
  placeLabel: string | null;
  onSearch: (query: string) => void;
};

export function LocationBar({ placeLabel, onSearch }: LocationBarProps) {
  const form = useForm({
    defaultValues: { city: "" },
    onSubmit: ({ value, formApi }) => {
      onSearch(value.city.trim());
      formApi.reset();
    },
  });

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="city" validators={{ onSubmit: citySearchSchema }}>
        {(field) => {
          const message = firstErrorMessage(field.state.meta.errors);
          return (
            <div className="grow space-y-1">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={field.state.value}
                placeholder={placeLabel ?? "Enter a city"}
                aria-invalid={message !== null}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {message === null ? null : (
                <p role="alert" className="text-destructive text-sm">
                  {message}
                </p>
              )}
            </div>
          );
        }}
      </form.Field>
      <Button type="submit">Search</Button>
      {placeLabel === null ? null : (
        <p className="text-muted-foreground w-full text-sm">Showing {placeLabel}</p>
      )}
    </form>
  );
}
