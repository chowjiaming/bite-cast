import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PlanRequest } from "@/lib/contracts";
import { fetchDayPlan, planQueryKey, shouldRetryPlan } from "./api";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export function useDayPlan(search: PlanRequest) {
  return useQuery({
    queryKey: planQueryKey(search),
    queryFn: () => fetchDayPlan(search),
    staleTime: FIFTEEN_MINUTES,
    placeholderData: keepPreviousData,
    retry: shouldRetryPlan,
  });
}
