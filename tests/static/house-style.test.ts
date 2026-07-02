import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readSkill, REPO } from "./lib/skills";

const REQUIRED_DEFAULTS = ["web-ux-motion", "app-ux-motion", "interaction-patterns"];
const COMMON_MISTAKES = ["web-ux-motion", "app-ux-motion", "interaction-patterns", "designer-handoff"];

describe.each(REQUIRED_DEFAULTS)("house style — REQUIRED DEFAULTS: %s", (folder) => {
  it("has a REQUIRED DEFAULTS section", () => {
    expect(readSkill(folder)).toMatch(/^## REQUIRED DEFAULTS/m);
  });
});

describe.each(COMMON_MISTAKES)("house style — Common mistakes: %s", (folder) => {
  it("has a Common mistakes section", () => {
    expect(readSkill(folder)).toMatch(/^## Common mistakes/m);
  });
});

describe("motion-tokens.css reduced-motion fallback", () => {
  const css = readFileSync(join(REPO, "web-ux-motion", "motion-tokens.css"), "utf8");
  it("has a prefers-reduced-motion block", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });
  it("collapses durations under reduced motion", () => {
    const block = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(block).toMatch(/--dur-(fast|base|slow):\s*0?\.?0*1?m?s/);
  });
});
