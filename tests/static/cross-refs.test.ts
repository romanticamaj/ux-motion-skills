import { describe, it, expect } from "vitest";
import { SKILLS, readSkill } from "./lib/skills";

const KNOWN = new Set(SKILLS);

// Backticked hyphenated terms that look like skill names but are not — a package
// name and CSS media features. Anything else with a skill-shaped suffix that is
// not a KNOWN skill is treated as a (probably mistyped) skill reference.
const NON_SKILL = new Set(["framer-motion", "prefers-reduced-motion", "reduced-motion"]);
const SKILL_SUFFIX = /-(motion|patterns|handoff|principles)$/;

describe.each(SKILLS)("cross-refs: %s", (folder) => {
  const md = readSkill(folder);
  const referenced = [...md.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)]
    .map((m) => m[1])
    .filter((n) => SKILL_SUFFIX.test(n) && !NON_SKILL.has(n));

  it("only references skills that exist", () => {
    const unknown = [...new Set(referenced)].filter((n) => !KNOWN.has(n));
    expect(unknown).toEqual([]);
  });
});
