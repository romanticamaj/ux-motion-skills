import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  parseCssTokens, parseTsTokens, parseHandoffTokens, parsePrinciplesTokens,
} from "./lib/parse-tokens";
import { diffDimension } from "./lib/compare-tokens";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p: string) => readFileSync(join(repo, p), "utf8");

const A = parseCssTokens(read("web-ux-motion/motion-tokens.css"));
const B = parseTsTokens(read("app-ux-motion/SKILL.md"));
const C = parseHandoffTokens(read("designer-handoff/SKILL.md"));
const D = parsePrinciplesTokens(read("motion-principles/SKILL.md"));

describe("motion token consistency across sources", () => {
  it("durations agree (A css, B ts, C handoff)", () => {
    expect(diffDimension("durations", { A: A.durations, B: B.durations, C: C.durations })).toEqual([]);
  });
  it("easings agree (A css, C handoff, D principles)", () => {
    expect(diffDimension("easings", { A: A.easings, C: C.easings, D: D.easings })).toEqual([]);
  });
  it("springs agree (A, B, C, D)", () => {
    expect(diffDimension("springs", { A: A.springs, B: B.springs, C: C.springs, D: D.springs })).toEqual([]);
  });
});

describe("diffDimension catches drift", () => {
  it("reports a mismatch when one source disagrees", () => {
    const out = diffDimension("durations", { A: { fast: 160 }, B: { fast: 150 } });
    expect(out.length).toBeGreaterThan(0);
    expect(out[0]).toContain("fast");
  });
});
