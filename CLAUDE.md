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
│   ├── references.md                            Centralized bibliography (short handles + verification ledger)
│   ├── quickstart.png                           Tool screenshot (used in README)
│   └── audits/                                  Per-area audit procedures
├── tests/                       Tracked regression tests (Node, no deps): golden + unit + wiring + invariants lanes
│   ├── harness.mjs                              Loads the real HTML, exposes generators + pure deciders (no file changes)
│   ├── run.mjs                                  Golden-lane runner: `npm run test:golden`, `npm run test:update`
│   ├── unit.mjs                                 Unit-lane runner: `npm run test:unit` (pure decision fns)
│   ├── wiring.mjs                               Wiring-lane runner: `npm run test:wiring` (chip/state class contract, source lint)
│   ├── invariants.mjs                           Invariants-lane runner: `npm run test:invariants` (parallel lookup-table key sets, source lint)
│   ├── fixtures/                                One *.mjs per clinical scenario (sets up S)
│   └── golden/                                  Committed expected note/letter output
├── package.json                 Tracked: `test` (all four lanes) / `test:golden` / `test:unit` / `test:wiring` / `test:invariants` / `test:update`
├── clinicalnotes/               Local-only Python CLI project (untracked)
├── backups/                     Snapshots of autism-ap-builder.html + zip (untracked)
└── scratch/                     Working drafts: skill updates, prompts, test files (untracked)
```

Only `autism-ap-builder.html`, `README.md`, `CLAUDE.md`, `docs/`, `tests/`, and `package.json` are tracked in git and pushed to GitHub. Everything else is local.

### Tests (golden + unit + wiring + invariants regression net)

`npm test` runs four lanes against the **real**, unmodified `autism-ap-builder.html` (the golden/unit lanes evaluate its `<script>` in Node with DOM stubs; the wiring/invariants lanes read the file as text — no browser, no file changes):

- **Golden lane** (`tests/run.mjs`) — each fixture sets up an `S` state and snapshots the exact plain text from `generateNote()` and the ABA/IEP letter generators against a committed golden file. **When a change alters note output**, run `npm run test:update`, eyeball the golden diffs to confirm the change is intentional and clinically correct, and commit the updated goldens in the same commit.
- **Unit lane** (`tests/unit.mjs`) — asserts on the pure clinical-decision functions (`bifSpecifierAllowed`, `currentClinicalPathway`) behind specifier/BIF gating. These sit behind DOM wrappers the golden lane can't reach (they fire only from `onchange`/`render`), so the unit lane tests the gate predicate and the never-auto-bridge invariant directly.
- **Wiring lane** (`tests/wiring.mjs`) — source-text lint of the chip/state CSS-class contract: every state class JS toggles has a CSS rule, and every chip-family CSS rule is applied or toggled. Catches a JS/CSS/markup rename desync the output lanes can't see.
- **Invariants lane** (`tests/invariants.mjs`) — source-text lint that hand-maintained parallel lookup tables share the same key set: the three social-work-reason tables (`SW_REASON_LABELS`, the note prose's separate `swLbls` copy, the §8 HTML checkboxes), the override registry (`OV_DEFS` / `OV_GROUPS` / `S.overrides` init, where `socialWork` is intentionally absent from `S.overrides`), and the ABA-target tables (the `data-key="abaTargets"` checkboxes must equal the `TL` label-map keys 1:1 — a missing `TL` entry renders the raw key in the ABA letter; `TARGET_RATIONALE`, `TL_OLDER`, and the `syncABATargetsFromNeeds` `add()` calls are subset-checked for orphans). When you add or remove a key in any one of these tables, the lane fails until the parallel tables match — update them in the same commit. It also guards the **three IEP letter surfaces**: the letter is rendered three times from one `_iepLetterContent()` object (on-screen preview, the plain text pasted into Epic, and the formatted Word paste), but the golden lane snapshots only the plain one, so a content field wired into two surfaces and forgotten in the third ships silently. Every field in `IEP_SHARED_FIELDS` must be consumed by all three renderers. This is *not* in tension with the deliberate-specialization rule below: the note/ABA/IEP prose is three audiences and must stay separate, whereas these three are the same letter to the same reader in three formats. Formatting may differ freely between them; presence of a field may not. It also guards the **theme boundary**: the formal-letter pins (`--letter-ink` / `--letter-rule`) and the clinical amber semantic (`--amber*`) must stay defined only in base `:root` and never be overridden inside a `:root[data-theme=...]` block (otherwise letters bleed the theme accent). If you intentionally retire one of these pins, update `PIN_TOKENS` in the lane in the same commit.

See `tests/README.md` for adding fixtures and the lane rationale.

### Intake protocol for non-trivial requests

For requests where the deliverable shape depends on choices Claude shouldn't make alone (architecture, scope boundary, format, picking between reasonable patterns), run the intake protocol at `docs/templates/intake-prompt.md` before building or recommending. Skip for single-line bug fixes, renames, copyedits, file reads, and anything where running the protocol takes longer than the task — announce the skip in one line. To disable: delete this section (and optionally remove the template file).

### Reference-doc maintenance (mandatory in-commit updates)

Two living docs in `docs/` carry an "update in the same commit" rule:

- **`docs/branching-logic.md`** — see its own §12 Maintenance protocol for the list of files/constructs that trigger an update obligation.
- **`docs/references.md`** — the centralized bibliography. **When you add or remove a citation in any tracked file** (inline JS comment in `autism-ap-builder.html`, an A&P note reference line, an ABA letter reference line, an IEP letter reference, or anywhere in `docs/`), update `docs/references.md` in the same commit. When you remove a citation, first grep for its short handle (e.g., `grep -rn "\[mehler-2016\]"`) to find every consumer and decide whether each needs updating, replacing, or removing too. Do not invent bibliographic details — if a full citation is not in hand, mark the entry `needs verification` and surface that to the maintainer.

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

- **Complete absence of PHI by design.** The tool accepts NO identifying patient data. No name, no DOB, no MRN, no address, no school name, no parent names, no evaluator name, no physician name, no specific dates of evaluation or test administration (year only). Age is bucketed into developmental categories (toddler / preschool / school-age / adolescent / adult), not entered as a specific age. Insurance is bucketed into category (Commercial / Medicaid / TRICARE-ChampVA), not insurer name. **Every free-text field carries a `.phi-hint` reminding the clinician to type "the child" or `[NAME]` and no identifiers.** Generated letters use pronouns or bracketed placeholders (`[DATE]`, `[NAME]`, etc.) that the clinician fills in Epic post-paste. When adding a new field, the first question is "does this carry PHI" — if yes, find a categorical or placeholder alternative, or reject the field. Re-identification risk via combination of categorical fields is the residual; documented in branching-logic.md.
- **Smart/curly quotes (U+2016 `'`, U+2017 `'`) must never appear in JS string literals.** They cause "Invalid or unexpected token" syntax errors and silently break the entire script with no console output. If editing triggers this (e.g., from auto-correct), run a PowerShell replace: `$content -replace [char]8216,"'" -replace [char]8217,"'"`.
- `syncABATargetsFromNeeds()` is intentionally add-only (documented by comment). Do not add removal logic.
- The `─` (U+2500) and `═` (U+2550) box-drawing characters in JS string literals are intentional section dividers in note output — do not replace them with ASCII.
- **Avoid em dashes (`—`) in generated note prose.** Prefer a comma, semicolon, colon, or parenthetical instead. Em dashes are acceptable only in structural headers (e.g., `── Problem 1: ... — under evaluation ──`) where they serve as visual separators, not in running sentences.
- **Audience-tailored output is intentional, not duplication. Do not DRY prose across the three output surfaces.** The same clinical fact is deliberately re-expressed for three different readers: the **A&P note** (medical record / clinical framing), the **ABA letter** (insurance medical-necessity justification, which intentionally *omits* some content, e.g. school-age academic targets, to avoid reading as cost-shifting), and the **IEP letter** (education-law / IDEA-FAPE framing for a school district). Near-identical strings across these surfaces (e.g. a psychoeducational-eval line in both the note and the IEP letter, or accommodation text in both) are translations for different audiences, not copy-paste debt; consolidating them into one shared string flattens the audience distinction and is a **correctness regression**. Only **key sets / identifiers** are kept parallel across surfaces, and the invariants lane guards that parity; the **prose keyed by those identifiers is free to differ** (e.g. `TL` vs `TL_OLDER`, the note's service blurbs vs the IEP `svContent`). When a `/simplify`, `/code-review`, or `/tech-debt` pass flags this prose as duplication, that is a false positive: leave it.

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
