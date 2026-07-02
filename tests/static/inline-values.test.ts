import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SKILLS, readSkill, REPO } from "./lib/skills";
import { extractCodeBlocks } from "./lib/extract-snippets";
import { parseCssTokens, type Easing } from "./lib/parse-tokens";

// The canonical easings, from the CSS source of truth.
const canonical = parseCssTokens(readFileSync(join(REPO, "web-ux-motion", "motion-tokens.css"), "utf8"));
const CANON: Easing[] = Object.values(canonical.easings ?? {}).filter(Boolean) as Easing[];
const sameEasing = (a: Easing, b: Easing) => a.length === b.length && a.every((n, i) => n === b[i]);

// Pull every inline easing from a skill's code blocks: cubic-bezier(...) and 4-number arrays.
function inlineEasings(md: string): { raw: string; easing: Easing }[] {
  const found: { raw: string; easing: Easing }[] = [];
  const code = extractCodeBlocks(md).map((b) => b.code).join("\n");
  const num = "-?\\d*\\.?\\d+";
  const cubic = new RegExp(`cubic-bezier\\(\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*\\)`, "g");
  const arr = new RegExp(`\\[\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*,\\s*(${num})\\s*\\]`, "g");
  for (const re of [cubic, arr]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      found.push({ raw: m[0], easing: [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] });
    }
  }
  return found;
}

describe.each(SKILLS)("inline easing values: %s", (folder) => {
  const easings = inlineEasings(readSkill(folder));
  if (easings.length === 0) {
    it("has no inline easings to check", () => expect(easings).toEqual([]));
    return;
  }
  easings.forEach(({ raw, easing }, i) => {
    it(`inline easing #${i} ${raw} matches a canonical token`, () => {
      expect(CANON.some((c) => sameEasing(c, easing))).toBe(true);
    });
  });
});
