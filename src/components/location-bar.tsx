import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { firstErrorMessage } from "@/features/plan/form-errors";
import { citySearchSchema } from "@/lib/contracts";

type LocationBarProps = {
  placeLabel: string | null;
  onSearch: (query: string) => void;
  /** When set, shows a control that clears the city override and returns to IP geolocation. */
  onUseMyLocation?: () => void;
};

export function LocationBar({ placeLabel, onSearch, onUseMyLocation }: LocationBarProps) {
  const form = useForm({
    defaultValues: { city: "" },
    onSubmit: ({ value, formApi }) => {
      onSearch(value.city.trim());
      formApi.reset();
    },
  });

  return (
    <form
      className="flex flex-wrap items-center gap-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="city" validators={{ onSubmit: citySearchSchema }}>
        {(field) => {
          const message = firstErrorMessage(field.state.meta.errors);
          return (
            <div className="min-w-[12rem] grow space-y-1 sm:max-w-[20rem] sm:grow-0">
              <Label htmlFor="city" className="sr-only">
                City
              </Label>
              <Input
                id="city"
                value={field.state.value}
                placeholder={placeLabel ?? "Enter a city"}
                aria-invalid={message !== null}
                className="bg-background/55 h-10"
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
      <Button type="submit" className="h-10 px-4 text-[13px] font-semibold">
        Plan my day
      </Button>
      {onUseMyLocation === undefined ? null : (
        <Button
          type="button"
          variant="ghost"
          className="text-primary h-auto px-1 text-xs font-medium"
          onClick={onUseMyLocation}
        >
          Use my location
        </Button>
      )}
    </form>
  );
}
