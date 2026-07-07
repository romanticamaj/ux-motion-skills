const { execFileSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const { resolve, join } = require("node:path");

// Resolve the real Claude Code executable so we can invoke it WITHOUT a shell
// (no command string, no injection surface). Override with CLAUDE_BIN if needed.
function resolveClaudeBin() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  const rel = join(
    "node_modules", "@anthropic-ai", "claude-code", "bin",
    process.platform === "win32" ? "claude.exe" : "claude",
  );
  const roots = [];
  if (process.platform === "win32" && process.env.APPDATA) roots.push(join(process.env.APPDATA, "npm"));
  if (process.env.npm_config_prefix) roots.push(process.env.npm_config_prefix);
  roots.push("/usr/local", "/usr");
  for (const r of roots) {
    const p = join(r, rel);
    if (existsSync(p)) return p;
  }
  return "claude"; // last resort: rely on PATH (POSIX execFile searches PATH)
}

// Promptfoo custom provider: runs headless Claude Code against a specific CLAUDE_CONFIG_DIR.
// The baseline config dir has no skills installed; the with-skills config dir has the pack, so
// the relevant skill auto-triggers from its description — exercising the real skill-loading path.
//
// Auth: each config dir must contain a `.credentials.json` (seeded by run.js from the user's
// real ~/.claude at eval time; never committed). The prompt is passed on stdin, so no user
// input ever reaches the argument list.
class ClaudeCodeProvider {
  constructor(options) {
    this.providerId = options.id || "claude-code";
    this.config = options.config || {};
    this.bin = resolveClaudeBin();
  }
  id() {
    return this.providerId;
  }
  async callApi(prompt) {
    const configDir = resolve(this.config.configDir);
    const opts = {
      input: prompt,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
      env: { ...process.env, CLAUDE_CONFIG_DIR: configDir },
    };
    let stdout;
    try {
      stdout = execFileSync(this.bin, ["-p", "--output-format", "json"], opts);
    } catch (err) {
      // A non-zero exit still emits the JSON result on stdout; fall back to it.
      stdout = err && typeof err.stdout === "string" ? err.stdout : "";
      if (!stdout) return { error: String(err && err.message ? err.message : err) };
    }
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      return { error: `Unparseable Claude Code output: ${stdout.slice(0, 200)}` };
    }
    if (parsed.is_error) {
      return { error: `Claude Code error: ${parsed.result || parsed.subtype || "unknown"}` };
    }
    return { output: typeof parsed.result === "string" ? parsed.result : stdout };
  }
}

module.exports = ClaudeCodeProvider;
