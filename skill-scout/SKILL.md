---
name: skill-scout
description: Use when the user wants to find new Claude Code / Agent Skills and add them to this repo's curated README — e.g. "scout for skills", "find new claude skills", "update the skill list", "add more to the collection", or naming a niche to hunt in ("scout motion skills", "any good MCP skills?"). Researches the web, filters against a quality bar, dedupes against the existing list, and appends the survivors.
---

# Skill Scout

## Overview

Keep this repo's curated `README.md` fresh. When invoked, go find Claude skills worth listing,
judge them against the bar, and append the ones that survive — in the README's existing table
format. The point of the list is *differentiation*, not coverage: a skill that just recites best
practices the base model already follows does **not** belong here.

## The quality bar (apply ruthlessly — most candidates fail it)

List a skill only if it clears at least one:

1. **Official / library-author** — shipped by whoever owns the underlying tool (e.g. Software
   Mansion for Reanimated). Highest trust; note it explicitly.
2. **Proprietary or live** — pulls in current docs, private systems, or data the model can't bake in.
3. **Enforcement, not knowledge** — encodes specific constraints/tokens and *gates* on them.
4. **Non-obvious depth** — documented gotchas, edge cases, or taste a base model reliably gets wrong.

Reject: dead/abandoned repos, thin "reminds the model of best practices" knowledge skills,
duplicates of something already listed, and anything you can't verify has a real source.

## Workflow

Create a todo per step and work through them in order.

1. **Scope.** If the user named a niche ("motion", "MCP", "testing"), hunt there. Otherwise do a
   general sweep. Read the current `README.md` first so you know what's already listed and what the
   "Leads to triage" queue holds.
2. **Search broad, from several angles.** Run multiple web searches — GitHub repos, skill
   marketplaces/directories, "awesome claude skills" collections, and the specific niche. Also
   resolve items already sitting in the README's "Leads to triage" section.
3. **Fetch to verify.** For each promising hit, fetch the repo/page and extract: name, canonical
   URL (prefer the GitHub repo over an aggregator), author/owner, one-line purpose, category, and
   any signal you can see (stars, last-updated, official status). **Do not invent URLs** — if you
   can't confirm a real source, park it under "Leads to triage" instead of listing it.
4. **Judge.** Apply the quality bar above. Drop everything that fails. Be willing to return few or
   zero additions — an honest short list beats padding.
5. **Dedupe.** Compare survivors against the existing README (by repo URL and name). Skip anything
   already listed; if you found a better canonical URL for an existing row, update it.
6. **Append.** Add each survivor as a row in the correct category table, matching the existing
   `| Skill | What it's for | Source |` format. Create a new category section if a cluster of
   finds doesn't fit an existing one. Move any now-verified items out of "Leads to triage".
7. **Report.** Summarize what you added (with why each cleared the bar), what you rejected and why,
   and any fresh leads you couldn't verify (append those to "Leads to triage" for next time).

## Notes

- Default to editing `README.md` directly, then showing the user the diff of new rows. If the user
  said "propose only", output the candidate rows instead of writing them.
- Keep annotations honest and specific ("official, from the library authors" / "overlaps the base
  model — borderline"). The value of this list is trustworthy curation, not length.
- The tools you need are web search + fetch; no code runs here.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Listing generic "best practices" skills | Apply the bar — the base model already does those |
| Padding the list to look thorough | Few honest rows > many redundant ones; return zero if warranted |
| Linking an aggregator instead of the source | Prefer the canonical GitHub repo; verify it exists |
| Inventing a plausible repo URL | Never — park unverifiable finds under "Leads to triage" |
| Re-adding something already listed | Read README and dedupe by URL/name first |
