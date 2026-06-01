# Phase 1 Handoff Spec — three switchable themes in the real app

> Developer handoff (design-handoff skill) to port the approved design from
> `prototype-themes.html` into the real `autism-ap-builder.html`. Companion to
> `01`–`05`. **Phase 1 only:** token blocks + theme toggle + font self-hosting.
> CSS-only where possible; class names stable; clinical documents preserved; all
> four test lanes stay green.

## Implementation status (branch `feat/themes-phase1`)
**DONE & verified** — color/font-stack/shadow/radius themes + toggle:
- Two `[data-theme]` token blocks added (override existing names; Current = `:root`, unchanged).
- `--font-display` slot + `--letter-ink`/`--letter-rule` pins added; `.aba-doc .aba-sec` repointed to the pins; `.app-header h1` uses `--font-display`.
- Theme cycle button in `.header-actions` + pre-paint `<head>` restore (`<script data-theme-boot>`) + `applyTheme`/`cycleTheme` in the app script; persists to `localStorage('apTheme')` (string only, no PHI).
- **Verified in-browser** (port 3737): cycles Current(`#1e50d2`)→Warm(`#bf6a1e`)→Slate(`#c8362a`); radius 6px→…→2px; **`--letter-ink` stays `#1438a8` in every theme** (letters stay formal); note-content stays Courier; no console errors.
- **All four test lanes green** (19 golden / 21 unit / wiring / invariants).

**Deviation from plan (intended):** adding the pre-paint `<head>` script meant the
golden/unit harness (`tests/harness.mjs`, `extractScript`) — which asserted
*exactly one* `<script>` — had to learn the rule "exactly one **bare** `<script>`
(the app); bootstrap blocks must carry an attribute (e.g. `data-theme-boot`)."
Updated accordingly; this is a test-infra change, not app logic.

**NOT YET DONE — fonts (the big line item):** webfonts are **not** embedded, so
Warm/Slate currently fall back to the system serif/sans stack. Colors/shadows/
radii are fully live; the bespoke faces (Fraunces, IBM Plex, Newsreader, Libre
Franklin) need self-hosting as subset base64 `@font-face` before they render.
This is the remaining Phase-1 task (see "Fonts" below).

---

## Overview
Add two opt-in visual themes (**Warm Instrument**, **Editorial Slate**) on top of
the existing UI, which stays the **default**. A header button cycles
Current → Warm → Slate and persists the choice. The generated clinical documents
(A&P note, ABA/IEP letters) and the Epic/Word paste output look identical in
every theme. No clinical logic changes; `generateNote()` output text must remain
byte-identical.

## The one critical decision: override existing names, don't rename
The prototype used an *invented* canonical vocabulary (`--accent`,
`--surface-*`, `--ink-*`). **The real app already has 66 `:root` variables with
different names** (`--blue`, `--accent`, `--gray-50…900`, `--surface`,
`--bg-card`, `--border-*`, `--amber`, `--red`, `--green`, `--shadow-*`, …) wired
through thousands of CSS usages.

→ **Do NOT rename anything.** The two theme blocks **override the app's existing
variable names** with new values. Every existing CSS rule keeps working
untouched; the diff is purely additive. This is what makes Phase 1 CSS-only and
test-safe.

Concretely, map the prototype's intent onto the real names:

| Prototype token | Real app token(s) to override per theme |
|---|---|
| `--accent` / `--accent-deep` / `--accent-tint` / `--accent-ink` | `--blue` / `--blue-dark` / `--blue-light` (and `--accent`, `--accent-soft`, `--accent-hover` which alias them) |
| `--surface-desk/panel/card/raised` | `--gray-100` (body bg) / `--surface` / `--bg-card` / `--bg-elevated` |
| `--ink-900/700/500/400` | `--gray-800` / `--gray-700` / `--gray-500` / `--gray-400` (+ `--gray-600/900`) |
| `--line/line-strong` | `--border-subtle` / `--border-default` / `--border-strong` (+ `--gray-200/300`) |
| `--ok*` / `--err*` | `--green*` / `--red*` |
| `--font-ui` / `--font-display` / `--font-mono` | `--font` (+ a new `--font-display`); note font pinned separately (below) |
| shadows / radii / motion | `--shadow-*` / `--radius-*` / `--dur-*` / `--ease` |

