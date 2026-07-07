# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A pack of five **Agent Skills** (no application code) that make a coding agent ship professional
UX motion on terse requests. Each skill is a folder with a `SKILL.md`; the agent auto-triggers it
from the `description` in the YAML frontmatter. There is **no build, test, lint, or run step** —
the deliverable is the prose, recipes, and token values inside the `SKILL.md` files. "Correctness"
is verified by re-running the RED test (see Methodology) by hand, not by a test runner.

Distributed as a Claude Code plugin via `.claude-plugin/marketplace.json`.

## The architecture that spans files: one motion-token vocabulary

The entire point of the pack is that **design, web, and app all reference the SAME named tokens
with the SAME values**. This is the invariant to protect. The canonical values appear in four
places that MUST agree:

- `web-ux-motion/motion-tokens.css` — the CSS source of truth (`--dur-*`, `--ease-*`, springs)
- `app-ux-motion/SKILL.md` — an inline `motion-tokens.ts` (`spring.snappy/gentle`, `dur.*`)
- `designer-handoff/SKILL.md` — the canonical-tokens table designers fill templates with
- `motion-principles/SKILL.md` — the duration/easing/spring tables behind the values

Canonical values (changing any one means updating all four, plus the JS-mirror comment block in
`motion-tokens.css` and any inline `transition={{...}}` examples that hard-code the cubic-beziers):

| Token | Value |
|-------|-------|
| `--dur-fast` | 160ms (0.16s) — exits/dismissals |
| `--dur-base` | 240ms (0.24s) — enters/list items/modals |
| `--dur-slow` | 320ms (0.32s) — hero/shared-element |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` — entrances |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` — exits |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` — cross-fade |
| `--ease-emphasized` | `cubic-bezier(0.16, 1, 0.3, 1)` — hero morph |
| `spring.snappy` | stiffness 300 / damping 30 |
| `spring.gentle` | stiffness 200 / damping 26 |

If a recipe hard-codes a number (e.g. `transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}`),
it should carry a comment tying it back to the token, and it must not drift from the table above.

## Skill dependency structure

`motion-principles` is the framework-agnostic foundation (values + when-NOT-to-animate). The other
four cite it as **REQUIRED BACKGROUND** rather than re-deriving values:

- `web-ux-motion` (React/web: `motion` lib, View Transitions API) → cites motion-principles
- `app-ux-motion` (RN Reanimated/Gesture, + SwiftUI/Compose notes) → cites motion-principles
- `interaction-patterns` (optimistic UI, skeletons, empty/error) → cites motion-principles + the two above
- `designer-handoff` (intent → spec in the shared tokens) → binds to the same token table

When editing, keep this layering: values and judgment live in `motion-principles`; the
implementation skills give recipes and point back to it. Don't duplicate value rationale across skills.

## House style enforced by every implementation skill

These recurring "REQUIRED DEFAULTS" are the pack's reason to exist — they're the defaults a no-skill
agent drops on terse requests. Preserve them when editing:

- Web library is **`motion`** (`import from "motion/react"`), never the old `framer-motion` name.
- Web list enter/exit/reorder uses `<AnimatePresence mode="popLayout">` + `layout`; web page
  transitions use the native **View Transitions API**, not JS route wrappers.
- App lists use Reanimated `LinearTransition.springify()` + `entering`/`exiting`; nav uses native-stack.
- **`prefers-reduced-motion` always has a real fallback** (instant or opacity-only) — never optional.
- **Enter = ease-out; exit = ease-in and ~30% faster.** Animate **only `transform`/`opacity`**
  (the `height:auto` list collapse is the one allowed exception).

## SKILL.md conventions

- Frontmatter is exactly `name` (kebab-case, matches folder) and `description` (when-to-use,
  written to auto-trigger on real/terse user phrasings — keep example phrasings in it).
- Each implementation skill ends with a "Common mistakes" table (mistake → fix). Keep that shape.
- The README's "Related & superior skills" section deliberately **defers** to stronger external
  tools (Motion AI Kit, GSAP skills, Vercel's web-animation-design). When editing scope, stay in
  the pack's lane (mobile, interaction patterns, designer handoff, the unified token system) rather
  than re-deriving content those tools own.

## Methodology (TDD-for-skills)

Built via `superpowers:writing-skills`: RED = capture how a no-skill agent answers a real terse
request and record the gaps; GREEN = write defaults/recipes closing exactly those gaps; REFACTOR =
re-test until a one-line request still hits the bar. When changing a skill, re-run its RED scenario
(the failure it was written to prevent, summarized in the README "Why this exists" section) rather
than assuming the edit is safe.
