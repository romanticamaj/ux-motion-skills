import { describe, it, expect } from "vitest";
import { extractCodeBlocks, normalizeSnippet } from "./extract-snippets";

describe("extractCodeBlocks", () => {
  const md = "text\n```tsx\nconst x = <div/>;\n```\nmore\n```css\n.a{color:red}\n```\n";
  it("returns each fenced block with its language", () => {
    const blocks = extractCodeBlocks(md);
    expect(blocks).toEqual([
      { lang: "tsx", code: "const x = <div/>;\n" },
      { lang: "css", code: ".a{color:red}\n" },
    ]);
  });
  it("ignores fences with no language", () => {
    expect(extractCodeBlocks("```\nplain\n```")).toEqual([]);
  });
});

describe("normalizeSnippet", () => {
  it("neutralizes JSX attribute elision", () => {
    expect(normalizeSnippet("<Img source={...} />")).toBe("<Img source={undefined} />");
  });
  it("removes lone ellipsis lines", () => {
    expect(normalizeSnippet("a();\n  ...\nb();")).toBe("a();\n\nb();");
  });
  it("leaves real spreads untouched", () => {
    expect(normalizeSnippet("const y = { ...props };")).toBe("const y = { ...props };");
  });
});
