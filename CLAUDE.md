# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A **curated index of Claude Code / Agent Skills for motion, animation, and UI design** — one
deliberate vertical, kept in `README.md`. There is **no application code**, build, test, or run
step. The deliverable is the curated list and the one skill that maintains it.

Scope is intentionally **motion & design only**. The differentiation vs a broad "AI-for-UI" list
(which carries a shallow design subsection) is *depth within the niche* + auto-maintenance — not
breadth. Keep out-of-lane skills (testing, MCP, data, etc.) off the list.

## Structure

- `README.md` — the curated list itself: categorized tables (`| Skill | What it's for | Source |`),
  a "Leads to triage" queue, and the quality bar for inclusion.
- `skill-scout/SKILL.md` — the only skill here. It researches new skills (web search + fetch),
  filters against the quality bar, dedupes against the README, and appends survivors. Distributed
  via `.claude-plugin/marketplace.json`.

## The one invariant: the quality bar

The list's value is **differentiation, not coverage**. A skill earns a row only if it clears at
least one bar (see README + `skill-scout/SKILL.md` — keep the two copies in sync):

1. Official / library-author, 2. Proprietary or live data, 3. Enforcement (encodes + gates on
specific constraints), 4. Genuinely non-obvious depth.

Skills whose only value is reciting best practices the base model already follows do **not** belong
— they're on a depreciating curve as models improve. When editing the list or the scout, protect
this bar; padding the list with redundant entries is the failure mode to avoid.

## When editing

- Adding entries is a **research task** — prefer running the `skill-scout` skill over hand-editing,
  so finds get verified (real source URLs, not aggregators or invented links) and judged against the bar.
- Keep annotations honest and specific ("official, from the library authors" / "overlaps the base
  model — borderline"). Trustworthy curation is the whole point.
- Match the existing README table format; move verified items out of "Leads to triage".

## History

This repo previously held a pack of UX-motion skills (five `SKILL.md` folders + a motion-token
system + a Vitest/Promptfoo test suite). That content was retired: the base model already covers it
and stronger tools own the differentiated lanes. It remains in git history if needed.
