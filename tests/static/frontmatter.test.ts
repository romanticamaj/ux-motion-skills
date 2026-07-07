import { describe, it, expect } from "vitest";
import { SKILLS, readSkill, parseFrontmatter } from "./lib/skills";

describe.each(SKILLS)("frontmatter: %s", (folder) => {
  const fm = parseFrontmatter(readSkill(folder));
  it("name equals the folder", () => expect(fm.name).toBe(folder));
  it("name is kebab-case", () => expect(fm.name).toMatch(/^[a-z]+(-[a-z]+)*$/));
  it("has a non-trivial description", () => expect((fm.description ?? "").length).toBeGreaterThan(30));
});