So a theme block is: *"re-point the app's existing variables to warm/slate
values."* Example (abbreviated — full values come straight from
`prototype-themes.html` `:root[data-theme="warm"]` / `[data-theme="slate"]`,
translated to the real names):

```css
:root[data-theme="warm"]{
  --blue:#bf6a1e; --blue-dark:#9a5212; --blue-light:#f4e2c4;
  --gray-100:#f3ecdc; --surface:#f3ecdc; --bg-card:#fbf6ea; --bg-elevated:#fffdf7;
  --gray-800:#2a251d; --gray-700:#41392d; --gray-500:#6c6253; --gray-400:#938876;
  --border-subtle:#e7ddc8; --border-default:#ddd2bd; --border-strong:#c9bca2;
  --green:#5d7a3a; --green-light:#e6ecd4; --green-dark:#3c5021;
  --red:#a8432b; --red-light:#f3dcd2; --red-dark:#7a2c19;
  --font:'IBM Plex Sans',system-ui,sans-serif; --font-display:'Fraunces',Georgia,serif;
  --radius-sm:3px; --radius:5px; --radius-md:7px;
  /* shadows/key/emboss + the new --letter-rule (see Preserved docs) */
}
:root[data-theme="slate"]{ /* …vermilion + graphite + Newsreader/Libre Franklin, square radii, flat shadows… */ }
```

`--amber*` stays the app's amber (it's a clinical semantic, not the brand). In
Slate, re-point the *suspected pathway pill only* to a muted amber/clay so it
can't be confused with the vermilion active accent — do this at the pill rule,
not by changing `--amber` globally (other consumers depend on it).

---

## Design tokens used
All values are in `prototype-themes.html`. The default theme = the app's current
`:root`, unchanged. Spacing (`--space-1…9`) and the type scale (`--text-*`) are
**not** themed — keep them as-is. Phase 2 (Editorial Slate density) may tighten
spacing later; Phase 1 holds it.

---

## Components — what changes, per theme
Every component keeps its **existing class name and `.is-on` state contract**
(the wiring lane enforces this; renames cost test edits — avoid in Phase 1).

| Component | Class | Default | Warm | Slate |
|---|---|---|---|---|
| Buttons | `.btn` + variants | unchanged | letterpress `--key-rest`/`--key-press`, amber primary | flat, vermilion solid primary (action only) |
| Chips | `.chip` `.is-on` | unchanged | amber-tint fill + filament | flat underlined; selected = tint + persistent underscore + em-dash |
| Radio | `.r-opt` `.is-on` | unchanged | amber-tint + inset ring | graphite tint + 3px left vermilion tick |
| Checkbox rows | `.cb-row` | unchanged | warm hover wash | ruled tabular rows |
| Section | `.section`/`.sec-head` | unchanged (card) | warm card + debossed numeral | **(Phase 2)** rules + folio/kicker masthead |
| Tabs | `.tab-btn` `.is-on` | unchanged | raised key | underscore |
| Toggle | `.tog`/`.tog-sl` | unchanged | amber, round knob | vermilion, square knob |
| Pills | `.pathway-pill` etc. | unchanged | warm-shifted hues | flat left-ruled tags |

**Scope note:** the Slate section-as-rules + density + masthead header
(`[data-theme="slate"]` structure overrides) is the largest visual change.
Recommend it lands in **Phase 2**, not Phase 1, so Phase 1 is a pure
color/font/shadow revalue with the lowest possible risk. Phase 1 Slate = slate
*colors + fonts*; Phase 2 Slate = the rules/density/masthead structure.

---

## States and interactions (the calmed animation contract)
| Element | State | Behavior |
|---|---|---|
| chip / r-opt | `.is-on` (rest) | **Persistent** static cue (amber filament / vermilion underscore via `::after`). No animation at rest. |
| chip / r-opt | activation | One-shot flourish: add `.just-on`; CSS animates once; JS removes `.just-on` on `animationend` (500ms timeout fallback). |
| tab | switch | Same one-shot pattern on the newly-selected tab only. |
| any | `prefers-reduced-motion` | All transitions/animations disabled (existing app rule already covers this). |

