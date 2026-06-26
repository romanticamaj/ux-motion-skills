---
name: interaction-patterns
description: Use when an action feels laggy (waits on the server), when loading shows a spinner then content pops in and the layout jumps, when empty/"no results" screens are blank, or generally when making perceived performance and state-change UX feel instant and polished in a web/app product. Covers optimistic UI, skeleton loading, and empty/error states.
---

# Interaction Patterns

## Overview

Reusable UX patterns for the *gaps in time* every app has — between an action and the server, a
navigation and its data, a query and its (absent) result. Polish is entirely about what fills
those gaps.

**Core principle:** the UI is always responsive. Never block input waiting on the network; show
the likely outcome now and reconcile later; reserve space so nothing jumps; make "empty" a moment
with a next action, not a dead end.

This is a pattern skill — first **recognize which gap you're in**, then apply the pattern. For the
underlying timing/easing values, read `motion-principles`; for the framework mechanics of the
motion itself, see `web-ux-motion` / `app-ux-motion` (**REQUIRED BACKGROUND**).

## Recognize the gap → pattern

| The gap | Cheap (avoid) | Polished (do this) |
|---------|---------------|--------------------|
| Action → server confirms | disabled button + spinner | **Optimistic UI** + tactile feedback + rollback-on-fail |
| Navigation → data arrives | centered spinner, then pop-in + jump | **Layout-accurate skeleton** that swaps in place |
| Query → no data | blank + gray text | **Designed empty state** keyed to *why* it's empty |

## REQUIRED DEFAULTS (apply even on terse requests)

| # | Default | Not this |
|---|---------|----------|
| 1 | Optimistic update responds **the same frame** + has a **rollback path** with a visible error | await server, then update (laggy); silent revert |
| 2 | Prefer **`useOptimistic`** (auto-reverts) or TanStack **`onMutate`** snapshot rollback | hand-rolled multi-setState rollback bookkeeping |
| 3 | Skeleton **mirrors the real layout's box model** (sizes, `aspect-ratio`) so nothing reflows | centered spinner; skeleton that doesn't match dimensions |
| 4 | **Guard the spinner/skeleton flash** — show only if load > ~180ms, then hold a ~300–500ms minimum | toggle skeleton instantly (strobes on fast loads) |
| 5 | Keep loaded content on screen during refetch (**`keepPreviousData`**) | blank out + re-skeleton on every filter/page change |
| 6 | Empty states are **differentiated by kind** (first-run / no-results / error / all-caught-up) | one generic blank; an **error dressed as a friendly empty** |
| 7 | **reduced-motion** branch on shimmer + feedback animations | infinite shimmer with no calm fallback |

If tempted to skip the flash-guard, `keepPreviousData`, the error-vs-empty distinction, or
reduced-motion "because it's a quick fix" — don't. Those are the exact terse-request degradations.

## Pattern 1 — Optimistic UI

Update as if the server already said yes; reconcile (or roll back) when it answers. Prefer the
auto-reverting primitive so there's no manual bookkeeping:

```jsx
import { useOptimistic, useState, startTransition } from "react";

function LikeButton({ post }) {
  const [likes, setLikes] = useState({ count: post.likeCount, liked: post.likedByMe });
  const [optimistic, addOptimistic] = useOptimistic(likes, (s, nextLiked) => ({
    liked: nextLiked,
    count: s.count + (nextLiked ? 1 : -1),
  }));

  function toggle() {
    const nextLiked = !optimistic.liked;
    startTransition(async () => {
      addOptimistic(nextLiked);                 // UI moves THIS frame
      try {
        const updated = await api.toggleLike(post.id, nextLiked);
        setLikes({ count: updated.likeCount, liked: updated.likedByMe });
      } catch {
        toast.error("Couldn't save your like.");  // optimistic value auto-reverts
      }
    });
  }
  return (
    <button onClick={toggle} aria-pressed={optimistic.liked} className={optimistic.liked ? "liked" : ""}>
      <Heart filled={optimistic.liked} /> {optimistic.count}
    </button>
  );
}
```

For cache-shared data (comments, counts shown in multiple places), use TanStack Query
`onMutate` → snapshot → `onError` rollback → `onSettled` invalidate.

**Rules that make optimism feel right, not flaky:**
- **Clear the input immediately** on comment submit; insert the comment with a temp id at reduced
  opacity (pending), then replace with the server version. Waiting to clear feels stuck.
