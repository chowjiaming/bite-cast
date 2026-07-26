import { Button } from "@/components/ui/button";

type DayPickerProps = {
  dates: string[];
  selected: string | null;
  onSelect: (date: string) => void;
};

export function DayPicker({ dates, selected, onSelect }: DayPickerProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a day">
      {dates.map((date) => (
        <Button
          key={date}
          type="button"
          size="sm"
          variant={date === selected ? "default" : "outline"}
          aria-pressed={date === selected}
          onClick={() => onSelect(date)}
        >
          {date}
        </Button>
      ))}
    </div>
  );
}
