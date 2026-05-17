/**
 * Coerces all values in a record to strings.
 *
 * AI models (Claude, GPT-4, etc.) return typed JSON — integers for year fields,
 * booleans for flags, etc. React form state expects strings. This function
 * bridges the gap at the AI boundary so .trim(), .length, etc. never crash.
 *
 * @see BUG-020 incident write-up in this directory
 */
export function normalizeToStringRecord(
  input: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = v != null ? String(v) : "";
  }
  return out;
}
