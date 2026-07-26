import type { DayPlan } from "@/lib/contracts";
import { formatOutingDate } from "@/lib/format-day";

const DECISION_LABEL = { "go-out": "Go out", "stay-in": "Stay in" } as const;

export function PlanSummary({ plan }: { plan: DayPlan }) {
  const { place, date, weather, outing } = plan;
  const placeLine = [place.name, place.country].filter(Boolean).join(", ");

  return (
    <section
      className="w-full px-6 py-12 md:px-16 md:py-14"
      style={{ backgroundImage: "var(--hero-gradient)" }}
      aria-labelledby="outing-decision"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg bg-[oklch(0.22_0.02_55_/_0.12)] px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase">
            Outing
          </span>
          <p className="text-sm font-medium">
            {placeLine} · {formatOutingDate(date)}
          </p>
          <span className="sr-only">{date}</span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="flex max-w-3xl flex-col gap-4">
            <h2
              id="outing-decision"
              className="font-display text-6xl leading-[0.95] font-semibold tracking-[-0.03em] md:text-7xl"
            >
              {DECISION_LABEL[outing.decision]}
            </h2>
            <p className="max-w-2xl text-lg leading-snug">{outing.reason}</p>
            <dl className="flex flex-wrap gap-5 text-sm whitespace-nowrap">
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium">Sky</dt>
                <dd className="text-[15px] font-semibold">{weather.description}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium">High</dt>
                <dd className="text-[15px] font-semibold">{Math.round(weather.tempMax)}°</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium">Low</dt>
                <dd className="text-[15px] font-semibold">{Math.round(weather.tempMin)}°</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium">Rain</dt>
                <dd className="text-[15px] font-semibold">{weather.precipitationProbability}%</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-[11px] font-medium">Wind</dt>
                <dd className="text-[15px] font-semibold">
                  {Math.round(weather.windSpeedMax)} km/h
                </dd>
              </div>
            </dl>
          </div>
          <img
            src="/brand/sun.svg"
            alt=""
            width={128}
            height={128}
            className="size-24 shrink-0 md:size-32"
          />
        </div>
      </div>
    </section>
  );
}