Port the `.just-on` mechanism from the prototype JS. **Important:** the real
app re-renders via `render()` (48 call sites) and rebuilds DOM — confirm the
selected `.is-on` state is reapplied from `S` on each render (it already is, for
existing classes) and that `.just-on` is added only on genuine user activation
handlers, never on a programmatic re-render, or the flourish will replay. If
clean separation is hard inside `render()`, it is acceptable to ship the
**persistent state cue without the one-shot animation** in Phase 1 and add the
flourish in Phase 2 — the persistent cue is the load-bearing part.

---

## The theme toggle (markup + JS)

**Markup** — add to `.header-actions` (real app line ~593), before the
`Clear All` group:
```html
<button class="btn btn-outline btn-theme" id="themeBtn" onclick="cycleTheme()"
        aria-label="Switch color theme" title="Switch color theme">
  <span class="theme-swatch" aria-hidden="true"></span>
  <span id="themeLabel">Theme: Current</span>
</button>
<div class="header-sep"></div>
```
(Use the existing `.btn`/`.btn-outline` classes so it inherits every theme; add
a small `.btn-theme .theme-swatch` rule = an 11px dot filled with `var(--accent)`.)

**JS** — add near the other init code; run the restore **before first paint** to
avoid a flash. Best: a tiny inline `<script>` in `<head>` that reads
localStorage and sets `data-theme` immediately; the label/handlers wire up in
the existing `DOMContentLoaded` (line 5870).
```html
<!-- in <head>, before </head>: pre-paint theme restore (no FOUC) -->
<script>try{var t=localStorage.getItem('apTheme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}</script>
```
```js
// in the main <script>: cycle + label. UI preference only — NO PHI.
var AP_THEMES=[{id:'',label:'Current'},{id:'warm',label:'Warm Instrument'},{id:'slate',label:'Editorial Slate'}];
function applyTheme(id){
  if(id)document.documentElement.setAttribute('data-theme',id);
  else document.documentElement.removeAttribute('data-theme');
  var t=AP_THEMES.find(function(x){return x.id===id;})||AP_THEMES[0];
  var lbl=document.getElementById('themeLabel'); if(lbl)lbl.textContent='Theme: '+t.label;
  try{localStorage.setItem('apTheme',id);}catch(e){}
}
function cycleTheme(){
  var cur=document.documentElement.getAttribute('data-theme')||'';
  var i=AP_THEMES.findIndex(function(x){return x.id===cur;});
  applyTheme(AP_THEMES[(i+1)%AP_THEMES.length].id);
}
// in DOMContentLoaded: sync the label to whatever the pre-paint script set
applyTheme(document.documentElement.getAttribute('data-theme')||'');
```

**PHI:** `localStorage` stores only the string `'' | 'warm' | 'slate'`. No
patient data. Consistent with the no-PHI constraint; document it in a comment.

---

