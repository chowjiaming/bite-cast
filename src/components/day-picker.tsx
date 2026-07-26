import { cn } from "@/lib/utils";
import { formatDayChip } from "@/lib/format-day";

type DayPickerProps = {
  dates: string[];
  selected: string | null;
  onSelect: (date: string) => void;
};

export function DayPicker({ dates, selected, onSelect }: DayPickerProps) {
  return (
    <div
      className="bg-background/35 flex flex-wrap gap-1 rounded-xl p-1"
      role="group"
      aria-label="Choose a day"
    >
      {dates.map((date) => {
        const { weekday, day } = formatDayChip(date);
        const isSelected = date === selected;
        return (
          <button
            key={date}
            type="button"
            aria-label={date}
            aria-pressed={isSelected}
            className={cn(
              "flex min-w-14 flex-col items-center justify-center rounded-lg px-3.5 py-2 transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground shadow-[0_4px_10px_rgba(38,107,122,0.28)]"
                : "text-foreground hover:bg-background/60",
            )}
            onClick={() => onSelect(date)}
          >
            <span
              className={cn(
                "text-[11px] font-medium",
                isSelected ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {weekday}
            </span>
            <span className="text-[13px] font-semibold">{day}</span>
          </button>
        );
      })}
    </div>
  );
}
