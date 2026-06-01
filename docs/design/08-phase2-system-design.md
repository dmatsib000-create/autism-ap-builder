# Phase 2 System Design — build plan + open-item resolutions

> Output of `/system-design`, run against the real `autism-ap-builder.html`.
> Resolves the five engineering open items left by `07-phase2-concept.md` and
> gives the build sequence, the exact selectors/markup, and the test-lane
> reasoning. Design intent is locked in `07`; this is the *how*.

## Source findings (verified against the real file)

| # | What I checked | Finding | Line(s) |
|---|---|---|---|
| A | Are section headers generated or static? | **Static HTML.** `generateNote()` never reads them. Golden cannot move. | 734, 953, 1010, 1116, 1249, 1321, 1369, 1387 |
| B | Header text structure | Numeral + em-dash + title are **one fused text node**: `1 &mdash; Patient Profile <span>&#9660;</span>`. Only the chevron is wrapped. | 735 et al. |
| C | `.chip` / `.r-opt` / `.tab-btn` positioning | **None are `position:relative`.** Required for absolute `::after`. | 338, 320, 531 |
| D | Document sheet backgrounds | `.note-content`, `.note-doc`, `.aba-doc` all use `background:var(--bg-card)`. | 378, 471, 535 |
| E | Chevron CSS/JS dependency | CSS rotates `.sec-head.collapsed > span:last-child`; `toggleSec` toggles `.collapsed` (CSS-driven rotation). | 213–214, 5265 |
| F | Wiring-lane policed families | `STATE_FAMILY` (is-on, pill-off, …) + `CHIP_FAMILY` (chip, r-opt, tab-btn, …). **No `.sec-*` structural classes.** | wiring.mjs 63–70 |
| G | Two non-numbered sec-heads | ★ ABA params + ⚙ Adjust Referrals have inline styles, no numeral. | 1412, 1482 |

---

## Item 1 — Slate density mechanism

**Decision: per-component padding cuts, scoped under `:root[data-theme="slate"]`.**
Reject the scoped-scale-override approach.

| | Scoped scale override (`--space-*` re-pointed) | Per-component padding cuts |
|---|---|---|
| Lines of CSS | Few | More (~8–12 rules) |
| Blast radius | **Global** — every `--space-*` consumer moves at once, predictable only if you audit all consumers | **Surgical** — only the components named move |
| Risk to preserved frames | A shared token *could* compress a document frame indirectly | Document frames use `pt`/literals + are never targeted — **impossible to hit** |
| Validated? | No | Yes — the prototype expressed Slate density per-component |

Per-component is the lower-risk choice precisely because the preserved clinical
documents must not regress: targeting `.section`, `.sec-head`, `.cb-row`,
`.r-opt`, `.chip` paddings by name guarantees the note/letter frames are never
touched. Tighten ~25–30%; **body text stays ≥13px, AA holds** (density from
spacing + rules, not shrinking text).

```css
:root[data-theme="slate"] .section{ /* rules, set in Item-2 block */ }
:root[data-theme="slate"] .sec-head{ padding:6px 12px; min-height:32px }
:root[data-theme="slate"] .sec-body{ padding-top:6px; padding-bottom:6px } /* confirm class */
:root[data-theme="slate"] .r-opt{ padding:3px 8px }
:root[data-theme="slate"] .chip{ padding:2px 8px }
:root[data-theme="slate"] .cb-row{ /* ruled tabular, Item-2 block */ }
```
(Exact values tuned during visual-verify; the **mobile `max-width:768px` block
must still win** — its ≥44px targets override desktop density. Verify order.)

---

## Item 2 — Masthead markup restructure

**The one markup change in Phase 2.** Applies to the **8 numbered sections only**
(not the ★/⚙ utility headers — finding G). The restructure must keep **default
and Warm pixel-identical** while enabling the Slate masthead.

### Markup (per numbered header)
Current:
```html
<div id="sh-profile" class="sec-head" onclick="toggleSec(this,event)">1 &mdash; Patient Profile <span>&#9660;</span></div>
```
Phase 2:
```html
<div id="sh-profile" class="sec-head" onclick="toggleSec(this,event)"><span class="sec-label"><span class="sec-folio">1</span><span class="sec-kicker">Profile</span><span class="sec-title">Patient Profile</span></span><span class="sec-chevron">&#9660;</span></div>
```

