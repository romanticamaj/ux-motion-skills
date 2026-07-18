# Awesome Claude Skills — a curated collection

A personal, opinionated shelf of **Claude Code / Agent Skills worth stealing** — the ones that are
actually differentiated, not the ones a strong base model already does on its own.

Maintained semi-automatically: the [`skill-scout`](./skill-scout/SKILL.md) skill in this repo does
the legwork — it web-researches new skills, checks them against a quality bar, dedupes against this
list, and appends the survivors. Run it whenever you want to top up the shelf.

## The bar for getting listed

A skill earns a row only if it clears at least one of these — otherwise it's just knowledge the
model already has:

- **Official / library-author** — shipped by the people who own the underlying tool (highest trust).
- **Proprietary or live** — pulls in current docs, private systems, or data the model can't have baked in.
- **Enforcement, not knowledge** — encodes *your* specific constraints/tokens and gates on them, rather than reciting best practices.
- **Genuinely non-obvious depth** — gotchas, edge cases, or taste a base model reliably gets wrong.

> Skills whose only value is "remind the model of best practices it mostly knows" are on a
> depreciating curve as models improve. This list tries to avoid them.

## Motion & animation (web)

| Skill | What it's for | Source |
|-------|---------------|--------|
| Motion.dev animations | 120fps Motion.dev — spring physics, scroll effects, gesture interactions | [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) |
| animate-skill | Next.js/React animations built on Emil Kowalski's course rules | [delphi-ai/animate-skill](https://github.com/delphi-ai/animate-skill) |
| claudedesignskills | 3D/WebGL/GSAP/R3F/Motion/Lottie collection for richer web visuals | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) |
| css-animation-skill | Self-contained HTML/CSS animations for walkthroughs, demos, onboarding | [neonwatty/css-animation-skill](https://github.com/neonwatty/css-animation-skill) |

## Mobile / React Native

| Skill | What it's for | Source |
|-------|---------------|--------|
| Software Mansion skills | **Official**, from the authors of Reanimated & Gesture Handler — RN animation, gestures, layout transitions | [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) |

## Frontend design / anti-slop

| Skill | What it's for | Source |
|-------|---------------|--------|
| Frontend Design | **Official (Anthropic)** — forces deliberate aesthetic choices, bans overused fonts (Inter/Roboto/…) | [anthropics/skills](https://github.com/anthropics/skills) · [blog](https://claude.com/blog/improving-frontend-design-through-skills) |

## Design tokens & handoff

_(seed row — expand with `skill-scout`)_

| Skill | What it's for | Source |
|-------|---------------|--------|
| Design token skills | Generate a global/alias/component token taxonomy before building components | see leads below |

## Collections & directories (worth mining)

- [Best Claude Code Skills to Try in 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-claude-code-skills)
- [42 Claude Design Skills That Kill AI Slop — Novitckii](https://novitckii.com/resources/claude-design-skills/)

## Leads to triage

Names seen in the wild but not yet verified/linked — the scout's queue:

- **Frontend UI Animator** — React motion auditing & staggered/scroll reveals
- **Web Design Guidelines** — audits UI code against 100+ a11y/perf/UX rules
- **Design Token Architect** — token taxonomy skill
- **Claude Design** (handoff) — reads your codebase's tokens/Radix/Tailwind and emits a build spec

## How this repo is maintained

This is a curation repo — **no application code**. Adding entries is a research task, so it's driven
by a skill rather than by hand. See [`skill-scout/SKILL.md`](./skill-scout/SKILL.md).

<sub>History note: this repo previously held a pack of UX-motion skills. That content proved largely
redundant — the base model already knows it and stronger tools (e.g. Software Mansion's official RN
skills) own the differentiated lanes — so it was retired in favor of this curated shelf. The old
pack lives in git history.</sub>
