# ux-motion-skills

Skills that help **developers ship smooth, professional UX motion** in web and app products —
and help **designers** by turning motion intent into specs an agent can implement directly.

This is the practical-UX counterpart to [`iart-ai/motion-skills`](https://github.com/iart-ai/motion-skills),
which is excellent but aimed at **motion-graphics / video content** (TikTok, explainers, data
videos). The gap it leaves — and what this pack fills — is **product UX motion**: list enter/exit,
reorder, page/route transitions, micro-interactions, gesture-driven motion.

## Why this exists (the design finding)

A capable agent already *knows* the libraries. Baseline testing showed the failure isn't
knowledge — it's that on **terse requests** ("make the list smoother") answers quietly degrade:
stale package names (`framer-motion` vs `motion`), missing `popLayout`, JS route wrappers instead
of the native View Transitions API, reduced-motion treated as optional, and ad-hoc inline values
instead of a shared motion-token system. These skills encode the **non-negotiable defaults and
house style** so even a one-line request produces the top-tier result, consistently.

## Skills

| Skill | What it's for | Status |
|-------|---------------|--------|
| `motion-principles/` | Timing, easing, spring values + when NOT to animate (web+app, framework-agnostic foundation) | ✅ v1 |
| `web-ux-motion/` | React/web recipes: list enter/exit/reorder (`motion`), page transitions (View Transitions API), motion tokens | ✅ v1 |
| `app-ux-motion/` | RN Reanimated + Gesture / bottom-sheet / shared-element, plus SwiftUI / Compose notes | ✅ v1 |
| `designer-handoff/` | Bridge design→dev: vague intent → motion spec in the *shared* token vocabulary | ✅ v1 |
| `interaction-patterns/` | Optimistic UI, skeleton loading (no spinner/no CLS), differentiated empty/error states | ✅ v1 |

## For designers

The `designer-handoff` skill is the deliberate designer-facing piece: it turns a motion spec into
the *same* token vocabulary developers implement against (`--dur-*`, `--ease-*`, `spring.*`), so
"this should feel snappy" becomes a concrete, reviewable value instead of a verbal note. Its
baseline failure is specific and real — a capable agent already produces a good handoff doc, but
invents its *own* token names/values that don't match what the dev skills ship, so the boundary
stays inconsistent. The skill binds both sides to one table. The deliver-and-verify loop (render
the real result, look at it, iterate) shortens the design↔dev round-trip.

## Related & superior skills (use these where they're stronger)

This pack does **not** try to out-do the established players on their home turf — it defers to
them and focuses on the gaps they leave (mobile, interaction patterns, designer handoff, a unified
token system). A 2026-06 survey of the landscape:

| Project | Stronger than us at | Use it for |
|---------|---------------------|------------|
| [Motion AI Kit](https://motion.dev/docs/ai-kit) (official, **paid** Motion+) | Runtime perf profiling (MotionScore), live transition editor, latest-docs + 400+ examples | Anything web-Motion-heavy where you want measured perf and current APIs — beyond what `web-ux-motion` covers |
| [vercel-labs/open-agents · web-animation-design](https://github.com/vercel-labs/open-agents/blob/main/.agents/skills/web-animation-design/SKILL.md) | Mature, well-tested web animation *principles* | A drop-in alternative/complement to our `motion-principles` |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) (official) | Correct GSAP usage — timelines, ScrollTrigger, plugins | Scroll-driven / timeline-heavy web animation |
| [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) | 3D / WebGL / Framer Motion collection | 3D and richer web visual work |
| [iart-ai/motion-skills](https://github.com/iart-ai/motion-skills) | Motion-graphics **video** content (TikTok, explainers, data videos) | Producing video/animated content, not product UX |

**Where this pack is the differentiated/uncontested choice:** `app-ux-motion` (mobile/RN/SwiftUI/
Compose — the big web kits explicitly skip mobile), `interaction-patterns` (optimistic UI, skeleton
loading, empty/error states — uncovered elsewhere), `designer-handoff` (nobody else does it), and
the **single token vocabulary spanning web + app + designer** (Motion AI Kit explicitly does not do
token systems). `motion-principles` and the web-Motion half of `web-ux-motion` overlap the projects
above — those skills now point you to them rather than re-deriving the content.

## Install / use

These are plain Agent Skills (`SKILL.md` per folder). Drop a skill folder into your runtime's
skills directory (e.g. `~/.claude/skills/`), or install the pack via your skill manager. Each
skill auto-triggers on matching requests via its `description`.

### As a Claude Code plugin

```
/plugin marketplace add romanticamaj/ux-motion-skills
```

### Manually

Copy any skill folder (e.g. `app-ux-motion/`) into `~/.claude/skills/` (or your runtime's skills
directory). Each `SKILL.md` auto-triggers on matching requests via its `description`.

## Methodology note

Built with the TDD-for-skills approach (`superpowers:writing-skills`): RED = capture how a
no-skill agent answers a real task and document the gaps; GREEN = write defaults/recipes that
close exactly those gaps; REFACTOR = re-test until a terse request still hits the bar. The RED
findings are recorded in the "Why this exists" section above.
