import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
export const SKILLS = [
  "motion-principles",
  "web-ux-motion",
  "app-ux-motion",
  "designer-handoff",
  "interaction-patterns",
];

// Normalize CRLF → LF so parsers are line-ending-agnostic (some SKILL.md are CRLF).
export const readSkill = (folder: string): string =>
  readFileSync(join(REPO, folder, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");

export function parseFrontmatter(md: string): { name?: string; description?: string } {
  const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return { name, description };
}
