# Awesome Motion & Design Skills

The **deep, opinionated index of Claude Code / Agent Skills for motion, animation, and UI design** —
one vertical, done thoroughly. Broad "AI-for-UI" lists (e.g. [maxbogo/awesome-ai-tools-for-ui](https://github.com/maxbogo/awesome-ai-tools-for-ui))
carry a shallow design subsection (~8 skills) across many categories; this repo does *only* motion &
design, so it goes deeper — full sub-taxonomy, honest annotations, and a differentiation note per row.

Maintained semi-automatically by [`skill-scout`](./skill-scout/SKILL.md): it web-researches motion/
design skills, dedupes against this list, and appends survivors. Run it to top up.

## How to read the annotations

Motion/design knowledge alone is cheap — a strong base model already writes decent animations. So
each row is tagged honestly:

- 🏛 **official** — shipped by whoever owns the tool (Motion.dev, GSAP, Software Mansion, Anthropic). Highest trust.
- 🎯 **differentiated** — depth, gotchas, live data, or enforcement the base model doesn't reliably have.
- ⚖️ **borderline** — useful, but overlaps what a capable model already does; taste-dependent.

## Web animation — Motion / Framer / GSAP / scroll

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| GSAP Skills | 🏛 | Official GSAP — core API, timelines, ScrollTrigger, plugins, framework bindings | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) |
| Motion.dev animations | 🎯 | 120fps Motion.dev — spring physics, scroll effects, gesture interactions | [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) |
| animate-skill | 🎯 | Next.js/React animations built on Emil Kowalski's course rules | [delphi-ai/animate-skill](https://github.com/delphi-ai/animate-skill) |
| agentic-awesome-skills (scroll-experience) | 🎯 | Scroll-driven "experience" pages — pinning, scrub, staged reveals | [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) |
| css-animation-skill | ⚖️ | Self-contained HTML/CSS animations for walkthroughs, demos, onboarding | [neonwatty/css-animation-skill](https://github.com/neonwatty/css-animation-skill) |
| Transitions.dev | ⚖️ | Copy-paste transition patterns for common web-app interactions | [transitions.dev](https://transitions.dev/) |

## Mobile / React Native motion

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| Software Mansion skills | 🏛 | Official — from the authors of Reanimated & Gesture Handler; RN animation, gestures, layout transitions | [software-mansion-labs/skills](https://github.com/software-mansion-labs/skills) |

## 3D / WebGL / generative visuals

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| claudedesignskills | 🎯 | Three.js / R3F / GSAP-ScrollTrigger / Babylon / Motion / Lottie collection | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) |
| Paper Shaders | 🎯 | Zero-dependency canvas shaders — animated backgrounds, textures, masked effects | [paper-design/shaders](https://github.com/paper-design/shaders) |

## Design judgment / anti-slop

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| Frontend Design | 🏛 | Official (Anthropic) — forces deliberate aesthetic choices, bans overused fonts | [anthropics/skills](https://github.com/anthropics/skills) · [blog](https://claude.com/blog/improving-frontend-design-through-skills) |
| Taste Skill | 🎯 | Open-source SKILL.md that stops agents producing cookie-cutter frontends | [tasteskill.dev](https://www.tasteskill.dev/) |
| Make Interfaces Feel Better | 🎯 | Small design-engineering details that compound into better interfaces | [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) |
| StyleSeed | ⚖️ | Slash-command skills for design judgment — coherence, hierarchy, UX-writing | [bitjaru/styleseed](https://github.com/bitjaru/styleseed) |
| Impeccable | ⚖️ | 20 design commands — typography, spacing, visual hierarchy | [impeccable.style](https://impeccable.style/) |
| ui-ux-pro-max-skill | ⚖️ | Opinionated UI styling / UX rules bundle | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |

## Design systems & component libraries

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| Material Design 3 | 🎯 | MD3 tokens, theming, 30+ components, responsive layout, MD3 audits | [hamen/material-3-skill](https://github.com/hamen/material-3-skill) |
| Shadcnblocks | 🎯 | Expert knowledge of 2,500+ shadcn/ui blocks — select, install, compose sections | [masonjames/shadcnblocks-skill](https://github.com/masonjames/shadcnblocks-skill) |
| shadcn-claude-skill | 🎯 | Accessible Next.js UIs with shadcn/ui + Radix primitives | [capraidev/shadcn-claude-skill](https://github.com/capraidev/shadcn-claude-skill) |
| Tailwind v4 + shadcn | 🎯 | Production-tested Tailwind v4 + shadcn/ui setup, dark mode, CSS-var debugging | [secondsky/claude-skills](https://github.com/secondsky/claude-skills) |
| Swiss Design System | ⚖️ | Swiss principles — grotesque type, disciplined grids, restrained color, Tailwind | [swiss.ziki.boo](https://swiss.ziki.boo/) |
| Nothing Design Skill | ⚖️ | Nothing-inspired monochrome, typographic, industrial UI | [dominikmartn/nothing-design-skill](https://github.com/dominikmartn/nothing-design-skill) |

## Prototyping / design reviews

| Skill | Tag | What it's for | Source |
|-------|-----|---------------|--------|
| Huashu Design | 🎯 | HTML-native skill — prototypes, slides, animations, design reviews | [alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design) |

## Design tokens & handoff

_(scout's queue — verify canonical sources before listing)_

- **Design Token Architect** — global/alias/component token taxonomy
- **Claude Design** (handoff) — reads your codebase's tokens/Radix/Tailwind and emits a build spec

## Meta collections (worth mining for the scout)

- [wilwaldon/Claude-Code-Frontend-Design-Toolkit](https://github.com/wilwaldon/Claude-Code-Frontend-Design-Toolkit) — skills, plugins, MCP, CLAUDE.md tricks for better frontends
- [maxbogo/awesome-ai-tools-for-ui](https://github.com/maxbogo/awesome-ai-tools-for-ui) — broad AI-for-UI list (design subsection)
- [42 Claude Design Skills That Kill AI Slop — Novitckii](https://novitckii.com/resources/claude-design-skills/)
- [Best Claude Code Skills 2026 — Firecrawl](https://www.firecrawl.dev/blog/best-claude-code-skills)

## How this repo is maintained

A curation repo scoped to **motion & design skills only** — no application code. Adding entries is a
research task, so it's driven by [`skill-scout`](./skill-scout/SKILL.md), which verifies real
sources and dedupes before appending.

<sub>History note: this repo previously shipped its own UX-motion skill pack. That proved redundant
(the base model already covers it; stronger tools own the lanes), so it became this curated index.
The old pack lives in git history.</sub>
