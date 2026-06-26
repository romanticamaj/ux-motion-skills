---
name: designer-handoff
description: Use when a designer is specifying motion for engineering, or when an agent is turning a vague motion request ("make it premium / snappy / smooth", a Figma comment, a reference video) into something a developer can implement exactly. Produces a motion spec in the shared token vocabulary so design intent and code match.
---

# Designer Handoff (motion)

## Overview

Turns motion *intent* into a motion *spec* engineering can implement without guessing. "Premium"
and "snappy" are feelings, not instructions — the developer (or their coding agent) has to guess
the four or five numbers behind the feeling, and guesses differently every time.

**Core principle:** hand off **named tokens and a filled-in template**, not adjectives. And the
tokens MUST be the *same* ones the implementation skills consume — otherwise design and code each
invent a parallel system and the boundary stays inconsistent.

**The failure this prevents:** left to itself, each side picks plausible-but-different values
(designer says `fast = 180ms / ease-out-quart`, dev ships `0.24s / cubic-bezier(0.22,1,0.36,1)`).
Both are "fine"; together they're inconsistent. Bind both sides to one table.

## The canonical tokens (use THESE values, not invented ones)

These match `web-ux-motion/motion-tokens.css`, `app-ux-motion/motion-tokens.ts`, and
`motion-principles`. Do not rename or re-number them — that is the whole point.

**Durations** (most UI motion is 150–350ms)

| Token | Value | Use for |
|-------|-------|---------|
| `--dur-fast` | 160ms | exits, dismissals, small toggles |
| `--dur-base` | 240ms | enters, list items, modals, page transitions |
| `--dur-slow` | 320ms | hero / shared-element morph, full-screen takeover |

**Easing** (direction carries meaning)

| Token | cubic-bezier | Feel / when |
|-------|--------------|-------------|
| `--ease-out` | `0.22, 1, 0.36, 1` | **entrances** — fast start, soft landing (the "premium" workhorse) |
| `--ease-in` | `0.4, 0, 1, 1` | **exits** — accelerate away |
| `--ease-standard` | `0.4, 0, 0.2, 1` | move-through / cross-fade |
| `--ease-emphasized` | `0.16, 1, 0.3, 1` | hero / shared-element morph |

**Springs** (for gesture-driven / mobile; low bounce for utilitarian UI)

| Token | damping / stiffness | Use for |
|-------|---------------------|---------|
| `spring.snappy` | 30 / 300 | buttons, toggles, list reflow |
| `spring.gentle` | 26 / 200 | cards, sheets, drawers |

Two rules that do most of the work: **never `linear` or the default `ease`**; **entrances
decelerate (`--ease-out`), exits accelerate (`--ease-in`) and are faster.**

## The handoff template (drop on any animation)

```
ANIMATION: [name]
Trigger:    [click / open / mount / drag]
Property:   [opacity, scale, translateY — list each; transform+opacity only]
From → To:  [0 → 1, 0.96 → 1, ...]
Duration:   [--dur-fast | --dur-base | --dur-slow]   (or spring.snappy/gentle)
Easing:     [--ease-out | --ease-in | --ease-standard | --ease-emphasized]
Stagger:    [if list: Xms between items, cap at N items]
Exit:       [usually --dur-fast + --ease-in]
Reduced-motion: [instant | opacity-only fade]   ← always specify
Reference:  [link to 3s screen recording or live example]
```

## Worked example — modal, "premium + snappy"

```
ANIMATION: Modal open/close
Backdrop in:  opacity 0 → 1        | --dur-base  | --ease-out
Panel in:     opacity 0 → 1,
              scale 0.96 → 1       | --dur-base  | --ease-out   (origin: center)
Panel out:    opacity 1 → 0,
              scale 1 → 0.98       | --dur-fast  | --ease-in
Backdrop out: opacity 1 → 0        | --dur-fast  | --ease-in
Reduced-motion: backdrop opacity only, no scale; --dur-fast
Reference:  [link]
```

Why it reads premium: scales *up* from 96% (not sliding from an edge), exit faster than entrance,
transform+opacity only. Snappy = fully present in ~quarter-second (`--dur-base`).

## Worked example — list, staggered entrance

```
ANIMATION: List item entrance
Each item:  opacity 0 → 1, translateY 8px → 0  | --dur-base | --ease-out
Stagger:    40ms between items, CAP after ~8 items (or ~300ms total)
Exit:       opacity → 0, height → 0            | --dur-fast | --ease-in
Reduced-motion: opacity only, no translate, no stagger
```

The **cap is mandatory** — without it a 50-item list takes 2s and feels broken. State it explicitly
or engineering will miss it.

## Hand off a reference, not a description

Highest-leverage move: give something to *match*, not interpret.
- **Best:** a 3-second screen recording of the real feel — a Figma Smart Animate prototype with
  easing set explicitly to the tokens above, or a capture of an app whose motion you love.
- **Good:** a live example by name ("Linear's command menu", "Stripe's dashboard list") — a coding
  agent can often reproduce known patterns.
- **Avoid:** Figma's default Smart Animate "ease" — it doesn't match these curves and will mislead
  everyone. Set the easing explicitly so the prototype *is* the spec.

## Tell engineering once (for consistency)

- "Put these tokens in code as variables and reference them everywhere — don't hand-tune per
  component." (This is what makes the app feel like one product.)
- "Animate only `transform` and `opacity`." Animating width/height/top/margin is what reads as
  cheap and janky regardless of easing.
- "Honor reduced-motion." One branch; instant or opacity-only.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Handing off adjectives ("premium", "snappy") | Filled-in template with token values |
| Inventing new token names/values | Use the canonical table — match the dev skills exactly |
| Figma default "ease" in the prototype | Set easing explicitly to the tokens |
| No stagger cap on long lists | Cap at ~8 items / ~300ms, stated explicitly |
| Forgetting the reduced-motion line | Always specify the fallback in the spec |
| Describing instead of referencing | Attach a 3s recording or a named live example |
