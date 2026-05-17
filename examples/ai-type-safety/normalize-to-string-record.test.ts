import { describe, it, expect } from "vitest";
import { normalizeToStringRecord } from "./normalize-to-string-record";

describe("normalizeToStringRecord", () => {
  it("passes string values through unchanged", () => {
    expect(
      normalizeToStringRecord({ name: "Dr. Smith", state: "FL" })
    ).toEqual({
      name: "Dr. Smith",
      state: "FL",
    });
  });

  it("coerces integers to strings (BUG-020: AI year fields)", () => {
    // Claude Haiku returns { medSchoolGradYear: 2010 } — an integer.
    // values[key]?.trim() crashes on integers. String() fixes it.
    const result = normalizeToStringRecord({
      medSchoolGradYear: 2010,
      residencyCompletionYear: 2014,
    });
    expect(result.medSchoolGradYear).toBe("2010");
    expect(result.residencyCompletionYear).toBe("2014");
    expect(typeof result.medSchoolGradYear).toBe("string");
  });

  it("coerces booleans to strings", () => {
    const result = normalizeToStringRecord({ active: true, enrolled: false });
    expect(result.active).toBe("true");
    expect(result.enrolled).toBe("false");
  });

  it("coerces null to empty string (keeps React inputs controlled)", () => {
    const result = normalizeToStringRecord({ expiryDate: null });
    expect(result.expiryDate).toBe("");
  });

  it("coerces undefined to empty string", () => {
    const result = normalizeToStringRecord({ middleName: undefined });
    expect(result.middleName).toBe("");
  });
});
