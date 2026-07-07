# Tests

Two layers (design: `docs/superpowers/specs/2026-07-01-skill-testing-architecture-design.md`).

## Static (`tests/static/`) — fast, free, every commit

`npm test` — runs Vitest:

- `tokens.test.ts` — the four token sources must agree (durations A/B/C, easings A/C/D, springs
  A/B/C/D, where A=`web-ux-motion/motion-tokens.css`, B=`app-ux-motion` inline `motion-tokens.ts`,
  C=`designer-handoff` table, D=`motion-principles`).
- `frontmatter.test.ts` — `name` matches folder, `description` present.
- `snippets.test.ts` — tsx/ts/css blocks in SKILL.md parse (syntax only).
- `cross-refs.test.ts` — cited skill names resolve.

## Eval (`tests/eval/`) — model in the loop, on demand

`npm run eval` — `run.js`:

1. Rebuilds `fixtures/config-with-skills/skills/` from the live skill folders (single source of
   truth; git-ignored).
2. Seeds each config dir with your `~/.claude/.credentials.json` so headless Claude Code is
   authenticated (git-ignored; deleted again when the run finishes).
3. Runs Promptfoo (`promptfooconfig.yaml`): each terse prompt in `corpus/*.yaml` runs through
   `providers/claude-code.cjs` twice — **baseline** (no skills) vs **treatment** (pack installed).
   Assertions are hybrid: deterministic `icontains`/`not-icontains` plus an `llm-rubric` judge.
4. Gates on the treatment-beats-baseline delta (`delta.js`, `EVAL_DELTA_THRESHOLD`, default 0.15).

Requires: a logged-in `claude` CLI (or `ANTHROPIC_API_KEY`). The judge is routed through the same
headless Claude Code path so no separate API key is needed by default.

Langfuse (longitudinal score tracking) is a documented future option, not part of this suite.
