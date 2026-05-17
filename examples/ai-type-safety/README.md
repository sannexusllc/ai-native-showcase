# BUG-020: When AI Returns the Wrong Type

**Date:** 2026-05-07
**Severity:** Critical (production outage)
**Root cause:** Claude Haiku returns typed JSON — integers for year fields — but React forms expect strings.

## What Happened

We use Claude Haiku to extract data from physician credential documents (medical school diplomas, board certifications, etc.). The AI reads the document and returns structured fields like:

```json
{
  "medSchoolName": "University of Florida College of Medicine",
  "medSchoolGradYear": 2010,
  "deaNumber": "AB1234567"
}
```

Notice the problem? `medSchoolGradYear` is an **integer**, not a string.

Our React form called `values.medSchoolGradYear?.trim()` on every render to clean up whitespace. You can't call `.trim()` on the number `2010`. The component crashed, triggering our error boundary, and the entire credentialing form became unusable.

## Why It Was Hidden

Before we added the Anthropic API key to production, the extraction endpoint fell back to a regex-based parser. Regex `.match()` always returns strings. So the type mismatch was invisible — every test passed, every dev environment worked.

The moment we enabled Claude Haiku in production (by adding `ANTHROPIC_API_KEY`), the bug surfaced immediately. First real user, first crash.

## The Fix

A seven-line utility function:

```typescript
export function normalizeToStringRecord(
  input: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    out[k] = v != null ? String(v) : "";
  }
  return out;
}
```

Every path where AI-extracted data enters React form state now goes through this function first.

## The Test

```typescript
it("coerces integers to strings (BUG-020: AI year fields)", () => {
  // Claude Haiku returns { medSchoolGradYear: 2010 } — an integer.
  // values[key]?.trim() crashes on integers. String() fixes it.
  const result = normalizeToStringRecord({
    medSchoolGradYear: 2010,
    residencyCompletionYear: 2014,
  });
  expect(result.medSchoolGradYear).toBe("2010");
  expect(typeof result.medSchoolGradYear).toBe("string");
});
```

## The Lesson

**TypeScript generics are compile-time only.** When you write `Record<string, string>`, TypeScript checks your code at build time. But at runtime, JavaScript doesn't enforce it. An AI model returning `2010` as a number satisfies `Record<string, unknown>` at runtime — there's no guard.

This is a fundamental challenge when integrating AI into typed applications:

1. AI models return whatever type is most natural for the data (integers for years, booleans for flags)
2. TypeScript's type system operates at compile time, not runtime
3. The gap between these two creates crashes that only appear in production, only when the AI is actually running

**The pattern:** Always coerce at the AI boundary. Never trust `as Record<string, string>` — verify at runtime.
