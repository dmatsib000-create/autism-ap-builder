# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projects

This directory contains two independent clinical tools for a Developmental Behavioral Pediatrics (DBP) practice.

### Repo layout

```
claude_code/
├── autism-ap-builder.html       Main app (tracked, public)
├── README.md  CLAUDE.md         Tracked
├── docs/                        Tracked living references
│   ├── branching-logic.md                       Technical reference (maintainer + Claude audience)
│   ├── branching-logic-for-clinicians.html      Plain-English clinician companion (living spec)
│   ├── quickstart.png                           Tool screenshot (used in README)
│   └── audits/                                  Per-area audit procedures
├── clinicalnotes/               Local-only Python CLI project (untracked)
├── backups/                     Snapshots of autism-ap-builder.html + zip (untracked)
└── scratch/                     Working drafts: skill updates, prompts, test files (untracked)
```

Only `autism-ap-builder.html`, `README.md`, `CLAUDE.md`, and `docs/` are tracked in git and pushed to GitHub. Everything else is local.

---

## autism-ap-builder.html

A single-file clinical note generator for autism Assessment & Plan documentation. No build system, no dependencies, no external network requests, no frameworks. Open directly in a browser.

### Running

Open `autism-ap-builder.html` in a browser. The preview server (port 3737) is used for development verification.

### Architecture

Everything lives in one file: CSS in `<style>`, JavaScript in `<script>`. There is no module system — all functions are declared at script scope inside the `<script>` block and are **not** accessible via `window.*` in the browser console.

**State object `S`** (declared near top of `<script>`): single source of truth. Contains scalar strings, booleans, and `Set` instances (`needsComm`, `needsBehavior`, `needsAdaptive`, `needsSensory`, `needsMotor`, `needsSocial`, `safety`, `abaTargets`, `abaSetting`, `priorTesting`, `schoolSvc`, `specifiers`, `comorbid`, `criteriaA`, `criteriaB`, `ag`). `S.asdLevel` does **not** exist — use `S.asdLevelSC` and `S.asdLevelRRB` (two-domain DSM-5 severity model). Derive a combined level as `S.asdLevelSC || S.asdLevelRRB`.

**Output pipeline:**
- `render()` — master re-render, called on every state change
- `generateNote()` — returns `{main, assessment, plan}` object (not a string)
- `generateClinicalSummary()` — returns a string; called within `generateNote()`
- `_abaContent()` — builds ABA letter content object; used by `generateABALetter()` and `generateABALetterPlain()`
- `_iepLetterContent()` — builds IEP letter content object; used by `generateIEPLetterHTML()` and `generateIEPLetterPlain()`

**Three output tabs:** A&P Note, ABA Letter, IEP Letter — each with a sticky copy bar. Tab visibility is driven by state (e.g., IEP tab only appears when `S.schoolDoc !== ''` and `S.ageGroup !== 'toddler'`).

**Override system:** `resolveOv(key, defaultRule)` — allows per-section manual overrides of therapy recommendations.

**Pronoun system:** `getPron()` returns `{subj, obj, poss, refl, cap}`. The `cap` field is the sentence-opening capitalized subject (He/She/They/The child).

**`{placeholder}` syntax:** Used in ABA and IEP letter output for fields the clinician fills in after copying. Rendered with yellow CSS highlighting (`.aba-ph`, `.iep-ph`). The Epic copy format replaces `{...}` with `***` cursor stops.

**Prose grammar helpers — `v3()` and `aOr()`:** Both are module-scope, defined just after `getPron()`. Any prose generator that uses a `getPron()`-derived subject (`pr.cap`, `pr.subj`, `pCap`, `pSub`, or a ternary involving those) MUST wrap finite verbs in `v3()` so the "they" pronoun renders grammatically ("they have" not "they has"). Do not redefine `v3()` locally inside a function — extend `V3_MAP` instead when new verbs are needed. Article elision before vowel-initial nouns ("an adolescent") uses `aOr(noun)`. See `docs/audits/verb-agreement.md` for the audit procedure to run when prose content is added.

### Code comments

Leave concise inline comments when the reasoning is genuinely non-obvious — not to restate what the code does, but to explain *why* it is the way it is. Good candidates:

