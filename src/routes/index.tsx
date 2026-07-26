import { createFileRoute } from "@tanstack/react-router";
import { planRequestSchema } from "@/lib/contracts";

export const Route = createFileRoute("/")({
  validateSearch: planRequestSchema,
  component: PlanPage,
});

function PlanPage() {
  const search = Route.useSearch();
  return <main className="mx-auto max-w-3xl p-6">{search.q ?? "Detecting your location…"}</main>;
}
