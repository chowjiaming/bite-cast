import type { Drink } from "@/lib/contracts";

export function DrinkIdea({ drink }: { drink: Drink | null }) {
  if (drink === null) {
    return null;
  }

  const ingredients = drink.ingredients
    .slice(0, 4)
    .map((entry) => entry.name.toLowerCase())
    .join(" · ");

  return (
    <section
      className="border-border bg-card flex flex-wrap items-center gap-5 rounded-2xl border px-5 py-5 shadow-[0_8px_24px_-2px_rgba(64,46,31,0.06)]"
      aria-labelledby="drink-name"
    >
      {drink.thumbnailUrl === "" ? (
        <div
          className="size-[72px] shrink-0 rounded-xl bg-linear-to-br from-[#b2e5d6] to-primary"
          aria-hidden="true"
        />
      ) : (
        <img
          src={drink.thumbnailUrl}
          alt=""
          width={72}
          height={72}
          className="size-[72px] shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
          Drink
        </p>
        <h2 id="drink-name" className="font-display text-[22px] font-semibold">
          {drink.name}
        </h2>
        <p className="text-muted-foreground text-[13px]">
          {drink.alcoholic ? "Alcoholic" : "Non-alcoholic"}
          {ingredients === "" ? "" : ` · ${ingredients}`}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-sm">{drink.instructions}</p>
      </div>
    </section>
  );
}
