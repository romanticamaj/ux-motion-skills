export function extractCodeBlocks(md: string): { lang: string; code: string }[] {
  const blocks: { lang: string; code: string }[] = [];
  const re = /```([A-Za-z0-9]+)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) blocks.push({ lang: m[1], code: m[2] });
  return blocks;
}

// Documentation recipes elide irrelevant code with `...`. Neutralize those
// well-understood placeholders so a syntax check validates the real code, not
// the elisions. Real spreads (`{ ...props }`, `[...items]`) are left untouched.
export function normalizeSnippet(code: string): string {
  return code
    .replace(/\{\s*\.\.\.\s*\}/g, "{undefined}") // JSX/expr elision, e.g. source={...}
    .replace(/^[ \t]*\.\.\.[ \t]*$/gm, "");       // a line that is only `...`
}
