/**
 * TanStack Form yields plain strings from function validators and issue objects from
 * Standard Schema validators. This reads either without widening anything to `any`.
 */
export function firstErrorMessage(errors: readonly unknown[]): string | null {
  const [first] = errors;
  if (typeof first === "string") {
    return first;
  }
  if (typeof first === "object" && first !== null && "message" in first) {
    const { message } = first as { message: unknown };
    return typeof message === "string" ? message : null;
  }
  return null;
}
