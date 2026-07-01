# Headless Claude Code provider

`claude-code.cjs` is a [Promptfoo custom provider](https://promptfoo.dev/docs/providers/custom-api/)
that runs a prompt through headless Claude Code (`claude -p --output-format json`) against a
specific `CLAUDE_CONFIG_DIR`.

## The baseline-vs-treatment toggle

The eval compares two config dirs that differ **only** by whether the skill pack is installed:

- `fixtures/config-baseline/` — no skills → how a no-skill agent answers.
- `fixtures/config-with-skills/skills/` — the five skill folders → the pack auto-triggers from
  each skill's `description`. This dir is regenerated from the live skill folders by `run.js`
  (git-ignored, so it never drifts or duplicates content in version control).

## Auth

An isolated `CLAUDE_CONFIG_DIR` is **not** logged in by default. `run.js` seeds each config dir
with a copy of your real `~/.claude/.credentials.json` at eval time (git-ignored, never committed).
Alternatively set `CLAUDE_BIN` / `ANTHROPIC_API_KEY` in the environment.

## Safety

The prompt is passed on **stdin**, never on the command line, and the executable is invoked with
`execFileSync` + an argument array (no shell) — so no prompt content is ever interpolated into a
command string.
