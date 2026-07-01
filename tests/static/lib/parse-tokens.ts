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

const easingFromCsv = (csv: string): Easing =>
  csv.split(",").map((n) => parseFloat(n.trim())) as Easing;

export function parseCssTokens(css: string): TokenSet {
  const root = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  const dur = (n: string) => {
    const m = root.match(new RegExp(`--dur-${n}\\s*:\\s*([^;]+);`));
    return m ? normalizeDuration(m[1]) : undefined;
  };
  const ease = (n: string): Easing | undefined => {
    const m = root.match(new RegExp(`--ease-${n}\\s*:\\s*cubic-bezier\\(([^)]+)\\)`));
    return m ? easingFromCsv(m[1]) : undefined;
  };
  const spring = (n: string): Spring | undefined => {
    const m = root.match(new RegExp(`--spring-${n}\\s*:\\s*([\\d.]+)\\s+([\\d.]+)`));
    return m ? { stiffness: parseFloat(m[1]), damping: parseFloat(m[2]) } : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    easings: { out: ease("out"), in: ease("in"), standard: ease("standard"), emphasized: ease("emphasized") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parseTsTokens(md: string): TokenSet {
  const springBlock = md.match(/export const spring\s*=\s*\{([\s\S]*?)\};/)?.[1] ?? "";
  const durBlock = md.match(/export const dur\s*=\s*\{([^}]*)\}/)?.[1] ?? "";
  const spring = (n: string): Spring | undefined => {
    const sub = springBlock.match(new RegExp(`${n}:\\s*\\{([^}]*)\\}`))?.[1];
    if (!sub) return undefined;
    const stiffness = Number(sub.match(/stiffness:\s*(\d+)/)?.[1]);
    const damping = Number(sub.match(/damping:\s*(\d+)/)?.[1]);
    return { stiffness, damping };
  };
  const dur = (n: string) => {
    const m = durBlock.match(new RegExp(`${n}:\\s*(\\d+)`));
    return m ? Number(m[1]) : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parseHandoffTokens(md: string): TokenSet {
  const dur = (n: string) => {
    const m = md.match(new RegExp("`--dur-" + n + "`\\s*\\|\\s*([^|]+)\\|"));
    return m ? normalizeDuration(m[1]) : undefined;
  };
  const ease = (n: string): Easing | undefined => {
    const m = md.match(new RegExp("`--ease-" + n + "`\\s*\\|\\s*`([^`]+)`"));
    return m ? easingFromCsv(m[1]) : undefined;
  };
  // handoff table lists springs as "damping / stiffness"
  const spring = (n: string): Spring | undefined => {
    const m = md.match(new RegExp("`spring\\." + n + "`\\s*\\|\\s*(\\d+)\\s*/\\s*(\\d+)"));
    return m ? { damping: Number(m[1]), stiffness: Number(m[2]) } : undefined;
  };
  return {
    durations: { fast: dur("fast"), base: dur("base"), slow: dur("slow") },
    easings: { out: ease("out"), in: ease("in"), standard: ease("standard"), emphasized: ease("emphasized") },
    springs: { snappy: spring("snappy"), gentle: spring("gentle") },
  };
}

export function parsePrinciplesTokens(md: string): TokenSet {
  // easing table rows in canonical order: enter(out), exit(in), move-through(standard), hero(emphasized)
  const cubics = [...md.matchAll(/`(\d[^`]*,\s*\d[^`]*,\s*\d[^`]*,\s*\d[^`]*)`/g)].map((m) => easingFromCsv(m[1]));
  const [out, inn, standard, emphasized] = cubics;
  const springProse = (n: string): Spring | undefined => {
    const m = md.match(new RegExp(n + "[^`]*`stiffness (\\d+), damping (\\d+)`", "i"));
    return m ? { stiffness: Number(m[1]), damping: Number(m[2]) } : undefined;
  };
  return {
    easings: out ? { out, in: inn, standard, emphasized } : undefined,
    springs: { snappy: springProse("snappy"), gentle: springProse("gentle") },
  };
}
