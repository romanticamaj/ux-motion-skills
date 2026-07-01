import { describe, it, expect } from "vitest";
import {
  normalizeDuration,
  parseCssTokens, parseTsTokens, parseHandoffTokens, parsePrinciplesTokens,
} from "./parse-tokens";

describe("normalizeDuration", () => {
  it("parses seconds to ms", () => expect(normalizeDuration("0.16s")).toBe(160));
  it("parses ms directly", () => expect(normalizeDuration("240ms")).toBe(240));
  it("parses a bare number as ms", () => expect(normalizeDuration("320")).toBe(320));
  it("trims whitespace", () => expect(normalizeDuration("  0.32s ")).toBe(320));
});

describe("parseCssTokens", () => {
  const css = `:root{
    --dur-fast:0.16s; --dur-base:0.24s; --dur-slow:0.32s;
    --ease-out:cubic-bezier(0.22, 1, 0.36, 1);
    --ease-in:cubic-bezier(0.4, 0, 1, 1);
    --ease-standard:cubic-bezier(0.4, 0, 0.2, 1);
    --ease-emphasized:cubic-bezier(0.16, 1, 0.3, 1);
    --spring-snappy:300 30; --spring-gentle:200 26;
  }
  @media (prefers-reduced-motion: reduce){:root{--dur-fast:0.01ms;}}`;
  it("reads durations from :root only", () => {
    expect(parseCssTokens(css).durations).toEqual({ fast: 160, base: 240, slow: 320 });
  });
  it("reads easings", () => {
    expect(parseCssTokens(css).easings!.out).toEqual([0.22, 1, 0.36, 1]);
  });
  it("reads springs as stiffness/damping", () => {
    expect(parseCssTokens(css).springs!.snappy).toEqual({ stiffness: 300, damping: 30 });
  });
});

describe("parseTsTokens", () => {
  const md = "```ts\nexport const spring = {\n  snappy: { damping: 30, stiffness: 300, mass: 0.9 },\n  gentle: { damping: 26, stiffness: 200, mass: 1 },\n};\nexport const dur = { fast: 160, base: 240, slow: 320 };\n```";
  it("reads durations", () => expect(parseTsTokens(md).durations).toEqual({ fast: 160, base: 240, slow: 320 }));
  it("reads springs", () => expect(parseTsTokens(md).springs!.gentle).toEqual({ stiffness: 200, damping: 26 }));
  it("does not report easings", () => expect(parseTsTokens(md).easings).toBeUndefined());
});

describe("parseHandoffTokens", () => {
  const md = [
    "| `--dur-fast` | 160ms | exits |",
    "| `--dur-base` | 240ms | enters |",
    "| `--dur-slow` | 320ms | hero |",
    "| `--ease-out` | `0.22, 1, 0.36, 1` | entrances |",
    "| `--ease-in` | `0.4, 0, 1, 1` | exits |",
    "| `--ease-standard` | `0.4, 0, 0.2, 1` | cross-fade |",
    "| `--ease-emphasized` | `0.16, 1, 0.3, 1` | hero |",
    "| `spring.snappy` | 30 / 300 | buttons |",
    "| `spring.gentle` | 26 / 200 | cards |",
  ].join("\n");
  it("reads durations", () => expect(parseHandoffTokens(md).durations).toEqual({ fast: 160, base: 240, slow: 320 }));
  it("reads easings", () => expect(parseHandoffTokens(md).easings!.emphasized).toEqual([0.16, 1, 0.3, 1]));
  it("reads springs (damping / stiffness order)", () =>
    expect(parseHandoffTokens(md).springs!.snappy).toEqual({ stiffness: 300, damping: 30 }));
});

describe("parsePrinciplesTokens", () => {
  const md = [
    "| Enter (decelerate) | ease-out | `0.22, 1, 0.36, 1` |",
    "| Exit (accelerate away) | ease-in | `0.4, 0, 1, 1` |",
    "| Move-through / cross-fade | standard | `0.4, 0, 0.2, 1` |",
    "| Hero / shared-element | emphasized ease-out | `0.16, 1, 0.3, 1` |",
    "- Snappy (buttons, toggles): `stiffness 300, damping 30`",
    "- Gentle (cards, sheets): `stiffness 200, damping 26`",
  ].join("\n");
  it("reads easings positionally from the table", () =>
    expect(parsePrinciplesTokens(md).easings!.in).toEqual([0.4, 0, 1, 1]));
  it("reads springs from prose", () =>
    expect(parsePrinciplesTokens(md).springs!.gentle).toEqual({ stiffness: 200, damping: 26 }));
  it("does not report exact durations", () =>
    expect(parsePrinciplesTokens(md).durations).toBeUndefined());
});
