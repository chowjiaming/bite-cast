import { filterDrinks, lookupDrink } from "../providers/drinks";
import { geocodeCity, locateByIp } from "../providers/geo";
import {
  filterMealsByArea,
  filterMealsByCategory,
  filterMealsByIngredient,
  lookupMeal,
} from "../providers/meals";
import { fetchForecast } from "../providers/weather";
import type { PlanDependencies } from "./build-day-plan";

export function createLiveDependencies(): PlanDependencies {
  return {
    geocodeCity: (query) => geocodeCity(query),
    locateByIp: (ip) => locateByIp(ip),
    fetchForecast: (coords) => fetchForecast(coords),
    filterMealsByArea: (area) => filterMealsByArea(area),
    filterMealsByIngredient: (ingredient) => filterMealsByIngredient(ingredient),
    filterMealsByCategory: (category) => filterMealsByCategory(category),
    lookupMeal: (id) => lookupMeal(id),
    filterDrinks: (alcoholic) => filterDrinks(alcoholic),
    lookupDrink: (id) => lookupDrink(id),
    now: () => new Date(),
    random: () => Math.random(),
  };
}
