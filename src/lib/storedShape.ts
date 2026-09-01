/**
 * Shape guards for values read back out of localStorage.
 *
 * `loadStored` previously only guarded against JSON *parse* failure, so a
 * structurally wrong value (an object where an array was expected, say) was
 * handed straight to component state. `new Set(unassignedRoleSwatchIds)` then
 * threw "is not iterable" during render and blanked the page.
 *
 * These guards are deliberately shallow and cheap: they reject the clearly
 * wrong shapes that crash us, and let anything plausible through. They are not
 * a full schema layer.
 */

export type Validator<T> = (value: unknown) => value is T

export const isStringArray: Validator<string[]> = (value): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")

/** A plain object — not null, not an array. Used for the various string maps. */
export const isPlainObject: Validator<Record<string, unknown>> = (
  value,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/** A plain object whose values are all strings, e.g. templateByType, roleBindings. */
export const isStringMap: Validator<Record<string, string>> = (
  value,
): value is Record<string, string> =>
  isPlainObject(value) && Object.values(value).every((item) => typeof item === "string")

export const isString: Validator<string> = (value): value is string => typeof value === "string"

/** Brand accepts partial shapes; only `name` needs to be usable as a string. */
export const isBrandLike: Validator<{ name: string; logo: string | null; symbol: string | null }> = (
  value,
): value is { name: string; logo: string | null; symbol: string | null } =>
  isPlainObject(value) && typeof (value as { name?: unknown }).name === "string"
