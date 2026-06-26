---
name: motion-principles
description: Use when choosing timing, duration, easing, or spring values for any UI animation, or deciding whether a state change should animate at all (web or app). Reference for the values and judgment behind product motion — pairs with implementation skills like web-ux-motion and app-ux-motion.
---

# Motion Principles

## Overview

The values and judgment behind product UX motion, independent of framework. Implementation skills
(`web-ux-motion`, `app-ux-motion`) tell you *how*; this tells you *what values* and *whether to
animate at all*.

**Core principle:** motion exists to explain a change — where something came from, where it went,
what is now different. Motion that does not aid understanding is decoration, and decoration on a
tool slows people down. When unsure, don't animate.

> **Related, more mature alternative:** Vercel's `web-animation-design` skill
> (github.com/vercel-labs/open-agents) covers the same web principles in depth and is well-tested.
> If it's available in your environment, prefer it for pure web work; this skill exists mainly so
> the app/handoff/pattern skills in this pack have a shared, self-contained foundation to cite.

## When NOT to animate (check first)

- The change must feel **instant** (typing feedback, value updates the user is watching closely).
- Animating would **gate input** — the user can't act until motion finishes. Never block interaction.
- High-frequency / bulk changes (a table refreshing 50 rows) — animating all of them is noise.
- The user set **`prefers-reduced-motion: reduce`** — collapse to instant or a small opacity fade.

If none of these apply and the change moves, appears, or dismisses something, animate it — with
the values below.

## Duration

Most UI motion lives in the **150–350ms** band.

| Class | Duration | Examples |
|-------|----------|----------|
| Micro | 100–150ms | toggle, checkbox, button press feedback |
| Standard | 180–260ms | list item enter, dropdown, tooltip, cross-fade |
| Emphasized | 280–360ms | hero / shared-element morph, full-screen sheet |

Rules of thumb:
- Under ~150ms reads as a **snap** (no continuity); over ~350ms feels **sluggish** for routine UI.
- **Exits should be faster than entrances** (~30%). The user already decided; don't make them wait.
- Larger travel / larger element → slightly longer. Smaller → shorter.

## Easing (direction carries meaning)

| Motion | Easing | cubic-bezier |
|--------|--------|--------------|
| Enter (decelerate into place) | ease-out | `0.22, 1, 0.36, 1` |
| Exit (accelerate away) | ease-in | `0.4, 0, 1, 1` |
| Move-through / cross-fade | standard (ease-in-out) | `0.4, 0, 0.2, 1` |
| Hero / shared-element | emphasized ease-out | `0.16, 1, 0.3, 1` |

- **Never `linear`** except continuous/looping motion (spinners, marquees).
- Enter = ease-out, exit = ease-in, passing-through = ease-in-out. Internalize these three.

## Springs vs duration-based

Use **springs** when motion is driven by direct manipulation (drag, swipe, fling) or wants a
physical, alive feel — the velocity carries through naturally. Use **duration+easing** for
discrete, predictable transitions (a dropdown opening) where you want exact, repeatable timing.

Keep **bounce low for utilitarian UI** — overshoot is playful but distracting in productivity
tools. Reasonable starting points (Motion / Reanimated style `stiffness`/`damping`):
- Snappy (buttons, toggles): `stiffness 300, damping 30`
- Gentle (cards, sheets): `stiffness 200, damping 26`
Raise `damping` to kill bounce; lower `stiffness` to slow it down.

## Reduced motion (non-negotiable)

`prefers-reduced-motion: reduce` is a medical accessibility setting (vestibular disorders →
motion sickness from slides/zoom/parallax). Always provide a branch:
- Replace slides/scales/morphs with an **instant change or a ≤100ms opacity fade**.
- Opacity-only fades are generally safe; movement and scaling are not.
- This is a hard requirement for any product that claims to be "professional," not a nicety.

## Performance (so it's smooth on real devices)

- Animate **only `transform` and `opacity`** — GPU-compositable, no layout/paint per frame.
  Animating `width`/`height`/`top`/`left`/`margin`/`box-shadow` causes layout thrash and dropped
  frames (the `height:auto` list collapse is a deliberate, contained exception).
- `will-change: transform` only on actively-animating elements; remove it after. Permanent
  `will-change` wastes GPU memory.
- **Test on throttled hardware** (Chrome DevTools 4× CPU throttle, or a mid-tier phone). Jank
  hides on a fast dev machine and only appears for real users.

## The one-line summary

150–350ms, enter ease-out / exit ease-in (faster), transform+opacity only, honor reduced-motion,
and if the motion doesn't explain a change — cut it.