### How each theme renders the same markup
- **Default / Warm:** `.sec-folio::after{content:' \2014 '}` reconstructs
  `1 — Patient Profile`; `.sec-kicker{display:none}`; `.sec-title` inline. Result
  is byte-for-byte the current header look (Warm adds the deboss — Item below).
- **Slate:** `.sec-folio::after{content:none}` + folio becomes a hanging
  Newsreader numeral; `.sec-kicker{display:block}` vermilion tracked uppercase;
  `.sec-title` Newsreader title; `.sec-label{display:grid}` hangs the folio in a
  narrow left margin. The masthead.

### Kicker label source
Hand-authored, one short word per section (the prototype used *Diagnosis /
Profile / Plan*). Proposed set, author inline in markup:
`1 Profile · 2 Workup · 3 Criteria · 4 Needs · 5 Comorbidity · 6 School ·
7 Safety · 8 Guidance`. (Maintainer confirms wording; it is page chrome, no PHI,
never enters note output.)

### Chevron safety (finding E)
New last child is `.sec-chevron` (a span) → `.sec-head > span:last-child` and
`.sec-head.collapsed > span:last-child` still match it. **Recommend** also
repointing those two selectors to `.sec-chevron` for robustness (1-line each).
`toggleSec` is unaffected (toggles `.collapsed`; doesn't read header text).

### Warm debossed folio
Lands with this commit (needs the `.sec-folio` span):
`[data-theme="warm"] .sec-folio{font-family:var(--font-display);text-shadow:var(--emboss)}`.

### Test-lane impact — still green
New classes are `.sec-label/.sec-folio/.sec-kicker/.sec-title/.sec-chevron`.
**None are in the wiring lane's policed families (finding F)** → wiring doesn't
require or forbid them. Golden snapshots note text, not chrome (finding A) →
unchanged. So the markup change is invisible to all four lanes. Add CSS + markup
together regardless (good practice).

---

## Item 3 — Build / commit sequence

Two code commits + a verify gate. Matches `06` build-sequence 2→3→4.

### Commit A — Tier 1 signature cues + Warm sheet (CSS-only, no markup)
Lowest risk; touches no markup, attaches only to existing classes.
- Add `position:relative` to `.chip`, `.r-opt`, `.tab-btn` base rules (finding C).
  Harmless in all themes (in-flow elements don't move).
- Warm: `.chip.is-on::after` amber filament (inset); `.r-opt.is-on` inset amber
  ring; `.tab-btn.is-on::after` top filament; key press (`:active` →
  `--key-press` + `translateY(.5px)`). Glyph mark unchanged (`.chip--check` keeps
  `✓`).
- Slate: `.chip.is-on::after` full-width vermilion underscore; `.r-opt.is-on`
  underscore; `.tab-btn.is-on::after` underscore; square toggle knob;
  `.chip--check.is-on::before` → `—` (confirmation 3). **`.btn-blue` solid
  vermilion is already live from Phase 1 — no rule** (confirmation 2; watch AA).
- **Warm sheet (Item 5):** one scoped rule (below).
- Gate: `npm test` (4 green) + visual-verify all 3 themes.

### Commit B — Slate structure + masthead + Warm deboss
Larger; markup + CSS; affects shared header markup → verify all three themes.
- Masthead markup restructure of the 8 numbered headers (Item 2) + chevron
  selector repoint.
- Slate section-as-rules: `[data-theme="slate"] .section{border:none;
  border-top:1px solid var(--border-strong);box-shadow:none;border-radius:0}`.
- Slate density (Item 1, per-component).
- Slate ruled checkbox lists: `[data-theme="slate"] .cb-row{border-bottom:1px
  solid var(--border-default);border-radius:0}` (confirm `.cb-list`/`.cb-row`
  class names in source first).
- Warm debossed folio.
- Gate: `npm test` (4 green) + visual-verify all 3 themes, paying attention to
  the left-panel section rhythm once cards become rules (per `04` §4).

### Verify gate (not a code commit)
- `npm test` — all four lanes byte-clean; **golden must be byte-identical** (if it
  moves, a generator was touched — stop, investigate, do **not** `test:update`).
- Manual: **3 themes × 3 document tabs** (A&P note, ABA, IEP). Confirm note
  dividers stay solid, letters stay formal black-on-white, `--letter-ink`
  unchanged, `Copy Plain`/`Copy Rich` output identical.
- `/verify` + `/code-review` on the diff (repo cadence).

---

## Item 4 — `.chip{position:relative}` precondition

**Confirmed required (finding C):** none of `.chip`, `.r-opt`, `.tab-btn` is
positioned. Add `position:relative` to each base rule in Commit A. The `::before`
mark stays in normal flow (inline-flex child, spaced by the existing `gap`); only
the `::after` filament/underscore is absolute and needs the positioned parent.
No layout shift in any theme (default renders no `::after`).

---

## Item 5 — Warm document-sheet selector (no interior bleed)

**Finding D makes this trivial.** The sheets already read `var(--bg-card)`. Add
one scoped, **background-only** rule:
```css
:root[data-theme="warm"] .note-content,
:root[data-theme="warm"] .note-doc,
:root[data-theme="warm"] .aba-doc{ background:var(--bg-elevated) } /* #fffdf7 warm paper */
```
- **Frame only:** sets `background`, nothing else. Fonts stay pinned
  (`.note-content` Courier; `.aba-doc` serif), `--letter-ink` stays pinned,
  dividers and prose untouched, paste output (literal hex) unaffected.
- **No interior bleed:** no descendant selector, no color/border/font change.
- **Default + Slate unaffected:** scoped to `[data-theme="warm"]`. (Slate's sheet
  stays its own near-white per `04`; default unchanged.)
- Verify the `@media (max-width:768px)` print-ish rule (line 639, sets
  `color:black`, strips border/shadow) is unaffected — it sets no background, so
  no conflict; confirm on a mobile-width pass.

---

## Trade-offs & what I'd revisit
- **Per-component density** trades more CSS lines for a guaranteed-safe blast
  radius. If the rule list grows past ~12, revisit a *narrow* scoped-token set
  (only `--space-*` values that exclusively drive the form panel).
- **Masthead via shared markup + `::after` em-dash reconstruction** keeps default/
  Warm identical at the cost of one slightly clever CSS rule. Alternative
  (separate per-theme markup) was rejected — it would fork the headers and bloat
  the file.
- **Persistent-cue-only** (locked) means no JS touches `render()`'s 48 call
  sites — the single biggest risk avoided. If the one-shot flourish is ever
  wanted, it is an isolated follow-up, not part of Phase 2.

## Pre-build confirmations — RESOLVED

1. **`.cb-list` / `.cb-row` / `.sec-body` all exist** (cb-list at 324/961/…;
   cb-row pervasive; sec-body at 215/1012/…). Density + ruled-list rules can
   target them by name. ✓
2. **`.btn-blue{background:var(--accent);color:white}`** (line 192) — the primary
   button is *already* accent-backed white text, so in Slate it is **already
   solid vermilion with no new rule** (free; it shipped in Phase 1). **Action:
   none** — but **verify AA**: `#fff` on vermilion `#c8362a` ≈ 4.0:1, which
   passes only for **bold ≥14px / ≥18.66px regular**. Buttons are 500-weight 12px
   → borderline; if it fails verify, darken to `--red-deep` (`#9c241a`) for the
   primary fill. **This is the one real a11y watch-item in Phase 2.**
3. **`.chip--check.is-on::before{content:'✓ '}` already exists** (line 343).
   **Plan corrected:** do **NOT** blanket-add `::before` to every `.chip.is-on` —
   plain chips intentionally have no mark today, and a universal `[data-theme]
   .chip.is-on::before` (specificity 0,3,1) would both override `.chip--check`
   (0,2,1) *and* add glyphs to every plain selected chip (clutter + visual
   regression in dense rows). Instead: the **`::after` filament/underscore is the
   primary state cue**; for the glyph, restyle **only the existing `.chip--check`
   mark per theme** — Warm keeps `✓`, Slate swaps to `—`
   (`[data-theme="slate"] .chip--check.is-on::before{content:'\2014 ';color:var(--accent)}`).
   Plain chips stay mark-free. ✓
4. **`toggleSec(h,e)` is markup-structure-safe** (lines 5269–5282): it uses only
   `h.nextElementSibling`, `classList.toggle`, and an `e.target` `.sec-dot` check
   — it never reads header text or child order. **The masthead restructure is
   fully safe.** One note: it special-cases a `.sec-dot` completion indicator —
   the restructure must **wrap only the text node and preserve any existing
   `.sec-dot`/chevron children**. ✓
