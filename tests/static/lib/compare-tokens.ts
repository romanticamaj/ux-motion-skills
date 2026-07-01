// Order-independent serialization: object keys are sorted so {stiffness,damping}
// and {damping,stiffness} compare equal, while arrays (easings) keep their order.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// Compares one dimension (durations | easings | springs) across N named sources.
// Returns [] when every source that defines a key agrees on it; otherwise a list of mismatches.
export function diffDimension(label: string, sets: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const entries = Object.entries(sets).filter(([, v]) => v != null) as [string, Record<string, unknown>][];
  const keys = new Set<string>();
  for (const [, obj] of entries) for (const k of Object.keys(obj)) if (obj[k] != null) keys.add(k);

  for (const key of keys) {
    const seen: { source: string; json: string }[] = [];
    for (const [source, obj] of entries) {
      if (obj[key] == null) continue;
      seen.push({ source, json: stableStringify(obj[key]) });
    }
    const distinct = new Set(seen.map((s) => s.json));
    if (distinct.size > 1) {
      const detail = seen.map((s) => `${s.source}=${s.json}`).join(", ");
      problems.push(`${label}.${key} disagrees: ${detail}`);
    }
  }
  return problems;
}
