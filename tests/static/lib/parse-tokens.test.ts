import { describe, it, expect } from "vitest";
import { normalizeDuration } from "./parse-tokens";

describe("normalizeDuration", () => {
  it("parses seconds to ms", () => expect(normalizeDuration("0.16s")).toBe(160));
  it("parses ms directly", () => expect(normalizeDuration("240ms")).toBe(240));
  it("parses a bare number as ms", () => expect(normalizeDuration("320")).toBe(320));
  it("trims whitespace", () => expect(normalizeDuration("  0.32s ")).toBe(320));
});
