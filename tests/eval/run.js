import { execFileSync } from "node:child_process";
import { cpSync, rmSync, mkdirSync, copyFileSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const evalDir = dirname(fileURLToPath(import.meta.url));
const repo = join(evalDir, "..", "..");
const skills = ["motion-principles", "web-ux-motion", "app-ux-motion", "designer-handoff", "interaction-patterns"];
const configDirs = ["config-baseline", "config-with-skills"];

// 1. Rebuild the with-skills fixture from the live skill folders (single source of truth).
const skillsDir = join(evalDir, "fixtures", "config-with-skills", "skills");
rmSync(skillsDir, { recursive: true, force: true });
mkdirSync(skillsDir, { recursive: true });
for (const s of skills) cpSync(join(repo, s), join(skillsDir, s), { recursive: true });

// 2. Seed credentials into both isolated config dirs so headless Claude Code is authenticated.
const cred = join(homedir(), ".claude", ".credentials.json");
if (!existsSync(cred)) {
  console.error(`No credentials at ${cred}. Log in with \`claude\` or set ANTHROPIC_API_KEY.`);
  process.exit(1);
}
const seeded = configDirs.map((d) => join(evalDir, "fixtures", d, ".credentials.json"));
for (const dest of seeded) copyFileSync(cred, dest);

try {
  // 3. Run the eval from the repo root (so provider configDir paths resolve).
  // promptfoo's `exports` blocks its package.json subpath, so resolve the package
  // main ("." is exported) and use the sibling CLI entrypoint beside it.
  const entry = join(dirname(require.resolve("promptfoo")), "entrypoint.js");
  execFileSync(
    process.execPath,
    [entry, "eval", "-c", join(evalDir, "promptfooconfig.yaml"), "-o", join(evalDir, "results.json")],
    { stdio: "inherit", cwd: repo },
  );

  // 4. Gate on the treatment-beats-baseline delta.
  execFileSync(process.execPath, [join(evalDir, "delta.js")], { stdio: "inherit", cwd: repo });
} finally {
  // Never leave seeded credentials on disk.
  for (const dest of seeded) if (existsSync(dest)) unlinkSync(dest);
}
