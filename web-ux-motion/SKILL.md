---
name: web-ux-motion
description: Use when adding, removing, reordering, or transitioning UI in a React/web product and the motion should feel smooth and professional — including terse requests like "make this smoother", "the list jumps", or "page changes feel harsh". Covers list enter/exit, layout/reorder, and page/route transitions.
---

# Web UX Motion

## Overview

Production UX motion for web products. The job is not "add an animation" — it is to make a
state change *read as continuous* using one consistent motion language, while never slowing the
user down or hurting accessibility.

**Core principle:** motion clarifies what changed. If an animation does not help the user
understand a state change, cut it.

A capable agent already knows the libraries. The failures this skill prevents show up on *short*
requests, where answers quietly degrade to dated, inconsistent, or inaccessible defaults. The
REQUIRED DEFAULTS below are the bar for *every* request, terse or detailed.

**REQUIRED BACKGROUND for timing/easing/spring values and when NOT to animate:** read the
`motion-principles` skill. This skill gives recipes; that skill gives the values and the judgment.

> **For deeper web-Motion work, defer to the specialists:** the official
> [Motion AI Kit](https://motion.dev/docs/ai-kit) (paid) adds runtime perf profiling (MotionScore),
> a live transition editor, and always-current APIs + 400+ examples; [greensock/gsap-skills] covers
> timeline/ScrollTrigger work. This skill's edge is the **product-UX defaults** (the table below) and
> the **View Transitions API** route-transition recipe — use it for those; reach for the kits above
> when you need measured performance, GSAP, or the latest Motion APIs.

## REQUIRED DEFAULTS (apply on every request, even one-liners)

| # | Default | Not this |
|---|---------|----------|
| 1 | Library is **`motion`** — `npm i motion`, `import { ... } from "motion/react"` | ~~`framer-motion`~~ (old package name) |
| 2 | Page/route transitions use the native **View Transitions API** (`document.startViewTransition`, or the router's built-in opt-in) | JS-only `<AnimatePresence mode="wait">` route wrappers |
| 3 | List/component enter+exit+reorder use **`<AnimatePresence>` + `layout` + `mode="popLayout"`** | `<AnimatePresence>` without `popLayout` (gap-close lags behind the fade) |
| 4 | **`prefers-reduced-motion` is honored** with a real fallback, every time | "respect it if you want to be polite" / omitted |
| 5 | Durations/easings come from **shared motion tokens** (`motion-tokens.css`), reused everywhere | ad-hoc inline `duration: 0.2` scattered per component |
| 6 | **Enter = ease-out; exit = ease-in and faster** (the user already decided to dismiss) | one `easeOut` / one duration for both directions |
| 7 | Animate **only `transform` and `opacity`** (the `height:auto` collapse is the one allowed exception) | animating `top`/`width`/`margin`/`box-shadow` (layout thrash) |

If you are about to skip any row "because the request was quick" — don't. That is exactly the
case these defaults exist for.

## Recipe 1 — List add / remove / reorder

`npm i motion`

```tsx
import { AnimatePresence, motion } from "motion/react";

type Item = { id: string; label: string };

export function AnimatedList({ items }: { items: Item[] }) {
  return (
    <motion.ul layout className="list">
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item) => (
          <motion.li
            key={item.id}                  // STABLE id — never the array index
            layout
            initial={{ opacity: 0, height: 0, scale: 0.96 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} // = var(--ease-out)
            className="list-item"
          >
            {item.label}
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
```

```css
.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.list-item { overflow: hidden; padding: 12px 16px; border-radius: 10px; background: var(--surface); }
```

Why each piece matters:
- **`mode="popLayout"`** pops the exiting item out of flow immediately, so neighbors start
  sliding up *while* it fades instead of after. This is the single biggest "feels expensive" lever.
- **`layout` on `<ul>` and each `<li>`** → FLIP: neighbors glide to new positions on add/remove/reorder.
- **`height: "auto"` + `overflow: hidden`**, and put spacing in the parent's `gap` (not `<li>`
  vertical `margin`) — margins don't collapse cleanly mid-height-animation and cause a visible jump.
- **Stable `key`** — array index keys animate the wrong item out. The #1 list-animation bug.
- **Long/virtualized lists:** do NOT put `layout` on hundreds of nodes (it measures each every
  frame). Only animate items in/near the viewport, or disable layout animation past N items.

## Recipe 2 — Page / route transitions (native View Transitions API)

Manual navigation (progressive enhancement + reduced-motion guard built in):

```ts
export function navigateWithTransition(updateDOM: () => void) {
  if (
    !document.startViewTransition ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    updateDOM();
    return;
  }
  document.startViewTransition(() => updateDOM());
}
```

Router-native (preferred when available):
- **React Router v7:** `<Link to="/x" viewTransition>` — no wrapper code.
- **Next.js App Router:** enable `experimental.viewTransition` and the router wraps navigations.

Style the browser-generated pseudo-elements in **global CSS** (see `motion-tokens.css` for the
shared values):

```css
::view-transition-old(root) { animation: vt-fade-out var(--dur-fast) var(--ease-in) both; }
::view-transition-new(root) { animation: vt-slide-up var(--dur-base) var(--ease-out) both; }

@keyframes vt-fade-out { to { opacity: 0; } }
@keyframes vt-slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

**Shared-element ("hero") transition** — the premium touch. Give the same element on both
views a matching `view-transition-name`; the browser morphs it between routes:

```css
.product-thumb      { view-transition-name: product-hero; } /* list page */
.product-hero-image { view-transition-name: product-hero; } /* detail page */
```

Each `view-transition-name` must be **unique on screen per frame**. For a list, assign the name
only to the clicked item (or generate `product-${id}`), or you get a silent failure + console error.

Why View Transitions over a JS route wrapper: the browser snapshots old+new DOM and cross-fades/
morphs at the compositor level (near-zero layout cost), and you don't keep the old route mounted
during exit — so data fetching / Suspense stay simple. Start fetching immediately; let the
transition overlay it. Never `await` the animation before fetching.

## Reduced motion (non-negotiable)

Vestibular-disorder users get motion sickness from slides/zooms. Every motion path above already
has a reduced-motion branch. In components, gate with `motion`'s hook:

```tsx
import { useReducedMotion } from "motion/react";
const reduce = useReducedMotion();
// reduce ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
```

Fallback = instant state change or a tiny opacity fade. Never a slide/scale/morph.

## Motion tokens (consistency = the "expensive" feeling)

Top-tier products move with ONE rhythm, not per-component bespoke values. Define tokens once and
reuse in both CSS and JS. See `motion-tokens.css` in this folder — import it globally and reference
`var(--dur-*)` / `var(--ease-*)`; mirror the same cubic-bezier arrays in `motion` `transition`
props. When in doubt, copy a value from the token file rather than inventing a new one.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| `import from "framer-motion"` | It's `motion` / `"motion/react"` now |
| Array index as React `key` | Stable unique id |
| `<AnimatePresence>` without `popLayout` | Add `mode="popLayout"` so reflow tracks the fade |
| JS route wrapper for page transitions | Native View Transitions API / router opt-in |
| Same easing+duration for enter and exit | Enter ease-out; exit ease-in and ~30% faster |
| Animating `height`/`width`/`margin`/`top` | Animate `transform`/`opacity` (height:auto is the one exception) |
| `layout` on a long/virtualized list | Limit to viewport items; disable past N |
| Duplicate `view-transition-name` on screen | Unique per frame; name only the active element |
| reduced-motion treated as optional | Always branch; instant or opacity-only fallback |
| Testing only on a fast dev machine | Verify on 4× CPU throttle (DevTools) — jank hides on fast hardware |