## Preserved clinical documents (hard boundary — must not regress)
| Surface | Class | Rule |
|---|---|---|
| A&P note | `.note-content`, `.note-doc` | **Pin font** to `Consolas,'Menlo','DejaVu Sans Mono','Liberation Mono','Courier New',monospace` — the SAME in all themes, NOT the themed `--font`/mono (webfont monos break the `─`/`═` box-drawing). Characters unchanged (copy to Epic verbatim). |
| ABA + IEP letters | `.aba-doc`, `.aba-sec`, `.iep-ph` | Formal serif (`--font-serif`/Georgia) unchanged. `.aba-sec` rule pinned via a new `--letter-rule` token **all three themes set to the same conservative ink** (e.g. `#c9bca2`), so theme accent never tints the letters. |
| Paste output | `generateRichHTML`, `_abaContent`, `_iepLetterContent` | **Zero changes.** Literal hex + `pt`; theme-independent by design (Epic/Word can't resolve CSS vars). The copied note is identical regardless of on-screen theme — correct. |

Verify after porting: switch to each theme and confirm the note dividers stay
solid, the letters stay formal black-on-white, and `Copy Plain`/`Copy Rich`
output is unchanged.

---

## Fonts (self-hosting — the big line item)
The app forbids external network requests, so **no Google Fonts `<link>`**.
- Default theme: system stack — nothing to add.
- Warm: **Fraunces** (display) + **IBM Plex Sans** (UI) + **IBM Plex Mono**.
- Slate: **Newsreader** (display) + **Libre Franklin** (UI). *(Note font is the
  pinned system mono — no webfont mono needed.)*

Steps: download the OFL files, **subset** to the weights actually used (Display
500/600/700; UI 400/500/600/700), convert to woff2, embed as `@font-face` with
base64 `src:url(data:font/woff2;base64,…)` so the single-file app stays
self-contained. Budget: this is the largest size add (~tens–low-hundreds of KB
after subsetting). If file size is a concern, gate it: only Warm/Slate need the
webfonts, but `@font-face` must be declared up front regardless; subsetting is
the mitigation. Add `font-display:swap`.

---

## Responsive behavior
Keep the app's existing `@media (max-width:768px)` block (touch targets already
≥44px there). Add: comfortable targets must win over any Slate desktop density
(Phase 2 concern; Phase 1 doesn't change spacing). Verify the new theme button
wraps gracefully in the mobile `.header-actions` (it already goes
`width:100%; justify-content:flex-end`).

## Accessibility
- Theme button: `aria-label="Switch color theme"`; the visible label
  (`Theme: …`) doubles as the accessible name — fine. Consider
  `aria-live="polite"` on `#themeLabel` so a screen reader announces the change.
- Contrast: prototype values were chosen for AA; **re-verify in-app** at small
  sizes, especially Warm amber-ink on amber-tint and Slate graphite on slate
  paper. The `--gray-400`-class hint color sits near the AA floor — keep it on
  non-essential italic hints only (existing usage).
- Active state never relies on color alone (weight + shape cue) — preserve that
  when porting `.is-on`.
- Focus ring (`--focus-ring`) recolors per theme automatically (it references
  `--accent`); confirm it stays visible on each theme's surface.

---

## Test-lane checklist (run `npm test` — all four must pass)
| Lane | Why it stays green | Watch for |
|---|---|---|
| Golden | snapshots generated *text*, not CSS | If golden text moves, something edited a generator — STOP, investigate. Don't `test:update` to paper over it. |
| Unit | pure decision fns untouched | n/a |
| Wiring | lints class/`.is-on` contract | Don't rename classes. New `[data-theme]` rules are fine. |
| Invariants | parallel lookup-table key sets | Untouched unless you add a theme registry; if so, mirror its keys. |

Optional: add an invariants-style assertion that all three theme blocks define
the same overridden variable names (catches a theme drifting a token).

Also run: `/verify` after the patch, `/code-review` on the diff (per the repo's
cadence), and an in-browser pass on port 3737 switching all three themes ×
all three document tabs.

---

## Build sequence (recommended commits)
1. **Tokens + toggle + fonts (Phase 1 core).** Add `[data-theme]` blocks
   (color/font/shadow/radius revalues onto existing names), `--letter-rule`,
   pin the note font, add the toggle markup+JS+pre-paint script, embed subset
   webfonts. CSS/markup/JS-additive only. `npm test` green; visual-verify.
2. **Calmed animation (if not folded into 1).** Persistent `.is-on` cue +
   one-shot `.just-on`.
3. **Slate structure (Phase 2).** Section-as-rules, density, folio/kicker
   masthead under `[data-theme="slate"]`. Larger visual diff; re-verify.
4. **Pin/regress check (Phase 3).** Confirm all three documents in all three
   themes; `npm run test:golden` byte-identical.

## Open items carried in
- Phase 1 vs Phase 2 split for Slate structure (recommended above) — confirm.
- Font subsetting weights — confirm the weight list before embedding.
- Whether the one-shot animation ships in Phase 1 or Phase 2 (persistent cue is
  the must-have; flourish is optional).
