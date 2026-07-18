# Awesome Motion & Design Skills

The **deep, opinionated index of Claude Code / Agent Skills for motion, animation, and UI design** —
one vertical, done thoroughly. General "AI-for-UI" lists (e.g. [maxbogo/awesome-ai-tools-for-ui](https://github.com/maxbogo/awesome-ai-tools-for-ui))
carry a shallow design subsection across many categories; this repo does *only* motion & design, so
it can go deeper — full sub-taxonomy, honest annotations, and a differentiation verdict per entry.

Maintained semi-automatically by [`skill-scout`](./skill-scout/SKILL.md): it web-researches motion/
design skills, checks them against the bar, dedupes, and appends the survivors. Run it to top up.

## The bar for getting listed

Motion/design knowledge alone is cheap — a strong base model already writes decent animations. A
skill earns a row only if it clears at least one:

- **Official / library-author** — shipped by whoever owns the tool (Motion.dev, Software Mansion…). Highest trust.
- **Live / current** — pulls in up-to-date APIs, examples, or measured perf the model can't have baked in.
- **Enforcement, not knowledge** — encodes and *gates on* specific design tokens/constraints.
- **Non-obvious depth** — documented gotchas, edge cases, or taste a base model reliably gets wrong.

Each row is annotated honestly, including "overlaps the base model — borderline" where true.

## Web animation (Motion / Framer / GSAP / scroll)

| Skill | What it's for | Source |
|-------|---------------|--------|
| Motion.dev animations | 120fps Motion.dev — spring physics, scroll effects, gesture interactions | [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) |
| animate-skill | Next.js/React animations built on Emil Kowalski's course rules | [delphi-ai/animate-skill](https://github.com/delphi-ai/animate-skill) |
| css-animation-skill | Self-contained HTML/CSS animations for walkthroughs, demos, onboarding | [neonwatty/css-animation-skill](https://github.com/neonwatty/css-animation-skill) |

## Mobile / React Native motion

| Skill | What it's for | Source |
|-------|---------------|--------|
| Software Mansion skills | **Official**, from the authors of Reanimated & Gesture Handler — RN animation, gestures, layout transitions | [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) |

## 3D / WebGL / rich visuals

| Skill | What it's for | Source |
|-------|---------------|--------|
| claudedesignskills | 3D/WebGL/GSAP/R3F/Motion/Lottie collection for richer web visuals | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) |

## Frontend design / anti-slop

| Skill | What it's for | Source |
|-------|---------------|--------|
| Frontend Design | **Official (Anthropic)** — forces deliberate aesthetic choices, bans overused fonts (Inter/Roboto/…) | [anthropics/skills](https://github.com/anthropics/skills) · [blog](https://claude.com/blog/improving-frontend-design-through-skills) |

## Design systems, tokens & handoff

_(scout's queue — verify sources before listing)_

- **Design Token Architect** — global/alias/component token taxonomy
- **Claude Design** (handoff) — reads your codebase's tokens/Radix/Tailwind and emits a build spec

## Motion principles / taste

_(scout's queue)_

- **Frontend UI Animator** — React motion auditing, staggered/scroll reveals
- **Web Design Guidelines** — audits UI code against 100+ a11y/perf/UX rules

## Collections worth mining (for the scout)

- [42 Claude Design Skills That Kill AI Slop — Novitckii](https://novitckii.com/resources/claude-design-skills/)
- [Best Claude Code Skills 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-claude-code-skills)

## How this repo is maintained

A curation repo scoped to **motion & design skills only** — no application code. Adding entries is a
research task, so it's driven by [`skill-scout`](./skill-scout/SKILL.md) rather than by hand.

<sub>History note: this repo previously shipped its own UX-motion skill pack. That proved redundant
(the base model already covers it; stronger tools own the lanes), so it became a curated index
instead. The old pack lives in git history.</sub>
