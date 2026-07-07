# Skill Testing Architecture — Design

**Date:** 2026-07-01
**Repo:** `ux-motion-skills` (a pack of five prose Agent Skills — no application code)
**Status:** Approved for planning

## Problem

This repo ships five Agent Skills as prose (`SKILL.md` per folder). There is no build/run/test
step today, so nothing catches the two ways this pack can silently break:

1. **The shared motion-token vocabulary drifts.** The same canonical values are hand-copied into
   four files (`web-ux-motion/motion-tokens.css`, the inline `motion-tokens.ts` in
   `app-ux-motion/SKILL.md`, the `designer-handoff` table, the `motion-principles` tables). Editing
   one and forgetting the others makes the pack inconsistent — which destroys its entire reason to
   exist.
2. **A skill stops changing agent behavior.** The point of each skill is that a *terse* request
   ("make this list smoother") still yields the required defaults (`motion` not `framer-motion`,
   `popLayout`, a real reduced-motion fallback, transform/opacity only). Prose edits can regress
   this without anyone noticing.

These are two different failure modes needing two different test strategies.

## Architecture: two layers, two cadences

```
tests/
├── static/                    # Vitest · no model · runs every commit (fast / free / CI gate)
│   ├── tokens.test.ts             ★ core invariant: the 4 token sources must agree
│   ├── frontmatter.test.ts        name == folder; description present + has trigger phrasings
│   ├── snippets.test.ts           tsx/ts/css code blocks in SKILL.md parse (syntax only)
│   ├── cross-refs.test.ts         REQUIRED BACKGROUND references resolve to real skills
│   └── lib/
│       ├── parse-tokens.ts        extract canonical tokens from each of the 4 sources
│       └── extract-snippets.ts    pull fenced code blocks + lang from a SKILL.md
│
└── eval/                      # Promptfoo · model-in-the-loop · on-demand / nightly (slow / paid)
    ├── promptfooconfig.yaml       providers (baseline vs treatment) + tests + assertions
    ├── corpus/*.jsonl             terse prompts + must_include/must_not_include/rubric per skill
    ├── providers/
    │   └── claude-code.ts         custom exec provider: wraps `claude -p` with a CLAUDE_CONFIG_DIR
    ├── fixtures/
    │   ├── config-baseline/       CLAUDE_CONFIG_DIR seeded WITHOUT the pack
    │   └── config-with-skills/    CLAUDE_CONFIG_DIR seeded WITH the pack installed
    └── delta.ts                   glue: post-process Promptfoo JSON → treatment-beats-baseline gate
```

**Why two layers:** the static layer is deterministic, zero-cost, and gates every push. The eval
layer costs model calls, so it runs on demand (when skill prose changes) or nightly — not on every
commit.

**Tooling decision:** Node + Vitest for static (the tested content — tokens, tsx, css — lives in
the JS ecosystem; `motion-tokens.ts` can be imported directly). **Promptfoo** for eval (it natively
provides the runner + hybrid assertions + LLM-judge + comparison matrix + CI exit code we would
otherwise hand-build). **Langfuse is explicitly out of first version** (see Future options).

## Static layer

### `tokens.test.ts` — the crown jewel

Highest-value test in the pack. `parse-tokens.ts` extracts the canonical values from each source;
the test asserts all four agree, and on failure prints which token and which two sources disagree.

Sources:
- **A** — `web-ux-motion/motion-tokens.css`: `--dur-*`, `--ease-*`, `--spring-*`
- **B** — inline `motion-tokens.ts` fenced block in `app-ux-motion/SKILL.md`: `spring.*`, `dur.*`
- **C** — canonical-tokens table in `designer-handoff/SKILL.md`
- **D** — duration/easing/spring tables in `motion-principles/SKILL.md`

Canonical values under test (from `CLAUDE.md`): `--dur-fast` 160ms, `--dur-base` 240ms, `--dur-slow`
320ms; `--ease-out` `(0.22,1,0.36,1)`, `--ease-in` `(0.4,0,1,1)`, `--ease-standard` `(0.4,0,0.2,1)`,
`--ease-emphasized` `(0.16,1,0.3,1)`; `spring.snappy` 300/30, `spring.gentle` 200/26. The test must
normalize units (`0.16s` ⇔ `160ms`) before comparing.