- **Coalesce rapid toggles** — spam-clicking like must not fire N requests; send the final state once.
- **Add tactile feedback** (a quick scale/heart-burst, ~120ms `--ease-out`) so the instant change reads as intentional.
- **Never optimistically fake the unpredictable:** server-generated IDs you need right away, payment
  confirmation, moderation outcomes. Optimism is for high-probability successes (like, comment, follow, edit).

## Pattern 2 — Skeleton loading (no spinner, no jump)

The "spinner then pop + jump" is two problems: no sense of what's coming, and layout shift (CLS).
Both fixed by rendering a skeleton with the **exact geometry** of the real content.

```jsx
function PostCardSkeleton() {
  return (
    <article className="post-card" aria-hidden="true">   {/* same container as the real card */}
      <div className="post-card__header">
        <div className="skeleton skeleton--avatar" />
        <div className="skeleton skeleton--line" style={{ width: "40%" }} />
      </div>
      <div className="skeleton skeleton--line" style={{ width: "90%" }} />
      <div className="skeleton skeleton--media" />        {/* aspect-ratio reserves space */}
    </article>
  );
}
```

```css
.skeleton {
  background: linear-gradient(90deg, var(--skeleton-base) 25%, var(--skeleton-hi) 37%, var(--skeleton-base) 63%);
  background-size: 400% 100%; border-radius: 6px;
  animation: shimmer 1.4s ease infinite;
}
.skeleton--avatar { width: 40px; height: 40px; border-radius: 50%; flex: none; }
.skeleton--line  { height: 14px; }
.skeleton--media { aspect-ratio: 16/9; width: 100%; border-radius: 8px; }
@keyframes shimmer { to { background-position: -400% 0; } }

@media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }   /* required */
```

Anti-flicker details that separate polished from amateur:
- **Flash-guard:** only show the skeleton if loading exceeds ~180ms; once shown, hold ~300–500ms
  minimum. A skeleton that appears and vanishes in 80ms is its own jarring strobe.
- **Reserve image space** with `aspect-ratio` or `width`/`height` — the #1 CLS culprit.
- **Match count + grid:** render the number of skeleton cards you usually show, in the same layout.
- **Crossfade the swap** (~150ms opacity on the real content) instead of a hard cut.
- **Refetch:** keep current data visible (`placeholderData: keepPreviousData`) — don't blank out and
  re-skeleton on every filter/pagination change.
- Stable wrapper: swap children inside it; don't unmount/remount the container.

## Pattern 3 — Empty & error states (keyed to *why*)

A blank screen reads like a bug. Every empty state = visual + headline + one line of context +
one primary action. Critically, **differentiate the kinds** — they need different tone and action:

| Kind | Tone / copy | Action |
|------|-------------|--------|
| First-run (never had data) | inviting, onboarding — "No posts yet. Share your first." | **Create** (this is the activation moment) |
| No search/filter results | echo the query — "No results for 'foo'." | **Clear filters** |
| Error (load failed) | honest — "Couldn't load comments." | **Retry** |
| All caught up (cleared) | can be celebratory — "You're all caught up." | usually none |

```jsx
function EmptyState({ icon, title, description, action, role = "status" }) {
  return (
    <div className="empty-state" role={role}>   {/* role="alert" for errors */}
      <div className="empty-state__icon">{icon}</div>
      <h2 className="empty-state__title">{title}</h2>
      <p className="empty-state__desc">{description}</p>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
```

**Never dress an error as a friendly empty state** — "Nothing here yet 🎉" when the request
actually failed hides a real problem and removes the retry path. Render the empty inside the same
content container as the list so the surrounding layout doesn't shift.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Awaiting the server before updating UI | Optimistic update this frame + rollback |
| Manual multi-setState rollback | `useOptimistic` (auto-revert) or TanStack `onMutate` snapshot |
| Not clearing comment input until server responds | Clear immediately; show pending at reduced opacity |
| Spam-click fires N requests | Coalesce to the final desired state |
| Optimistically faking IDs / payments / moderation | Only optimize high-probability successes |
| Centered spinner | Layout-accurate skeleton |
| Skeleton toggles instantly | Flash-guard: >180ms to show, ~400ms minimum |
| Page blanks on filter/pagination | `keepPreviousData` |
| Images without reserved space | `aspect-ratio` / width+height |
| Infinite shimmer, no reduced-motion | `@media (prefers-reduced-motion)` → no animation |
| One generic empty state | Differentiate first-run / no-results / error / caught-up |
| Error shown as friendly empty | Honest copy + Retry; `role="alert"` |
