import type { DayPlan } from "@/lib/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DECISION_LABEL = { "go-out": "Go out", "stay-in": "Stay in" } as const;

export function PlanSummary({ plan }: { plan: DayPlan }) {
  const { place, date, weather, outing } = plan;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-baseline gap-2">
          <span>{DECISION_LABEL[outing.decision]}</span>
          <span className="text-muted-foreground text-sm font-normal">
            {place.name}
            {place.country === "" ? "" : `, ${place.country}`} · {date}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>{outing.reason}</p>
        <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          <div>
            <dt className="font-medium">Conditions</dt>
            <dd>{weather.description}</dd>
          </div>
          <div>
            <dt className="font-medium">High / low</dt>
            <dd>
              {Math.round(weather.tempMax)}°C / {Math.round(weather.tempMin)}°C
            </dd>
          </div>
          <div>
            <dt className="font-medium">Precipitation</dt>
            <dd>{weather.precipitationProbability}%</dd>
          </div>
          <div>
            <dt className="font-medium">Wind</dt>
            <dd>{Math.round(weather.windSpeedMax)} km/h</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