### The other three (mechanical)

- **`frontmatter.test.ts`** — each SKILL.md frontmatter has exactly `name` (kebab-case, equals the
  folder name) and a non-empty `description`; description contains example trigger phrasings.
- **`snippets.test.ts`** — extract fenced ```tsx/```ts/```css blocks and syntax-parse them (tsx/ts
  via esbuild or the TypeScript compiler in transpile-only mode; css via postcss/lightningcss). This
  checks *syntax only*, not types — recipe deps are not installed.
- **`cross-refs.test.ts`** — every "REQUIRED BACKGROUND" / cited skill name points to a skill folder
  that exists; token names referenced in prose exist in the canonical set.

## Eval layer (Promptfoo-based)

### Corpus — the heart of the RED test

Each case is a terse prompt tagged with the required-defaults it must elicit:

```jsonc
{ "id": "web-list-smoother", "skill": "web-ux-motion",
  "prompt": "make this list smoother",
  "must_include": ["motion/react", "AnimatePresence", "popLayout", "prefers-reduced-motion"],
  "must_not_include": ["framer-motion"],
  "rubric": "Uses motion (not framer-motion); AnimatePresence + popLayout + layout; honors reduced-motion; animates transform/opacity only; enter ease-out, exit faster." }
```

Start with **2–3 terse prompts per skill** (~12–15 cases), drawn from the real phrasings baked into
each skill's `description` and the failures recorded in the README "Why this exists" section.

### Providers — baseline vs treatment

A custom Promptfoo `exec` provider (`providers/claude-code.ts`) wraps `claude -p --output-format
json` and captures the final assistant message. Two provider instances differ only by
`CLAUDE_CONFIG_DIR`:
- **baseline** → `fixtures/config-baseline/` (pack NOT installed)
- **treatment** → `fixtures/config-with-skills/` (pack installed; skill auto-triggers via its
  `description`)

This exercises the real skill-loading path, not a simulated system-prompt injection.

### Assertions — hybrid

Per Promptfoo test:
- **Deterministic** — `contains` / `not-contains` / `regex` for `must_include` / `must_not_include`.
  Perfect for "no `framer-motion`", "has `popLayout`", "has `prefers-reduced-motion`".
- **`llm-rubric`** — the fuzzy quality ("is this actually smooth / premium / correct motion"),
  scored against `rubric`. Override the judge `provider:` to point at Claude (Promptfoo defaults to
  OpenAI).

### Pass condition — the delta, not the absolute

The regression that actually tests a skill is **treatment beats baseline**: it proves the skill
*adds* value rather than "Claude was already good." Two gates:
1. **Absolute:** treatment must pass all `must_include`, zero `must_not_include`.
2. **Delta:** treatment's aggregate score must exceed baseline's by a threshold.

Promptfoo scores each provider×test independently and shows a matrix; it has no first-class
"provider A must beat provider B" gate. `delta.ts` post-processes Promptfoo's JSON output to compute
the per-case and aggregate delta and fail CI if the threshold isn't met. This is the one piece of
glue Promptfoo doesn't give for free.

## Test cadence / CI

- **Static** — every push / PR. Fast, free, blocking.
- **Eval** — on changes under any `*/SKILL.md` or `motion-tokens.*`, plus nightly. Requires Claude
  Code CLI + auth in the runner; non-blocking on unrelated PRs.

## Future options (not in v1)

- **Langfuse** — observability/dataset/experiment platform for *longitudinal* tracking: score trends
  across skill versions, cost/latency, human annotation of judge disagreements. Adds a server + SDK
  instrumentation — deferred until we want a dashboard of score-over-time. It can later ingest the
  eval layer's outputs without changing the layers below it.
- **Single-source tokens** — generate the four token copies from one canonical source, degrading
  `tokens.test.ts` into a "did the generated artifacts get regenerated" check. A refactor beyond the
  testing scope; noted so the test is designed not to block it.

## Out of scope

- Type-checking or running the recipe snippets (deps intentionally not installed — syntax only).
- Testing the external tools the pack defers to (Motion AI Kit, GSAP skills, etc.).
