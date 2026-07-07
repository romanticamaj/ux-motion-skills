# Test Strengthening Plan (phase 2)

> Follow-on to `2026-07-01-skill-testing-architecture.md`. The first suite is built and green
> (static) / running (eval). The eval revealed baseline Opus 4.8 already scores ~0.97, so the
> current corpus can't demonstrate skill value. This plan strengthens both layers.

**Decision (sequenced):** static wins first (cheap, certain), then rebuild the eval corpus to be
adversarial (the real fix), then defer pairwise+multisample until the corpus discriminates.

## Phase 1 — Static layer (do now; no model calls)

### Task 1: Inline cubic-bezier drift check
- Create `tests/static/inline-values.test.ts` (+ reuse `extractCodeBlocks`).
- Extract every `cubic-bezier(a,b,c,d)` and `[a, b, c, d]` easing array from all SKILL.md code
  blocks; assert each matches one of the four canonical easings (from `parseCssTokens` of
  `motion-tokens.css`). Closes the drift risk CLAUDE.md explicitly names.
- Currently the only inline value is `[0.22,1,0.36,1]` (= `--ease-out`), so this passes green.

### Task 2: House-style structure assertions
- Create `tests/static/house-style.test.ts`.
- `["web-ux-motion","app-ux-motion","interaction-patterns"]` each contain `## REQUIRED DEFAULTS`.
- `["web-ux-motion","app-ux-motion","interaction-patterns","designer-handoff"]` each contain
  `## Common mistakes`.
- `motion-tokens.css` contains a `prefers-reduced-motion` block that collapses `--dur-*`.

### Finding to resolve (not a test, a decision)
- web-ux-motion recipes hard-code `transition={{ duration: 0.22 }}` but canonical `--dur-base` is
  `0.24`. CLAUDE.md is self-contradictory here (uses 0.22 as its example yet says "must not drift").
  Options: (a) change recipes to `0.24`, (b) document `0.22` as an intentional faster list-item
  value. Until resolved, the drift gate covers **cubic-beziers only**, not inline durations.

## Phase 2 — Adversarial corpus rebuild (the real fix; needs eval runs)

### Task 3: Rewrite corpus with RED discipline
- For each skill, author terse prompts that push toward the WRONG default:
  - Prime a stale library ("I'm using framer-motion, add exit animations") → expect correction to `motion`.
  - Supply code with array-index keys / a JS route wrapper → expect the skill's fix.
  - Constrain length ("in one line: duration + easing?") → forces a specific value, not a lecture.
- **Gate on RED:** run each candidate against baseline; keep only prompts baseline reliably FAILS.

### Task 4: Token-value fidelity assertions
- Replace "mentions popLayout" style checks with checks for the EXACT canonical values
  (`0.16s/0.24s/0.32s`, the specific cubic-beziers, `300/30`, `200/26`). This is what a base model
  can't guess and the skills uniquely provide.

## Phase 2 outcome (2026-07-01)

Adversarial corpus flipped the eval to a real PASS: **baseline 0.683 vs treatment 0.950,
delta +0.267**. Driven by three genuine discriminators — bottom sheet (0.00→1.00,
`@gorhom/bottom-sheet`), like button (0.00→1.00, `useOptimistic`), loading feed
(0.33→1.00, skeleton + `aspect-ratio`). Findings:
- Baseline Opus 4.8 already knows several things (View Transitions API, Reanimated
  `LinearTransition`, and even the exact `cubic-bezier(0.22, 1, 0.36, 1)` / 240ms values), so
  token-fidelity prompts did **not** discriminate — the pack's value is concentrated in
  library/pattern defaults a no-skill agent gets weaker on.
- The framer-motion case sits at 0.50/0.50 because `not-icontains "framer-motion"` fires on the
  corrective "not framer-motion" phrasing (balanced across providers). Refine later to match an
  `import ... "framer-motion"` line instead of the bare word.

## Phase 3 — Rigor (deferred until Phase 2 discriminates)

- Pairwise judging (`select-best`) instead of independent rubric scoring (sensitive near the ceiling).
- Run each case k=3–5 times; average and report variance (a −0.03 delta at n=1 is noise).
- Optionally add a weaker baseline model (skills should lift it more).
