export function readSlot(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value.trim() : "";
}

export function foldNumberedSlots(
  raw: Record<string, unknown>,
  maxSlots: number,
): Array<{ name: string; measure: string }> {
  return Array.from({ length: maxSlots }, (_, index) => index + 1)
    .map((slot) => ({
      name: readSlot(raw, `strIngredient${slot}`),
      measure: readSlot(raw, `strMeasure${slot}`),
    }))
    .filter((entry) => entry.name !== "");
}
