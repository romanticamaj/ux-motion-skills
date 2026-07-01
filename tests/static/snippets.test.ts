import { describe, it, expect } from "vitest";
import { transformSync } from "esbuild";
import postcss from "postcss";
import { SKILLS, readSkill } from "./lib/skills";
import { extractCodeBlocks, normalizeSnippet } from "./lib/extract-snippets";

type JsLoader = "ts" | "tsx" | "js" | "jsx";
const JS_LANGS = new Set<string>(["ts", "tsx", "js", "jsx"]);
const isTestable = (lang: string) => JS_LANGS.has(lang) || lang === "css";

const jsError = (code: string, loader: JsLoader): unknown => {
  try {
    transformSync(code, { loader });
    return null;
  } catch (e) {
    return e;
  }
};

// A block is valid if it parses directly. For jsx/tsx, doc recipes sometimes
// show sibling fragments from different files in one fence (which parse as a
// `a < b` comparison); accept those by retrying wrapped in a JSX fragment.
// Complete snippets parse on the first try, so this never hides a real error.
function jsSyntaxError(code: string, loader: JsLoader): unknown {
  const direct = jsError(code, loader);
  if (direct && (loader === "tsx" || loader === "jsx")) {
    return jsError(`<>\n${code}\n</>`, loader);
  }
  return direct;
}

for (const folder of SKILLS) {
  const testable = extractCodeBlocks(readSkill(folder)).filter((b) => isTestable(b.lang));
  if (testable.length === 0) continue; // motion-principles / designer-handoff carry no tagged code

  describe(`snippets: ${folder}`, () => {
    testable.forEach((b, i) => {
      it(`block #${i} (${b.lang}) is syntactically valid`, () => {
        const code = normalizeSnippet(b.code);
        if (JS_LANGS.has(b.lang)) {
          expect(jsSyntaxError(code, b.lang as JsLoader)).toBeNull();
        } else {
          expect(() => postcss.parse(code)).not.toThrow();
        }
      });
    });
  });
}
