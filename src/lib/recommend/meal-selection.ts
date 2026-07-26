import type { MealSummary } from "../contracts";

export const RELAXATION_ORDER = ["ingredient", "cuisine"] as const;
export type RelaxableFilter = (typeof RELAXATION_ORDER)[number];

export function intersectMealSets(sets: readonly MealSummary[][]): MealSummary[] {
  const [first, ...rest] = sets;
  if (first === undefined) {
    return [];
  }
  const restIds = rest.map((set) => new Set(set.map((entry) => entry.id)));
  return first.filter((entry) => restIds.every((ids) => ids.has(entry.id)));
}

export function unionMealSets(sets: readonly MealSummary[][]): MealSummary[] {
  const byId = new Map<string, MealSummary>();
  for (const set of sets) {
    for (const entry of set) {
      if (!byId.has(entry.id)) {
        byId.set(entry.id, entry);
      }
    }
  }
  return [...byId.values()];
}

export function preferredPool(
  candidates: readonly MealSummary[],
  preferredIds: ReadonlySet<string>,
): MealSummary[] {
  const preferred = candidates.filter((entry) => preferredIds.has(entry.id));
  return preferred.length > 0 ? preferred : [...candidates];
}

export function chooseSample<T>(items: readonly T[], count: number, random: () => number): T[] {
  const remaining = [...items];
  const chosen: T[] = [];
  while (chosen.length < count && remaining.length > 0) {
    const [picked] = remaining.splice(Math.floor(random() * remaining.length), 1);
    if (picked !== undefined) {
      chosen.push(picked);
    }
  }
  return chosen;
}

/** Diet is deliberately absent: a vegetarian is not served meat to widen the result set. */
export function nextRelaxation(active: readonly string[]): RelaxableFilter | null {
  return RELAXATION_ORDER.find((name) => active.includes(name)) ?? null;
}
