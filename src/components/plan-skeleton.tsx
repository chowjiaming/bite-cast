import { Skeleton } from "@/components/ui/skeleton";

export function PlanSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading your plan">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
