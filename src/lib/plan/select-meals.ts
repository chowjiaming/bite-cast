import type { Meal, MealSummary, PlanRequest } from "../contracts";
import { UpstreamError } from "../providers/http";
import {
  chooseSample,
  intersectMealSets,
  nextRelaxation,
  preferredPool,
  unionMealSets,
} from "../recommend/meal-selection";
import { DEFAULT_CATEGORIES } from "../recommend/thresholds";

export type MealSelectionDeps = {
  filterMealsByArea: (area: string) => Promise<MealSummary[]>;
  filterMealsByIngredient: (ingredient: string) => Promise<MealSummary[]>;
  filterMealsByCategory: (category: string) => Promise<MealSummary[]>;
  lookupMeal: (id: string) => Promise<Meal | null>;
  random: () => number;
};

export type MealSelection = {
  meals: Meal[];
  relaxedFilters: string[];
  warnings: string[];
};

const MEAL_COUNT = 2;
const DIET_CATEGORY = { vegetarian: "Vegetarian", vegan: "Vegan" } as const;

type ActiveFilters = {
  cuisine?: string | undefined;
  ingredient?: string | undefined;
  diet?: "vegetarian" | "vegan" | undefined;
};

const activeNames = (filters: ActiveFilters): string[] =>
  Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .map(([name]) => name);

async function userFilterSets(
  filters: ActiveFilters,
  deps: MealSelectionDeps,
): Promise<MealSummary[][]> {
  const requests: Array<Promise<MealSummary[]>> = [];
  if (filters.ingredient !== undefined) {
    requests.push(deps.filterMealsByIngredient(filters.ingredient));
  }
  if (filters.cuisine !== undefined) {
    requests.push(deps.filterMealsByArea(filters.cuisine));
  }
  if (filters.diet !== undefined) {
    requests.push(deps.filterMealsByCategory(DIET_CATEGORY[filters.diet]));
  }
  return Promise.all(requests);
}

async function candidatesFor(
  filters: ActiveFilters,
  biasSets: MealSummary[][],
  deps: MealSelectionDeps,
): Promise<MealSummary[]> {
  const sets = await userFilterSets(filters, deps);
  return sets.length > 0 ? intersectMealSets(sets) : unionMealSets(biasSets);
}

export async function selectMeals(
  request: PlanRequest,
  preferredCategories: readonly string[],
  deps: MealSelectionDeps,
): Promise<MealSelection> {
  const biasCategories =
    preferredCategories.length > 0 ? preferredCategories : [...DEFAULT_CATEGORIES];

  try {
    const biasSets = await Promise.all(
      biasCategories.map((category) => deps.filterMealsByCategory(category)),
    );
    const biasIds = new Set(biasSets.flat().map((entry) => entry.id));

    let filters: ActiveFilters = {
      cuisine: request.cuisine,
      ingredient: request.ingredient,
      diet: request.diet,
    };
    const relaxedFilters: string[] = [];
    let candidates = await candidatesFor(filters, biasSets, deps);

    if (candidates.length === 0) {
      const dropped = nextRelaxation(activeNames(filters));
      if (dropped !== null) {
        relaxedFilters.push(dropped);
        filters = { ...filters, [dropped]: undefined };
        candidates = await candidatesFor(filters, biasSets, deps);
      }
    }

    const chosen = chooseSample(preferredPool(candidates, biasIds), MEAL_COUNT, deps.random);
    const looked = await Promise.all(chosen.map((entry) => deps.lookupMeal(entry.id)));
    const meals = looked.filter((meal): meal is Meal => meal !== null);

    return {
      meals,
      relaxedFilters,
      warnings: meals.length === 0 ? ["No recipes matched — try a wider filter."] : [],
    };
  } catch (error) {
    if (error instanceof UpstreamError) {
      return {
        meals: [],
        relaxedFilters: [],
        warnings: ["Recipe suggestions are temporarily unavailable."],
      };
    }
    throw error;
  }
}
