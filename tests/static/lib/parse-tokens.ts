export type Easing = [number, number, number, number];
export interface Spring { stiffness: number; damping: number; }
export interface TokenSet {
  durations?: Partial<Record<"fast" | "base" | "slow", number>>;
  easings?: Partial<Record<"out" | "in" | "standard" | "emphasized", Easing>>;
  springs?: Partial<Record<"snappy" | "gentle", Spring>>;
}

export function normalizeDuration(raw: string): number {
  const s = raw.trim();
  if (s.endsWith("ms")) return parseFloat(s);
  if (s.endsWith("s")) return Math.round(parseFloat(s) * 1000);
  return parseFloat(s); // bare number = ms
}
