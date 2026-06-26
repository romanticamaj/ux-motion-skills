---
name: app-ux-motion
description: Use when adding, removing, reordering, or transitioning UI in a React Native / Expo app (and analogous SwiftUI / Jetpack Compose work) and the motion should feel smooth and native — including terse requests like "make the app feel smoother", "the list jumps", "the sheet just snaps open", or "navigation feels flat". Covers list layout animation, screen/shared-element transitions, bottom sheets, and gesture-driven motion.
---

# App UX Motion

## Overview

Production UX motion for mobile apps. Native-feeling apps **interpolate every state change**
instead of snapping. The job is to make changes read as continuous using one consistent motion
language, gesture-driven where the user is dragging, without ever gating input or skipping
accessibility.

**Core principle:** motion clarifies what changed; gesture-driven motion should track the finger.
If an animation doesn't aid understanding, cut it.

Primary stack is **React Native + Expo (Reanimated 3 + Gesture Handler)**. SwiftUI / Compose
notes at the end. For timing/easing/spring values and when-not-to-animate, read the
`motion-principles` skill (**REQUIRED BACKGROUND**).

## REQUIRED DEFAULTS (apply on every request, even one-liners)

| # | Default | Not this |
|---|---------|----------|
| 1 | **`prefers-reduced-motion` is honored**, every time — `useReducedMotion()` from `react-native-reanimated` (or `AccessibilityInfo.isReduceMotionEnabled()`) | omitting it (the #1 baseline miss on mobile) |
| 2 | Spring values come from **shared spring tokens** (snappy / gentle), reused across list, sheet, nav | ad-hoc `damping`/`stiffness` invented per component |
| 3 | List/reorder uses Reanimated **layout animations** — `layout={LinearTransition.springify()}` + `entering`/`exiting` | manual measure + `Animated.timing` choreography |
| 4 | Navigation uses **native-stack** (`react-native-screens` / Expo Router default); hero uses `sharedTransitionTag` | JS stack (`animation:'none'`/flat) for primary nav |
| 5 | Sheets/drawers use **`@gorhom/bottom-sheet` v5** with spring `animationConfigs` from tokens | hand-rolled snap with a timing animation |
| 6 | **Enter decelerates; exit is faster** | one duration/curve for both directions |
| 7 | Gesture-driven motion is **spring/velocity-based** and tracks the finger; discrete transitions use timing | timing animations for draggable/swipeable surfaces |

If you're about to skip reduced-motion or the spring tokens "because the request was quick" —
don't. That is exactly the case these defaults exist for.

## Spring tokens (the consistency lever)

Define once, reuse everywhere — this is what makes the whole app feel like one product. Mirror
the `motion-principles` spring guidance (low bounce for utilitarian UI):

```ts
// motion-tokens.ts
export const spring = {
  snappy: { damping: 30, stiffness: 300, mass: 0.9 }, // buttons, toggles, list reflow
  gentle: { damping: 26, stiffness: 200, mass: 1 },   // cards, sheets, drawers
};
export const dur = { fast: 160, base: 240, slow: 320 }; // ms, for timing-based transitions
```

Raise `damping` to kill bounce; lower `stiffness` to slow it. Reuse `spring.snappy` /
`spring.gentle` in `LinearTransition.springify()`, sheet `animationConfigs`, and gesture springs.

## Recipe 1 — List add / remove / reorder

```tsx
import Animated, { LinearTransition, FadeIn, FadeOut, useReducedMotion } from "react-native-reanimated";
import { spring, dur } from "./motion-tokens";

function Row({ item }) {
  const reduce = useReducedMotion();
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(spring.snappy.damping).stiffness(spring.snappy.stiffness)}
      entering={reduce ? undefined : FadeIn.duration(dur.base)}
      exiting={reduce ? undefined : FadeOut.duration(dur.fast)}   // exit faster than enter
    >
      <RowContent item={item} />
    </Animated.View>
  );
}
```

- `entering`/`exiting` stop the hard pop on add/remove; `layout` stops the jump on surviving rows.
- Prefer **FlashList v2** (2026 default) — better recycling, plays well with Reanimated layout.
  Put the `Animated.View` wrapper inside `renderItem`.
- **reduced-motion** → drop `entering`/`exiting` (instant), as above.
- Long lists: layout animation measures nodes — keep it to on-screen rows; recycling handles the rest.

## Recipe 2 — Screen + shared-element transitions

- Use **native-stack** (Expo Router uses it by default) for real platform push transitions. "Flat"
  navigation almost always means a JS stack or `animation: 'none'`/`'fade'` set somewhere — check first.
- Richer default per stack:

```tsx
<Stack screenOptions={{ animation: "slide_from_right", animationDuration: dur.base }} />
```

- **Shared element ("hero")** — same `sharedTransitionTag` on both screens; the element morphs:

```tsx
// list screen
<Animated.Image sharedTransitionTag="cover" source={...} />
// detail screen
<Animated.Image sharedTransitionTag="cover" source={...} />
```

## Recipe 3 — Bottom sheet (spring, gesture-driven)

```tsx
import BottomSheet from "@gorhom/bottom-sheet";
import { spring } from "./motion-tokens";

<BottomSheet
  ref={ref}
  snapPoints={["25%", "60%"]}
  enableDynamicSizing
  animationConfigs={spring.gentle}   // the "feel" — settle, not snap
>
  <Content />
</BottomSheet>
```

Wrap the app root in `GestureHandlerRootView` or the sheet won't drag. The spring + Gesture
Handler give drag, velocity, and rubber-banding for free — never hand-roll this.

## Reduced motion (non-negotiable)

`useReducedMotion()` (Reanimated) reflects the OS "Reduce Motion" setting. When true: skip
`entering`/`exiting`, use instant or opacity-only changes, and avoid large slides/scales/morphs.
This is a hard requirement, not a nicety — vestibular users get motion sickness from app transitions.

## Performance

- Reanimated runs animations on the **UI thread** (worklets) — keep animated logic inside worklets;
  don't bounce per-frame values across the JS bridge.
- Animate `transform` / `opacity`. Verify the Reanimated Babel plugin is installed (Expo SDK 52+
  auto-configures it) or layout animations silently do nothing.
- Test on a real mid-tier device, not just the simulator.

## SwiftUI / Jetpack Compose (same principles, native tools)

- **SwiftUI:** `withAnimation(.spring(response:dampingFraction:))` for state changes;
  `matchedGeometryEffect` for shared-element; `.transition(.opacity/.scale)` for insert/remove;
  honor `@Environment(\.accessibilityReduceMotion)`.
- **Compose:** `animate*AsState` / `updateTransition` with `spring()`; `AnimatedVisibility` for
  enter/exit; `SharedTransitionLayout` for hero; check `LocalAccessibilityManager` reduce-motion.
- Same defaults: shared spring tokens, enter-decelerate/exit-faster, reduced-motion branch.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| reduced-motion omitted | `useReducedMotion()` branch every time |
| Ad-hoc spring values per component | Shared `spring.snappy` / `spring.gentle` tokens |
| Manual list reflow choreography | `layout={LinearTransition.springify()}` + `entering`/`exiting` |
| Flat navigation | native-stack; check for `animation:'none'`/JS stack |
| Hand-rolled bottom sheet | `@gorhom/bottom-sheet` v5 + `GestureHandlerRootView` |
| Timing animation on a draggable surface | Spring/velocity so it tracks the finger |
| Same speed for enter and exit | Exit ~30% faster |
| Layout animations do nothing | Reanimated Babel plugin missing / `GestureHandlerRootView` absent |
| Testing only in the simulator | Verify on a real mid-tier device |
