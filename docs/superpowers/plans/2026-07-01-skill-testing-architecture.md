# Skill Testing Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-layer test suite that (1) guards the shared motion-token vocabulary and SKILL.md structure statically, and (2) verifies via headless Claude Code that each skill actually changes agent output.

**Architecture:** A `tests/static/` layer (Vitest, no model, every-commit CI) with pure string-parsing token/frontmatter/snippet/cross-ref checks, and a `tests/eval/` layer (Promptfoo, on-demand) that runs each terse prompt through headless Claude Code twice — once with the pack installed (treatment) and once without (baseline) — scoring with deterministic assertions plus an LLM rubric, then gating on the treatment-beats-baseline delta.

**Tech Stack:** Node 24 / npm 11, TypeScript, Vitest, Promptfoo, headless Claude Code (`claude -p --output-format json`).

## Global Constraints

- No application code exists in this repo; tests validate prose `SKILL.md` files and one `.css` file.
- All test tooling lives under `tests/`; do not add runtime deps, only devDependencies.
- Canonical token values (verbatim — every parser and fixture must match these):
  - Durations: `--dur-fast` 160ms (0.16s), `--dur-base` 240ms (0.24s), `--dur-slow` 320ms (0.32s)
  - Easings: `--ease-out` `0.22,1,0.36,1`; `--ease-in` `0.4,0,1,1`; `--ease-standard` `0.4,0,0.2,1`; `--ease-emphasized` `0.16,1,0.3,1`
  - Springs: `snappy` stiffness 300 / damping 30; `gentle` stiffness 200 / damping 26