- Intentional constraints that look like omissions (e.g., add-only sync functions)
- Clinical rules whose rationale isn't derivable from code alone (e.g., DSM-5 age gates)
- CSS-in-JS values that must not be changed to an intuitive alternative (`display:'contents'` not `''`)
- Non-obvious cross-function interactions or side effects

Skip comments for self-explanatory code, changelog-style notes ("added X to fix Y"), or anything already covered in this file. Those belong in commit messages, not source.

**`WARY:` comment convention.** A `// WARY:` (or `/* WARY: */`) comment marks code that works but the maintainer has flagged as fragile, under-tested, or built on an approach they don't fully trust. Distinct from `TODO` (do this later) and `FIXME` (broken, fix soon). `WARY:` means "this is the best we have right now, but read this carefully before changing it." Greppable: `grep -rn "WARY:"` gives a full inventory. When you see one:

- Read the full comment before modifying the line or function
- Do not silently remove a `WARY:` marker. If you genuinely resolve the underlying concern, replace the marker with a brief explanation of why the wariness is no longer warranted (or move it to commit history if removed entirely)
- If you make the wary code worse (e.g., add more silent-fallback behavior), update the comment to reflect the broadened concern

### Critical constraints

- **Smart/curly quotes (U+2016 `'`, U+2017 `'`) must never appear in JS string literals.** They cause "Invalid or unexpected token" syntax errors and silently break the entire script with no console output. If editing triggers this (e.g., from auto-correct), run a PowerShell replace: `$content -replace [char]8216,"'" -replace [char]8217,"'"`.
- `syncABATargetsFromNeeds()` is intentionally add-only (documented by comment). Do not add removal logic.
- The `─` (U+2500) and `═` (U+2550) box-drawing characters in JS string literals are intentional section dividers in note output — do not replace them with ASCII.
- **Avoid em dashes (`—`) in generated note prose.** Prefer a comma, semicolon, colon, or parenthetical instead. Em dashes are acceptable only in structural headers (e.g., `── Problem 1: ... — under evaluation ──`) where they serve as visual separators, not in running sentences.

---

## clinicalnotes/ (clinicalnotes.py / clinicalnotes_shared.py)

Python CLI tools that pipe clinical text through the UF institutional AI API and stream output to the terminal. PHI is never written to disk. Lives in the `clinicalnotes/` subfolder (untracked — local-only project, never pushed to GitHub).

### Running

```
# From repo root:
python clinicalnotes/clinicalnotes.py
python clinicalnotes/clinicalnotes.py --mode caregiver-history

# Shared version (prompts for API key at runtime — safe to distribute)
python clinicalnotes/clinicalnotes_shared.py

# Or cd into the folder first:
cd clinicalnotes && python clinicalnotes.py
```

### Setup

```
pip install openai rich
setx LOCAL_AI_KEY your-key-here   # Windows, persistent; then reopen terminal
```

API endpoint: `https://api.ai.it.ufl.edu/v1/` — requires UF network or VPN.  
Default model: `gpt-oss-120b` (override with env var `LOCAL_AI_MODEL`).

### Architecture

**`clinicalnotes.py`** — personal version; reads `LOCAL_AI_KEY` from environment at startup.  
**`clinicalnotes_shared.py`** — distributable version; prompts for API key interactively; hardcodes model name (no env var override).

Both files are self-contained. The `MODES` dict maps keys `"1"`–`"4"` to mode objects with `name`, `label`, and `system_prompt`. Adding a new mode means adding an entry to `MODES` and a corresponding `--mode` choice string.

The `process()` function runs a streaming completion loop: after each response, the user may type a refinement instruction or press Enter to exit. Revision turns append assistant/user message pairs to the running `messages` list.

**Four modes:** caregiver-history, peds-scores, exam-obs, assessment-and-plan. Each has a detailed system prompt that constrains output format and scope. The system prompts are the primary logic — there is minimal Python control flow beyond the streaming loop.

Input is read via `sys.stdin.read()` (terminated by Ctrl+Z + Enter on Windows). Output is rendered with `rich.Markdown`.

`store=False` and `extra_body={"no-log": True}` are passed on every completion call to suppress server-side logging of PHI.
