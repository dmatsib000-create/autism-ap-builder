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
├── package.json                 Tracked: `test` (all four lanes) / `test:golden` / `test:unit` / `test:wiring` / `test:invariants` / `test:update` / `test:update-selections`
├── .claude/                     Partly tracked: `skills/` (/verify, incl. cloud.md + scripts/drive.mjs headless driver), `commands/` (/council),
│                                plus cloud-only plugin copies (see .claude/third-party/README.md); everything else under .claude/ stays local
├── clinicalnotes/               Local-only Python CLI project (untracked)
├── backups/                     Snapshots of autism-ap-builder.html + zip (untracked)
└── scratch/                     Working drafts: skill updates, prompts, test files (untracked)
```

Only `autism-ap-builder.html`, `README.md`, `CLAUDE.md`, `docs/`, `tests/`, `package.json`, and the shared parts of `.claude/` (`skills/`, `commands/`, `agents/`, `third-party/`) are tracked in git and pushed to GitHub. Everything else is local. The `.claude/` pieces are tracked so cloud sessions, which start from a fresh clone, get /verify and /council. Cloud sessions do **not** install plugins, so /feature-dev, /engineering-code-review, /compliance-check, and /legal-risk-assessment are committed as copies: see `.claude/third-party/README.md`, and do not edit them except to refresh from upstream.

**`backups/autism-ap-builder_2026-05-16_pre-git.zip` must not be deleted.** Git history for this repo starts at the initial commit on 2026-05-18, where the app is already 343,953 bytes. That zip holds a 90,537-byte version from 2026-05-16 — two days earlier and roughly a quarter the size — so it is the only surviving copy of the tool from before it was placed under version control. `git` cannot reproduce it and no other backup comes close. Every other file in `backups/` is a routine dated snapshot of a state git already has; this one is not, which is why it carries `pre-git` in its name.

### Tests (golden + unit + wiring + invariants regression net)

`npm test` runs four lanes against the **real**, unmodified `autism-ap-builder.html` (the golden/unit lanes evaluate its `<script>` in Node with DOM stubs; the wiring/invariants lanes read the file as text — no browser, no file changes):

- **Golden lane** (`tests/run.mjs`) — each fixture sets up an `S` state and snapshots the exact plain text from `generateNote()`, the ABA/IEP letter generators, and the primary care list (`generatePCPPlain()`, output kind `pcp`) against a committed golden file. **When a change alters note output**, run `npm run test:update`, eyeball the golden diffs to confirm the change is intentional and clinically correct, and commit the updated goldens in the same commit.
- **Unit lane** (`tests/unit.mjs`) — asserts on the pure clinical-decision functions (`bifSpecifierAllowed`, `currentClinicalPathway`) behind specifier/BIF gating. These sit behind DOM wrappers the golden lane can't reach (they fire only from `onchange`/`render`), so the unit lane tests the gate predicate and the never-auto-bridge invariant directly. It also tests pure text helpers that run only from click handlers but whose output reaches the note (`appendEvidence`, the DSM-5 evidence-chip join), and the **Export / Restore selections** codec (`encodeSelections` / `decodeSelections`): every `initialState()` key must be classified in `SEL_FIELDS` (saved), `SEL_TYPED` (typed text, never exported) or `SEL_VIEW`, so **adding an `S` property fails this lane until you classify it**; a field left out of `SEL_TEMPLATE` is exported only at the Full level. One literal version-1 string is pinned: if it fails, a saved key or control value was renamed, and the fix is a `SEL_VERSION` bump plus a `SEL_MIGRATIONS` entry, not editing the pin.
- **Wiring lane** (`tests/wiring.mjs`) — source-text lint of the chip/state CSS-class contract: every state class JS toggles has a CSS rule, and every chip-family CSS rule is applied or toggled. Catches a JS/CSS/markup rename desync the output lanes can't see.
- **Invariants lane** (`tests/invariants.mjs`) — source-text lint that hand-maintained parallel lookup tables share the same key set: the three social-work-reason tables (`SW_REASON_LABELS`, the note prose's separate `swLbls` copy, the §8 HTML checkboxes), the override registry (`OV_DEFS` / `OV_GROUPS` / `S.overrides` init, where `socialWork` is intentionally absent from `S.overrides`), and the ABA-target tables (the `data-key="abaTargets"` checkboxes must equal the `TL` label-map keys 1:1 — a missing `TL` entry renders the raw key in the ABA letter; `TARGET_RATIONALE`, `TL_OLDER`, and the `syncABATargetsFromNeeds` `add()` calls are subset-checked for orphans), and the gait exam (every `data-key="gaitExam"` finding checkbox must have a `GAIT_FINDING_LABELS` entry, or the note prints "undefined"; the three watch-only plan inputs are exempt). It also checks the **Behavior/interfering summary** (every `data-key="needsBehavior"` checkbox must have a label in the `needsSummaryLines()` chain, or the note prints the heading with nothing after the colon; `rigidity` is derived from DSM-5 criterion B2 and has no checkbox on purpose, so it is exempt from the checkbox side but must still have a label). When you add or remove a key in any one of these tables, the lane fails until the parallel tables match — update them in the same commit. It also guards the **three IEP letter surfaces**: the letter is rendered three times from one `_iepLetterContent()` object (on-screen preview, the plain text pasted into Epic, and the formatted Word paste), but the golden lane snapshots only the plain one, so a content field wired into two surfaces and forgotten in the third ships silently. Every field in `IEP_SHARED_FIELDS` must be consumed by all three renderers. This is *not* in tension with the deliberate-specialization rule below: the note/ABA/IEP prose is three audiences and must stay separate, whereas these three are the same letter to the same reader in three formats. Formatting may differ freely between them; presence of a field may not. It also guards the **theme boundary**: the formal-letter pins (`--letter-ink` / `--letter-rule`) and the clinical amber semantic (`--amber*`) must stay defined only in base `:root` and never be overridden inside a `:root[data-theme=...]` block (otherwise letters bleed the theme accent). If you intentionally retire one of these pins, update `PIN_TOKENS` in the lane in the same commit. It also enforces **contrast floors** (`CONTRAST_PAIRS`): per theme, the text-box edge `--border-control` must stay ≥ 3:1 against the field fill, card, and page surface; the chip hint colors ≥ 4.5:1; and white on `--btn-green` / `--btn-green-hover` ≥ 4.5:1. Several of these were tuned to just clear AA, so retuning a neighbouring token can break them; the lane names the theme, pair, and ratio. Text boxes and menus get their edge from one base `:where(textarea,select,input…)` rule, and the lane fails if one sets an inline `border`. It also checks the **collapsed-by-default sections**: every `SEC_TABLE` row must have a matching `class="sec-head collapsed"` head and `class="sec-body hidden" inert` body in the markup, and vice versa (the table is the runtime authority, the markup makes the first paint right; a mismatch flashes open-then-shut on load). It also checks **restore sub-rows**: every hidden-by-default `...Row` element must have a `SEL_SUBROWS` predicate (or be on the lane's recomputed-on-render list), because restoring a selections string fires no change handlers and repaints sub-row visibility from that table; each such row must also name the fields inside it in `SEL_ROW_FIELDS`, and every `SEL_FIELDS` entry must resolve to a real control. It also holds the **selections vocabulary** to `tests/selections-vocabulary.json` (every field and option a saved string may contain): **adding a control or option fails the lane until you run `npm run test:update-selections`; removing or renaming one fails until you bump `SEL_VERSION` and add a `SEL_MIGRATIONS` entry**, because strings clinicians already saved would otherwise silently lose it. Never hand-edit that file to get green. Literal example strings in the docs (`APB<n>;key=...`) are held to the same vocabulary, version, and (for `scope=template` examples) `SEL_TEMPLATE`; the plain-word lists of what Template holds (panel hint, README, clinician page) are not machine-checked, so update all three when `SEL_TEMPLATE` or `SEL_TYPED` changes. After any change to a form control, its handler, `clearAll()`, or a `SEL_*` table, also run the browser round trip: `node .claude/skills/verify/scripts/drive.mjs .claude/skills/verify/scripts/roundtrip.js --timeout 580`. It also guards the **GDD cognitive-profile tier**: `GDD_COG_PROFILES` must equal the `gdd*` `cogProfile` radios, and no other array literal may restate the tier (an inline copy missing the ungraded `gdd` once let a GDD diagnosis survive an age change to school-age). It also checks the **golden fixtures against the page**: every value a fixture writes into `S` (`S.langLevel = '…'`, `S.abaTargets.add('…')`, the `forEach` add form) must be one a checkbox, radio, or `…Sel` menu on the page can produce, so a typo or stale key (`'singleWords'`, `'comm'`) fails the lane instead of snapshotting an unreachable state; keys with no control are ignored, and `needsBehavior` `rigidity` is exempt because the app derives it from criterion B2.

See `tests/README.md` for adding fixtures and the lane rationale.

### Intake protocol for non-trivial requests

For requests where the deliverable shape depends on choices Claude shouldn't make alone (architecture, scope boundary, format, picking between reasonable patterns), run the intake protocol at `docs/templates/intake-prompt.md` before building or recommending. Skip for single-line bug fixes, renames, copyedits, file reads, and anything where running the protocol takes longer than the task — announce the skip in one line. To disable: delete this section (and optionally remove the template file).

### Reference-doc maintenance (mandatory in-commit updates)

Two living docs in `docs/` carry an "update in the same commit" rule:

- **`docs/branching-logic.md`** — see its own §12 Maintenance protocol for the list of files/constructs that trigger an update obligation.
- **`docs/references.md`** — the centralized bibliography. **When you add or remove a citation in any tracked file** (inline JS comment in `autism-ap-builder.html`, an A&P note reference line, an ABA letter reference line, an IEP letter reference, or anywhere in `docs/`), update `docs/references.md` in the same commit. When you remove a citation, first grep for its short handle (e.g., `grep -rn "\[greenspan-2017\]"`) to find every consumer and decide whether each needs updating, replacing, or removing too. Do not invent bibliographic details — if a full citation is not in hand, mark the entry `needs verification` and surface that to the maintainer.

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

**Four output tabs:** A&P Note, ABA Letter, IEP Letter, PCP Recs — each with a sticky copy bar. Tab visibility is driven by state (e.g., IEP tab only appears when `S.schoolDoc !== ''` and `S.ageGroup !== 'toddler'`); PCP Recs is always visible.

**Primary care list (PCP Recs):** `PCP_DEFS` is the row table and `pcpBuild()` the pure builder behind the tab, both copies, and the note section that prints above Return to Clinic once `S.dbpFollowUp` is chosen. Every row is gated on a selection (`on`), and no row may restate a diagnosis. Row ids are saved values (`S.pcpOmit`, `S.pcpFirst`), so adding one needs `npm run test:update-selections` and renaming or removing one needs a `SEL_VERSION` bump. The clinician edits by leaving rows out or moving them up, never by retyping them, so edits survive a rebuild and no typed text enters a selections string. The follow-up lines always print; the standing "No routine DBP visits are planned" wording is allowed only when `pcpCtx().open` is empty and no return visit is typed. A row with a `lock` test cannot be left out while it holds (the suicide line, while the mood recheck prints). **The note's medication blocks print no dose and no drug menu**: they record what was prescribed through `RX_FILL` brace stops and name the dose reference once (`RX_DOSE_SOURCE`); a unit case fails on any milligram figure, so do not add one. Psychiatry is referred by exception (`S.psychReasons`, OCD), not by diagnosis. Clinical wording in a row is logged in `docs/branching-logic.md` §13.6 as reworded, attending, or added: keep that ledger current, and print no number that is not in the note already or verified in `docs/references.md` §11.

**Override system:** `resolveOv(key, defaultRule)` — allows per-section manual overrides of therapy recommendations. Callers use `referralIncluded(key)`, which looks the rule up in `OV_DEFS`; call `resolveOv` directly only when you also need the rule object.

**Pronoun system:** `getPron()` returns `{subj, obj, poss, refl, cap}`. The `cap` field is the sentence-opening capitalized subject (He/She/They/The child).

**`{placeholder}` syntax:** Used in ABA and IEP letter output for fields the clinician fills in after copying. Rendered with yellow CSS highlighting (`.aba-ph`, `.iep-ph`) in the on-screen preview only. The Word (rich) copy and the Epic (plain) copy both ship the braces verbatim and unstyled: Word carries inline run formatting into whatever the clinician types over a placeholder, and Epic already treats `{...}` as an F2 cursor stop, so there is no `***` rewrite.

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

- **Complete absence of PHI by design.** The tool accepts NO identifying patient data. No name, no DOB, no MRN, no address, no school name, no parent names, no evaluator name, no physician name, no specific dates of evaluation or test administration (year only). Age is bucketed into developmental categories (toddler / preschool / school-age / adolescent / adult), not entered as a specific age. Insurance is bucketed into category (Commercial / Medicaid / TRICARE-ChampVA), not insurer name. **Every free-text field carries a `.phi-hint` reminding the clinician to type "the child" or `[NAME]` and no identifiers.** Generated letters use pronouns or brace placeholders (`{Date}`, `{Student Name}`, etc.) that the clinician fills in Epic post-paste; Epic's F2 stops on every `{...}` and blocks signing while one remains. **Never use square brackets for text the clinician must fill in or delete** (`[DATE]`, `[Clinician: ...]`): Epic treats those as ordinary prose, F2 skips them, and they can be signed into the chart by accident. This applies to the A&P note too, which pastes verbatim. The **Export / Restore** selections string follows the same rule: it carries clicked choices only, restore accepts only values a page control can produce, and nothing typed may ever be added to `SEL_FIELDS`. When adding a new field, the first question is "does this carry PHI" — if yes, find a categorical or placeholder alternative, or reject the field. Re-identification risk via combination of categorical fields is the residual; documented in branching-logic.md.
- **Smart/curly quotes (U+2018 `'`, U+2019 `'`) must never appear in JS string literals.** They cause "Invalid or unexpected token" syntax errors and silently break the entire script with no console output. If editing triggers this (e.g., from auto-correct), run a PowerShell replace: `$content -replace [char]8216,"'" -replace [char]8217,"'"`.
- `syncABATargetsFromNeeds()` is intentionally add-only (documented by comment). Do not add removal logic.
- The `─` (U+2500) and `═` (U+2550) box-drawing characters in JS string literals are intentional section dividers in note output — do not replace them with ASCII.
- **Avoid em dashes (`—`) in generated note prose.** Prefer a comma, semicolon, colon, or parenthetical instead. Em dashes are acceptable only in structural headers (e.g., `── Problem 1: ... — under evaluation ──`) where they serve as visual separators, not in running sentences.
- **Audience-tailored output is intentional, not duplication. Do not DRY prose across the output surfaces.** (The primary care list is a fourth reader, the child's PCP, and the same rule covers it.) The same clinical fact is deliberately re-expressed for three different readers: the **A&P note** (medical record / clinical framing), the **ABA letter** (insurance medical-necessity justification, which intentionally *omits* some content, e.g. school-age academic targets, to avoid reading as cost-shifting), and the **IEP letter** (education-law / IDEA-FAPE framing for a school district). Near-identical strings across these surfaces (e.g. a psychoeducational-eval line in both the note and the IEP letter, or accommodation text in both) are translations for different audiences, not copy-paste debt; consolidating them into one shared string flattens the audience distinction and is a **correctness regression**. Only **key sets / identifiers** are kept parallel across surfaces, and the invariants lane guards that parity; instrument names and abbreviations (`PRIOR_TEST_LABELS`, e.g. "CARS-2 ST") count as identifiers, since an instrument's name does not change with the reader; the **prose keyed by those identifiers is free to differ** (e.g. `TL` vs `TL_OLDER`, the note's service blurbs vs the IEP `svContent`). When a `/simplify`, `/code-review`, or `/tech-debt` pass flags this prose as duplication, that is a false positive: leave it.

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