- **Source participation (which files carry which dimension — do NOT cross-check a dimension a source doesn't define):**
  - Exact durations: sources **A** (`web-ux-motion/motion-tokens.css`), **B** (inline `motion-tokens.ts` in `app-ux-motion/SKILL.md`), **C** (`designer-handoff/SKILL.md` table). **NOT** `motion-principles` — it intentionally lists duration *bands* (100–150 / 180–260 / 280–360), not exact values.
  - Easings: sources **A**, **C**, **D** (`motion-principles/SKILL.md`). **NOT** B (the `.ts` has no easings).
  - Springs: sources **A**, **B**, **C**, **D**.
- ESM project (`"type": "module"`); the Promptfoo custom provider file is `.cjs` (Promptfoo loads it via CommonJS).
- Commit after every task with a `test:`/`feat:`/`chore:` prefix; append the two trailer lines used elsewhere in this repo's history is not required for these commits.

---

### Task 1: Scaffold the Node/Vitest/TypeScript project + duration normalizer

**Files:**
- Create: `package.json`
- Create: `vitest.config.ts`
- Create: `tsconfig.json`
- Create: `.gitignore` (append `node_modules/`)
- Create: `tests/static/lib/parse-tokens.ts`
- Test: `tests/static/lib/parse-tokens.test.ts`

**Interfaces:**
- Produces: `normalizeDuration(raw: string): number` (returns milliseconds); type exports `Easing = [number, number, number, number]`, `Spring = { stiffness: number; damping: number }`, `TokenSet = { durations?: Partial<Record<"fast"|"base"|"slow", number>>; easings?: Partial<Record<"out"|"in"|"standard"|"emphasized", Easing>>; springs?: Partial<Record<"snappy"|"gentle", Spring>> }`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "ux-motion-skills-tests",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "eval": "node tests/eval/run.js"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "esbuild": "^0.24.0",
    "postcss": "^8.4.0",
    "promptfoo": "^0.121.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["tests/**/*.ts"]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["tests/static/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Append to `.gitignore`**

```
node_modules/
tests/eval/**/results.json
```

- [ ] **Step 5: Install deps**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 6: Write the failing test**

`tests/static/lib/parse-tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { normalizeDuration } from "./parse-tokens";

describe("normalizeDuration", () => {
  it("parses seconds to ms", () => expect(normalizeDuration("0.16s")).toBe(160));
  it("parses ms directly", () => expect(normalizeDuration("240ms")).toBe(240));
  it("parses a bare number as ms", () => expect(normalizeDuration("320")).toBe(320));
  it("trims whitespace", () => expect(normalizeDuration("  0.32s ")).toBe(320));
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `parse-tokens` has no export `normalizeDuration` (or module not found).

- [ ] **Step 8: Write minimal implementation**

`tests/static/lib/parse-tokens.ts`:

```ts
export type Easing = [number, number, number, number];
export interface Spring { stiffness: number; damping: number; }
export interface TokenSet {
  durations?: Partial<Record<"fast" | "base" | "slow", number>>;
  easings?: Partial<Record<"out" | "in" | "standard" | "emphasized", Easing>>;
  springs?: Partial<Record<"snappy" | "gentle", Spring>>;
}

export function normalizeDuration(raw: string): number {
  const s = raw.trim();
  if (s.endsWith("ms")) return parseFloat(s);
  if (s.endsWith("s")) return Math.round(parseFloat(s) * 1000);
  return parseFloat(s); // bare number = ms
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts .gitignore tests/
git commit -m "chore: scaffold Vitest test project + duration normalizer"
```

---

### Task 2: Token parsers for all four sources

**Files:**
- Modify: `tests/static/lib/parse-tokens.ts`
- Test: `tests/static/lib/parse-tokens.test.ts`

**Interfaces:**
- Consumes: `normalizeDuration`, `Easing`, `Spring`, `TokenSet` from Task 1.
- Produces: `parseCssTokens(css: string): TokenSet`, `parseTsTokens(md: string): TokenSet`, `parseHandoffTokens(md: string): TokenSet`, `parsePrinciplesTokens(md: string): TokenSet`. Each returns only the dimensions its source defines (see Global Constraints source participation).

- [ ] **Step 1: Write the failing tests** (append to `parse-tokens.test.ts`)

```ts
import {
  parseCssTokens, parseTsTokens, parseHandoffTokens, parsePrinciplesTokens,
} from "./parse-tokens";

describe("parseCssTokens", () => {
  const css = `:root{
    --dur-fast:0.16s; --dur-base:0.24s; --dur-slow:0.32s;
    --ease-out:cubic-bezier(0.22, 1, 0.36, 1);
    --ease-in:cubic-bezier(0.4, 0, 1, 1);
    --ease-standard:cubic-bezier(0.4, 0, 0.2, 1);
    --ease-emphasized:cubic-bezier(0.16, 1, 0.3, 1);
    --spring-snappy:300 30; --spring-gentle:200 26;
  }
  @media (prefers-reduced-motion: reduce){:root{--dur-fast:0.01ms;}}`;
  it("reads durations from :root only", () => {
    expect(parseCssTokens(css).durations).toEqual({ fast: 160, base: 240, slow: 320 });
  });
  it("reads easings", () => {
    expect(parseCssTokens(css).easings!.out).toEqual([0.22, 1, 0.36, 1]);
  });
  it("reads springs as stiffness/damping", () => {
    expect(parseCssTokens(css).springs!.snappy).toEqual({ stiffness: 300, damping: 30 });
  });
});

describe("parseTsTokens", () => {
  const md = "```ts\nexport const spring = {\n  snappy: { damping: 30, stiffness: 300, mass: 0.9 },\n  gentle: { damping: 26, stiffness: 200, mass: 1 },\n};\nexport const dur = { fast: 160, base: 240, slow: 320 };\n```";
  it("reads durations", () => expect(parseTsTokens(md).durations).toEqual({ fast: 160, base: 240, slow: 320 }));
  it("reads springs", () => expect(parseTsTokens(md).springs!.gentle).toEqual({ stiffness: 200, damping: 26 }));
  it("does not report easings", () => expect(parseTsTokens(md).easings).toBeUndefined());
});

describe("parseHandoffTokens", () => {
  const md = [
    "| `--dur-fast` | 160ms | exits |",
    "| `--dur-base` | 240ms | enters |",
    "| `--dur-slow` | 320ms | hero |",
    "| `--ease-out` | `0.22, 1, 0.36, 1` | entrances |",
    "| `--ease-in` | `0.4, 0, 1, 1` | exits |",
    "| `--ease-standard` | `0.4, 0, 0.2, 1` | cross-fade |",
    "| `--ease-emphasized` | `0.16, 1, 0.3, 1` | hero |",
    "| `spring.snappy` | 30 / 300 | buttons |",
    "| `spring.gentle` | 26 / 200 | cards |",
  ].join("\n");
  it("reads durations", () => expect(parseHandoffTokens(md).durations).toEqual({ fast: 160, base: 240, slow: 320 }));
  it("reads easings", () => expect(parseHandoffTokens(md).easings!.emphasized).toEqual([0.16, 1, 0.3, 1]));
  it("reads springs (damping / stiffness order)", () =>
    expect(parseHandoffTokens(md).springs!.snappy).toEqual({ stiffness: 300, damping: 30 }));
});

describe("parsePrinciplesTokens", () => {
  const md = [
    "| Enter (decelerate) | ease-out | `0.22, 1, 0.36, 1` |",
    "| Exit (accelerate away) | ease-in | `0.4, 0, 1, 1` |",
    "| Move-through / cross-fade | standard | `0.4, 0, 0.2, 1` |",
    "| Hero / shared-element | emphasized ease-out | `0.16, 1, 0.3, 1` |",
    "- Snappy (buttons, toggles): `stiffness 300, damping 30`",
    "- Gentle (cards, sheets): `stiffness 200, damping 26`",
  ].join("\n");
  it("reads easings positionally from the table", () =>
    expect(parsePrinciplesTokens(md).easings!.in).toEqual([0.4, 0, 1, 1]));
  it("reads springs from prose", () =>
    expect(parsePrinciplesTokens(md).springs!.gentle).toEqual({ stiffness: 200, damping: 26 }));
  it("does not report exact durations", () =>
    expect(parsePrinciplesTokens(md).durations).toBeUndefined());
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — parse functions not exported.

- [ ] **Step 3: Implement the parsers** (append to `parse-tokens.ts`)

```ts
const easingFromCsv = (csv: string): Easing =>
  csv.split(",").map((n) => parseFloat(n.trim())) as Easing;

export function parseCssTokens(css: string): TokenSet {
  const root = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const dur = (n: string) => {
    const m = root.match(new RegExp(`--dur-${n}\\s*:\\s*([^;]+);`));
    return m ? normalizeDuration(m[1]) : undefined;
  };
  const ease = (n: string): Easing | undefined => {
    const m = root.match(new RegExp(`--ease-${n}\\s*:\\s*cubic-bezier\\(([^)]+)\\)`));
    return m ? easingFromCsv(m[1]) : undefined;
  };
  const spring = (n: string): Spring | undefined => {
    const m = root.match(new RegExp(`--spring-${n}\\s*:\\s*([\\d.]+)\\s+([\\d.]+)`));
    return m ? { stiffness: parseFloat(m[1]), damping: parseFloat(m[2]) } : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    easings: { out: ease("out"), in: ease("in"), standard: ease("standard"), emphasized: ease("emphasized") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parseTsTokens(md: string): TokenSet {
  const springBlock = md.match(/export const spring\s*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
  const durBlock = md.match(/export const dur\s*=\s*\{([^}]*)\}/)?.[1] ?? "";
  const spring = (n: string): Spring | undefined => {
    const sub = springBlock.match(new RegExp(`${n}:\\s*\\{([^}]*)\\}`))?.[1];
    if (!sub) return undefined;
    const stiffness = Number(sub.match(/stiffness:\s*(\d+)/)?.[1]);
    const damping = Number(sub.match(/damping:\s*(\d+)/)?.[1]);
    return { stiffness, damping };
  };
  const dur = (n: string) => {
    const m = durBlock.match(new RegExp(`${n}:\\s*(\\d+)`));
    return m ? Number(m[1]) : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parseHandoffTokens(md: string): TokenSet {
  const dur = (n: string) => {
    const m = md.match(new RegExp("`--dur-" + n + "`\\s*\\|\\s*([^|]+)\\|"));
    return m ? normalizeDuration(m[1]) : undefined;
  };
  const ease = (n: string): Easing | undefined => {
    const m = md.match(new RegExp("`--ease-" + n + "`\\s*\\|\\s*`([^`]+)`"));
    return m ? easingFromCsv(m[1]) : undefined;
  };
  // handoff table lists springs as "damping / stiffness"
  const spring = (n: string): Spring | undefined => {
    const m = md.match(new RegExp("`spring\\." + n + "`\\s*\\|\\s*(\\d+)\\s*/\\s*(\\d+)"));
    return m ? { damping: Number(m[1]), stiffness: Number(m[2]) } : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    easings: { out: ease("out"), in: ease("in"), standard: ease("standard"), emphasized: ease("emphasized") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parsePrinciplesTokens(md: string): TokenSet {
  // easing table rows in canonical order: enter(out), exit(in), move-through(standard), hero(emphasized)
  const cubics = [...md.matchAll(/`(\d[^`]*,\s*\d[^`]*,\s*\d[^`]*,\s*\d[^`]*)`/g)].map((m) => easingFromCsv(m[1]));
  const [out, inn, standard, emphasized] = cubics;
  const springProse = (n: string): Spring | undefined => {
    const m = md.match(new RegExp(n + "[^`]*`stiffness (\\d+), damping (\\d+)`", "i"));
    return m ? { stiffness: Number(m[1]), damping: Number(m[2]) } : undefined;
  };
  return {
    easings: out ? { out, in: inn, standard, emphasized } : undefined,
    springs: { snappy: springProse("snappy"), gentle: springProse("gentle") },
  };
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS (all parser tests green).

- [ ] **Step 5: Commit**

```bash
git add tests/static/lib/parse-tokens.ts tests/static/lib/parse-tokens.test.ts
git commit -m "test: add token parsers for the four canonical sources"
```

---

### Task 3: Token-consistency invariant (the crown-jewel test)

**Files:**
- Create: `tests/static/lib/compare-tokens.ts`
- Create: `tests/static/tokens.test.ts`
- Test: both above (the `.test.ts` is the test; `compare-tokens.ts` gets its own unit test inline)

**Interfaces:**
- Consumes: all four parsers + `TokenSet` from Task 2.
- Produces: `diffDimension(label: string, sets: Record<string, unknown>): string[]` — returns human-readable mismatch strings across a named group of `{sourceName: value}`; empty when all equal.

- [ ] **Step 1: Write the failing test**

`tests/static/tokens.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — `compare-tokens` / `diffDimension` not found.

- [ ] **Step 3: Implement `diffDimension`**

`tests/static/lib/compare-tokens.ts`:

```ts
// Compares one dimension (durations | easings | springs) across N named sources.
// Returns [] when every source that defines a key agrees on it; otherwise a list of mismatches.
export function diffDimension(label: string, sets: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const entries = Object.entries(sets).filter(([, v]) => v != null) as [string, Record<string, unknown>][];
  const keys = new Set<string>();
  for (const [, obj] of entries) for (const k of Object.keys(obj)) if (obj[k] != null) keys.add(k);

  for (const key of keys) {
    const seen: { source: string; json: string }[] = [];
    for (const [source, obj] of entries) {
      if (obj[key] == null) continue;
      seen.push({ source, json: JSON.stringify(obj[key]) });
    }
    const distinct = new Set(seen.map((s) => s.json));
    if (distinct.size > 1) {
      const detail = seen.map((s) => `${s.source}=${s.json}`).join(", ");
      problems.push(`${label}.${key} disagrees: ${detail}`);
    }
  }
  return problems;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS — real files are currently consistent, and the drift test is green.

- [ ] **Step 5: Manually prove it catches real drift**

Temporarily edit `web-ux-motion/motion-tokens.css` `--dur-base: 0.24s;` → `0.25s;`.
Run: `npm test`
Expected: FAIL with `durations.base disagrees: A=250, B=240, C=240`.
Then revert the edit and re-run: `npm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add tests/static/lib/compare-tokens.ts tests/static/tokens.test.ts
git commit -m "test: assert motion-token consistency across the four sources"
```

---

### Task 4: Frontmatter validity test

**Files:**
- Create: `tests/static/lib/skills.ts`
- Create: `tests/static/frontmatter.test.ts`

**Interfaces:**
- Produces: `SKILLS: string[]` (the five skill folder names), `readSkill(folder: string): string` (returns SKILL.md content), `parseFrontmatter(md: string): { name?: string; description?: string }`.

- [ ] **Step 1: Write the failing test**

`tests/static/frontmatter.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SKILLS, readSkill, parseFrontmatter } from "./lib/skills";

describe.each(SKILLS)("frontmatter: %s", (folder) => {
  const fm = parseFrontmatter(readSkill(folder));
  it("name equals the folder", () => expect(fm.name).toBe(folder));
  it("name is kebab-case", () => expect(fm.name).toMatch(/^[a-z]+(-[a-z]+)*$/));
  it("has a non-trivial description", () => expect((fm.description ?? "").length).toBeGreaterThan(30));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — `./lib/skills` not found.

- [ ] **Step 3: Implement `skills.ts`**

`tests/static/lib/skills.ts`:

```ts
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

export const readSkill = (folder: string): string =>
  readFileSync(join(REPO, folder, "SKILL.md"), "utf8");

export function parseFrontmatter(md: string): { name?: string; description?: string } {
  const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  return { name, description };
}
```

Note: `REPO` climbs three levels (`lib` → `static` → `tests` → repo root). Verify by running the test.

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS (15 assertions across 5 skills).

- [ ] **Step 5: Commit**

```bash
git add tests/static/lib/skills.ts tests/static/frontmatter.test.ts
git commit -m "test: validate SKILL.md frontmatter (name matches folder, description present)"
```

---

### Task 5: Snippet syntax test

**Files:**
- Create: `tests/static/lib/extract-snippets.ts`
- Create: `tests/static/snippets.test.ts`
- Test: `tests/static/lib/extract-snippets.test.ts`

**Interfaces:**
- Consumes: `SKILLS`, `readSkill` from Task 4.
- Produces: `extractCodeBlocks(md: string): { lang: string; code: string }[]`.

- [ ] **Step 1: Write the failing unit test for the extractor**

`tests/static/lib/extract-snippets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { extractCodeBlocks } from "./extract-snippets";

describe("extractCodeBlocks", () => {
  const md = "text\n```tsx\nconst x = <div/>;\n```\nmore\n```css\n.a{color:red}\n```\n";
  it("returns each fenced block with its language", () => {
    const blocks = extractCodeBlocks(md);
    expect(blocks).toEqual([
      { lang: "tsx", code: "const x = <div/>;\n" },
      { lang: "css", code: ".a{color:red}\n" },
    ]);
  });
  it("ignores fences with no language", () => {
    expect(extractCodeBlocks("```\nplain\n```")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm test`
Expected: FAIL — extractor not found.

- [ ] **Step 3: Implement `extract-snippets.ts`**

```ts
export function extractCodeBlocks(md: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  const re = /```([A-Za-z0-9]+)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) blocks.push({ lang: m[1], code: m[2] });
  return blocks;
}
```

- [ ] **Step 4: Write the integration test that parses real snippets**

`tests/static/snippets.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { transformSync } from "esbuild";
import postcss from "postcss";
import { SKILLS, readSkill } from "./lib/skills";
import { extractCodeBlocks } from "./lib/extract-snippets";

const JS_LANGS = new Set(["ts", "tsx", "js", "jsx"]);

for (const folder of SKILLS) {
  const blocks = extractCodeBlocks(readSkill(folder));
  describe(`snippets: ${folder}`, () => {
    blocks.forEach((b, i) => {
      if (JS_LANGS.has(b.lang)) {
        it(`block #${i} (${b.lang}) is syntactically valid`, () => {
          expect(() =>
            transformSync(b.code, { loader: b.lang as "ts" | "tsx" | "js" | "jsx" }),
          ).not.toThrow();
        });
      } else if (b.lang === "css") {
        it(`block #${i} (css) is syntactically valid`, () => {
          expect(() => postcss.parse(b.code)).not.toThrow();
        });
      }
    });
  });
}
```

- [ ] **Step 5: Run to verify pass**

Run: `npm test`
Expected: PASS. If a genuine syntax error surfaces in a SKILL.md snippet, that is a real find — fix the SKILL.md, then re-run. (Syntax only; esbuild transform does not type-check.)

- [ ] **Step 6: Commit**

```bash
git add tests/static/lib/extract-snippets.ts tests/static/lib/extract-snippets.test.ts tests/static/snippets.test.ts
git commit -m "test: syntax-check tsx/ts/css snippets embedded in SKILL.md files"
```

---

### Task 6: Cross-reference integrity test

**Files:**
- Create: `tests/static/cross-refs.test.ts`

**Interfaces:**
- Consumes: `SKILLS`, `readSkill` from Task 4.

- [ ] **Step 1: Write the test**

`tests/static/cross-refs.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { SKILLS, readSkill } from "./lib/skills";

const KNOWN = new Set(SKILLS);

describe.each(SKILLS)("cross-refs: %s", (folder) => {
  const md = readSkill(folder);
  // any backticked `some-skill` token that looks like a sibling skill reference must resolve
  const referenced = [...md.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)]
    .map((m) => m[1])
    .filter((n) => n.endsWith("-motion") || n === "interaction-patterns" || n === "designer-handoff" || n === "motion-principles");

  it("only references skills that exist", () => {
    const unknown = [...new Set(referenced)].filter((n) => !KNOWN.has(n));
    expect(unknown).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it passes**

Run: `npm test`
Expected: PASS. A failure means a SKILL.md cites a skill name that doesn't exist (typo or renamed folder) — fix the reference.

- [ ] **Step 3: Prove it catches a bad reference**

Temporarily add the text `` see `web-uxx-motion` `` to `motion-principles/SKILL.md`.
Run: `npm test`
Expected: FAIL — `cross-refs: motion-principles` reports `["web-uxx-motion"]`. Revert and re-run → PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/static/cross-refs.test.ts
git commit -m "test: verify cross-skill references resolve to real skills"
```

---

### Task 7: Eval fixtures + headless Claude Code provider

**Files:**
- Create: `tests/eval/fixtures/config-baseline/.keep`
- Create: `tests/eval/fixtures/config-with-skills/plugins/` (seeded with the pack — see steps)
- Create: `tests/eval/providers/claude-code.cjs`
- Create: `tests/eval/providers/README.md` (documents the CLAUDE_CONFIG_DIR toggle)

**Interfaces:**
- Produces: a Promptfoo custom provider at `tests/eval/providers/claude-code.cjs` exporting a class whose `callApi(prompt)` returns `{ output: string }`, driven by `config.configDir` (path to a `CLAUDE_CONFIG_DIR`).

- [ ] **Step 1: Create the baseline config dir (pack NOT installed)**

```bash
mkdir -p tests/eval/fixtures/config-baseline
touch tests/eval/fixtures/config-baseline/.keep
```

- [ ] **Step 2: Create the with-skills config dir (pack installed as skills)**

Seed an isolated `CLAUDE_CONFIG_DIR` whose `skills/` contains the five skill folders, so `claude -p` auto-triggers them by description. From repo root:

```bash
mkdir -p tests/eval/fixtures/config-with-skills/skills
for s in motion-principles web-ux-motion app-ux-motion designer-handoff interaction-patterns; do
  cp -R "$s" "tests/eval/fixtures/config-with-skills/skills/$s"
done
```

Note: this copies the skills. If you prefer a single source of truth, replace the copies with symlinks; on Windows, keep the copy approach. Add a follow-up chore later to sync these on skill changes (or generate them in the eval run script — see Task 9).

- [ ] **Step 3: Write the provider**

`tests/eval/providers/claude-code.cjs`:

```js
const { execFileSync } = require("node:child_process");
const { resolve } = require("node:path");

// Promptfoo custom provider: runs headless Claude Code against a specific CLAUDE_CONFIG_DIR.
class ClaudeCodeProvider {
  constructor(options) {
    this.providerId = options.id || "claude-code";
    this.config = options.config || {};
  }
  id() {
    return this.providerId;
  }
  async callApi(prompt) {
    const configDir = resolve(this.config.configDir);
    try {
      const stdout = execFileSync(
        "claude",
        ["-p", prompt, "--output-format", "json"],
        {
          encoding: "utf8",
          maxBuffer: 20 * 1024 * 1024,
          env: { ...process.env, CLAUDE_CONFIG_DIR: configDir },
        },
      );
      const parsed = JSON.parse(stdout);
      return { output: typeof parsed.result === "string" ? parsed.result : stdout };
    } catch (err) {
      return { error: String(err && err.message ? err.message : err) };
    }
  }
}

module.exports = ClaudeCodeProvider;
```

- [ ] **Step 4: Smoke-test the provider manually**

```bash
node -e "const P=require('./tests/eval/providers/claude-code.cjs'); new P({id:'t',config:{configDir:'tests/eval/fixtures/config-with-skills'}}).callApi('say the single word: ok').then(r=>console.log(r)).catch(e=>{console.error(e);process.exit(1)})"
```

Expected: prints `{ output: '...ok...' }` (a short model reply). If it errors on auth, ensure `claude` is logged in for the runner. This step confirms the provider wiring before wasting a full eval run.

- [ ] **Step 5: Commit**

```bash
git add tests/eval/fixtures tests/eval/providers
git commit -m "feat: eval fixtures + headless Claude Code Promptfoo provider"
```

---

### Task 8: Corpus + Promptfoo config

**Files:**
- Create: `tests/eval/corpus/web-ux-motion.yaml`
- Create: `tests/eval/corpus/app-ux-motion.yaml`
- Create: `tests/eval/corpus/interaction-patterns.yaml`
- Create: `tests/eval/corpus/designer-handoff.yaml`
- Create: `tests/eval/corpus/motion-principles.yaml`
- Create: `tests/eval/promptfooconfig.yaml`

**Interfaces:**
- Consumes: the provider from Task 7.
- Produces: a runnable `promptfoo eval -c tests/eval/promptfooconfig.yaml` that scores baseline vs treatment.

- [ ] **Step 1: Write one corpus file** (`tests/eval/corpus/web-ux-motion.yaml`)

```yaml
- vars:
    prompt: "make this list smoother"
  assert:
    - { type: icontains-all, value: ["motion/react", "AnimatePresence", "popLayout", "prefers-reduced-motion"] }
    - { type: not-icontains, value: "framer-motion" }
    - type: llm-rubric
      value: "Uses the `motion` library (import from motion/react), NOT framer-motion; wraps the list in AnimatePresence with mode popLayout and layout; honors prefers-reduced-motion with a real fallback; animates only transform/opacity; enter uses ease-out and exit is faster."
- vars:
    prompt: "the page change feels harsh, fix it"
  assert:
    - { type: icontains-all, value: ["startViewTransition", "prefers-reduced-motion"] }
    - type: llm-rubric
      value: "Recommends the native View Transitions API (document.startViewTransition or router opt-in), NOT a JS AnimatePresence route wrapper; includes a reduced-motion guard."
```

- [ ] **Step 2: Write the other four corpus files** (2 cases each)

`tests/eval/corpus/app-ux-motion.yaml`:

```yaml
- vars:
    prompt: "make the app list feel smoother"
  assert:
    - { type: icontains-all, value: ["LinearTransition", "useReducedMotion"] }
    - type: llm-rubric
      value: "Uses Reanimated layout animations (LinearTransition.springify plus entering/exiting); honors useReducedMotion; exit faster than enter; shared spring tokens rather than ad-hoc values."
- vars:
    prompt: "the bottom sheet just snaps open"
  assert:
    - { type: icontains-all, value: ["bottom-sheet", "spring"] }
    - type: llm-rubric
      value: "Recommends @gorhom/bottom-sheet v5 with spring animationConfigs from shared tokens and GestureHandlerRootView; not a hand-rolled timing snap."
```

`tests/eval/corpus/interaction-patterns.yaml`:

```yaml
- vars:
    prompt: "the like button feels laggy"
  assert:
    - { type: icontains-all, value: ["useOptimistic", "rollback"] }
    - type: llm-rubric
      value: "Recommends optimistic UI that updates the same frame with a rollback path (useOptimistic or TanStack onMutate snapshot); mentions coalescing rapid toggles."
- vars:
    prompt: "loading shows a spinner then everything jumps"
  assert:
    - { type: icontains-all, value: ["skeleton", "aspect-ratio", "prefers-reduced-motion"] }
    - type: llm-rubric
      value: "Recommends a layout-accurate skeleton reserving space (aspect-ratio), a flash-guard (>~180ms to show, ~300-500ms min), keepPreviousData on refetch, and a reduced-motion branch on the shimmer."
```

`tests/eval/corpus/designer-handoff.yaml`:

```yaml
- vars:
    prompt: "spec this modal so it feels premium and snappy"
  assert:
    - { type: icontains-all, value: ["--dur-", "--ease-", "reduced-motion"] }
    - { type: not-icontains, value: "linear" }
    - type: llm-rubric
      value: "Produces a filled-in spec using the canonical tokens (--dur-*, --ease-*, spring.*) rather than adjectives; scale up from ~0.96, exit faster than enter, transform/opacity only, explicit reduced-motion line."
- vars:
    prompt: "hand off the animation for a long list to engineering"
  assert:
    - { type: icontains-all, value: ["stagger", "reduced-motion"] }
    - type: llm-rubric
      value: "Uses the handoff template with token values and an explicit stagger CAP (~8 items / ~300ms) and a reduced-motion fallback."
```

`tests/eval/corpus/motion-principles.yaml`:

```yaml
- vars:
    prompt: "what duration and easing should a dropdown open with"
  assert:
    - type: llm-rubric
      value: "Gives a value in the 150-350ms band with ease-out for the enter and a faster ease-in exit; explains transform/opacity only and honoring reduced-motion; does not suggest linear."
- vars:
    prompt: "should I animate a table that refreshes 50 rows"
  assert:
    - type: llm-rubric
      value: "Advises NOT animating high-frequency/bulk changes; explains motion should clarify a change and otherwise be cut."
```

- [ ] **Step 3: Write `tests/eval/promptfooconfig.yaml`**

```yaml
description: ux-motion-skills behavioral eval (baseline vs treatment)

prompts:
  - "{{prompt}}"

providers:
  - id: file://providers/claude-code.cjs
    label: baseline
    config:
      configDir: fixtures/config-baseline
  - id: file://providers/claude-code.cjs
    label: treatment
    config:
      configDir: fixtures/config-with-skills

# grade llm-rubric assertions with Claude, not the default OpenAI
defaultTest:
  options:
    provider: anthropic:messages:claude-opus-4-8

tests:
  - file://corpus/web-ux-motion.yaml
  - file://corpus/app-ux-motion.yaml
  - file://corpus/interaction-patterns.yaml
  - file://corpus/designer-handoff.yaml
  - file://corpus/motion-principles.yaml
```

- [ ] **Step 4: Run the eval once to confirm it wires up**

```bash
npx promptfoo eval -c tests/eval/promptfooconfig.yaml -o tests/eval/results.json
```

Expected: Promptfoo runs each of the 10 cases against both providers, prints a pass/fail matrix, and writes `results.json`. Treatment should visibly out-score baseline on the skill-specific assertions. (Requires `ANTHROPIC_API_KEY` for the judge and a logged-in `claude` CLI for the providers.)

- [ ] **Step 5: Commit**

```bash
git add tests/eval/corpus tests/eval/promptfooconfig.yaml
git commit -m "feat: eval corpus + Promptfoo config for the five skills"
```

---

### Task 9: Delta gate + eval run script + docs

**Files:**
- Create: `tests/eval/delta.js`
- Create: `tests/eval/run.js`
- Modify: `package.json` (the `eval` script already points at `run.js` from Task 1)
- Create: `tests/README.md`

**Interfaces:**
- Consumes: `tests/eval/results.json` produced by `promptfoo eval`.
- Produces: `run.js` (regenerates with-skills fixture, runs promptfoo, then delta) and `delta.js` (exits non-zero when treatment does not beat baseline by the threshold).

- [ ] **Step 1: Write `delta.js`**

`tests/eval/delta.js`:

```js
import { readFileSync } from "node:fs";

const THRESHOLD = Number(process.env.EVAL_DELTA_THRESHOLD ?? "0.15");
const data = JSON.parse(readFileSync(new URL("./results.json", import.meta.url), "utf8"));

// promptfoo v0.121 shape: data.results.results[] with { provider: {label}, score }
const rows = data.results?.results ?? [];
const byLabel = {};
for (const r of rows) {
  const label = r.provider?.label ?? r.provider?.id ?? "unknown";
  (byLabel[label] ??= []).push(typeof r.score === "number" ? r.score : r.success ? 1 : 0);
}
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const baseline = mean(byLabel.baseline ?? []);
const treatment = mean(byLabel.treatment ?? []);
const delta = treatment - baseline;

console.log(`baseline mean score:  ${baseline.toFixed(3)}`);
console.log(`treatment mean score: ${treatment.toFixed(3)}`);
console.log(`delta:                ${delta.toFixed(3)} (threshold ${THRESHOLD})`);

if (delta < THRESHOLD) {
  console.error(`FAIL: skills did not improve output by the required margin.`);
  process.exit(1);
}
console.log("PASS: skills improve agent output beyond baseline.");
```

- [ ] **Step 2: Write `run.js`** (regenerate fixture → eval → delta)

`tests/eval/run.js`:

```js
import { execFileSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const evalDir = dirname(fileURLToPath(import.meta.url));
const repo = join(evalDir, "..", "..");
const skills = ["motion-principles", "web-ux-motion", "app-ux-motion", "designer-handoff", "interaction-patterns"];

// 1. Rebuild the with-skills fixture from the live skill folders (single source of truth).
const skillsDir = join(evalDir, "fixtures", "config-with-skills", "skills");
rmSync(skillsDir, { recursive: true, force: true });
mkdirSync(skillsDir, { recursive: true });
for (const s of skills) cpSync(join(repo, s), join(skillsDir, s), { recursive: true });

// 2. Run the eval.
execFileSync("npx", ["promptfoo", "eval", "-c", join(evalDir, "promptfooconfig.yaml"), "-o", join(evalDir, "results.json")], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

// 3. Gate on the delta.
execFileSync("node", [join(evalDir, "delta.js")], { stdio: "inherit" });
```

This makes `npm run eval` regenerate the fixture (so it never goes stale), run Promptfoo, and enforce the delta gate in one command.

- [ ] **Step 3: Run the full eval command**

Run: `npm run eval`
Expected: fixture rebuilt, Promptfoo matrix printed, then delta summary ending in `PASS: skills improve agent output beyond baseline.` (exit 0). If it prints `FAIL`, inspect the matrix in `results.json` to see which skill under-performed.

- [ ] **Step 4: Write `tests/README.md`**

```markdown
# Tests

Two layers (see `docs/superpowers/specs/2026-07-01-skill-testing-architecture-design.md`).

## Static (`tests/static/`) — fast, free, every commit
`npm test` — runs Vitest:
- `tokens.test.ts` — the four token sources must agree (durations A/B/C, easings A/C/D, springs A/B/C/D)
- `frontmatter.test.ts` — `name` matches folder, `description` present
- `snippets.test.ts` — tsx/ts/css blocks in SKILL.md parse (syntax only)
- `cross-refs.test.ts` — cited skill names resolve

## Eval (`tests/eval/`) — model in the loop, on demand
`npm run eval` — rebuilds the with-skills fixture, runs Promptfoo (baseline vs treatment via
headless Claude Code), then gates on the treatment-beats-baseline delta (`delta.js`,
`EVAL_DELTA_THRESHOLD`, default 0.15).

Requires: a logged-in `claude` CLI and `ANTHROPIC_API_KEY` (for the llm-rubric judge).

Langfuse (longitudinal tracking) is a documented future option, not part of this suite.
```

- [ ] **Step 5: Commit**

```bash
git add tests/eval/delta.js tests/eval/run.js tests/README.md
git commit -m "feat: delta gate + one-command eval runner + tests README"
```

---

## Self-Review

**Spec coverage:**
- Static token consistency → Tasks 2–3 (with the A/B/C/D source-participation nuance encoded). ✅
- Frontmatter / snippet syntax / cross-refs → Tasks 4–6. ✅
- Eval: headless Claude Code baseline-vs-treatment → Task 7 (provider + fixtures). ✅
- Corpus (2–3 terse prompts/skill) → Task 8. ✅
- Hybrid assertions (deterministic + llm-rubric) → Task 8 assertions. ✅
- Delta pass condition → Task 9 `delta.js`. ✅
- Cadence / CI note, Langfuse-as-future, single-source-tokens note → tests/README + spec; the run.js fixture rebuild also addresses the "copies go stale" risk raised in the spec. ✅

**Placeholder scan:** No TBD/TODO; every code step shows complete code; every run step states expected output. ✅

**Type consistency:** `TokenSet`/`Easing`/`Spring` defined in Task 1, consumed unchanged in Tasks 2–3. Parser names (`parseCssTokens`/`parseTsTokens`/`parseHandoffTokens`/`parsePrinciplesTokens`) identical across Tasks 2–3. `diffDimension` signature identical in Tasks 3. `SKILLS`/`readSkill`/`parseFrontmatter` defined in Task 4, reused in Tasks 5–6. Provider class contract (`callApi → {output}`) defined Task 7, consumed by config Task 8 and run.js Task 9. ✅

**Known runtime prerequisites (not code gaps):** the eval layer needs a logged-in `claude` CLI + `ANTHROPIC_API_KEY`; documented in Task 8/9 and tests/README.
