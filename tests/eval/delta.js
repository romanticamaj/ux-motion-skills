import { readFileSync } from "node:fs";

const THRESHOLD = Number(process.env.EVAL_DELTA_THRESHOLD ?? "0.15");
const data = JSON.parse(readFileSync(new URL("./results.json", import.meta.url), "utf8"));

// Locate the per-case results array across Promptfoo output-file shapes.
function findResults(d) {
  if (Array.isArray(d?.results?.results)) return d.results.results;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d)) return d;
  return [];
}

const rows = findResults(data);
if (rows.length === 0) {
  console.error("FAIL: no results found in results.json");
  process.exit(1);
}

const byLabel = {};
for (const r of rows) {
  const label = r.provider?.label ?? r.provider?.id ?? "unknown";
  const score = typeof r.score === "number" ? r.score : r.success ? 1 : 0;
  (byLabel[label] ??= []).push(score);
}

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const baseline = mean(byLabel.baseline ?? []);
const treatment = mean(byLabel.treatment ?? []);
const delta = treatment - baseline;

console.log(`baseline mean score:  ${baseline.toFixed(3)} (n=${(byLabel.baseline ?? []).length})`);
console.log(`treatment mean score: ${treatment.toFixed(3)} (n=${(byLabel.treatment ?? []).length})`);
console.log(`delta:                ${delta.toFixed(3)} (threshold ${THRESHOLD})`);

if (delta < THRESHOLD) {
  console.error("FAIL: skills did not improve output by the required margin.");
  process.exit(1);
}
console.log("PASS: skills improve agent output beyond baseline.");
