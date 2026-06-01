# Design System — "Warm Instrument"

> Phase 2 companion to `01-design-philosophy.md` (design-system skill). This is
> the token + component spec that turns the philosophy into buildable rules,
> plus an audit of the current system and a test-aware implementation roadmap.
>
> **Scope reminder:** this restyles the app chrome. The generated clinical
> documents (A&P note, ABA/IEP letters) and the paste templates stay in their
> plain formal format — see the "Off-limits" section.

---

## 1. Audit of the current system

The current `:root` (lines ~11–83 of `autism-ap-builder.html`) is already a
real, disciplined token system — colors, spacing, type scale, radii, shadows,
motion, focus ring are all variables with thoughtful inline rationale. The
overhaul is therefore mostly a **revalue**, not a rebuild: we keep the variable
*names* and *structure* and change the *values*. That is the single biggest
reason this can ship low-risk (see roadmap).

| Category | Current state | Verdict |
|----------|---------------|---------|
| Color | `--blue` brand + cool gray scale (`--gray-50…900`) + semantic amber/red/green; surface `#eef1f6`, cards `#fff` | **Revalue.** Cool + generic "professional SaaS." Becomes warm paper/ink/amber. |
| Typography | System sans (`-apple-system…`) + Georgia serif fallback; px scale with intentional half-px steps | **Revalue + add faces.** Add Fraunces / IBM Plex Sans / IBM Plex Mono. Keep the scale. |
| Spacing | `--space-1…9` (4–24px), 4px rhythm, ~90% coverage | **Keep as-is.** Already good. |
| Radii | `--radius-sm…lg` 4/6/8/12 + pill | **Revalue down** slightly (3/5/7/10) for a "machined" feel. |
| Shadows | calm cool-gray layered shadows | **Revalue.** Warm-tinted + new tactile "key" inset shadows (signature). |
| Motion | `--dur-fast/dur/slow` + one easing; `prefers-reduced-motion` handled | **Keep**, nudge durations. |
| Focus | high-contrast keyboard ring via `--focus-ring` | **Keep**, recolor to amber. |
| Component classes | large, coherent inventory; chip primitive + `.is-on` unification already done; wiring-lane guards the class contract | **Keep all class names.** Restyle only. Renames cost test updates — avoid. |

**Hardcoded-value hotspots to respect (do not "fix" blindly):**
the JS paste templates (`generateRichHTML`, `_abaContent`, `_iepLetterContent`)
carry literal hex and `pt` units on purpose (Epic/Word can't resolve CSS
vars). The document surfaces use `pt`, not `px`. Leave both alone.

---

## 2. Proposed tokens (Warm Instrument)

Drop-in replacements for the existing `:root` values. **Names preserved where
they exist** so nothing downstream breaks; new names are additive.

```css
:root {
  /* ---- Surfaces: warm paper, lit from above ---- */
  --paper-desk:   #e6ddc9;  /* app shell behind panels — "the desk" */
  --paper-panel:  #f3ecdc;  /* left form-panel background */
  --paper-card:   #fbf6ea;  /* section cards & controls at rest */
  --paper-raised: #fffdf7;  /* popovers, the document "sheet" */
  /* map legacy names onto the new surfaces */
  --surface:    var(--paper-panel);
  --bg-card:    var(--paper-card);
  --bg-elevated:var(--paper-raised);

  /* ---- Ink: warm near-black ---- */
  --ink-900:#2a251d; --ink-700:#41392d; --ink-500:#6c6253; --ink-400:#938876;
  /* map legacy gray scale onto warm inks/lines (so existing rules recolor) */
  --gray-900:#211d16; --gray-800:#2a251d; --gray-700:#41392d; --gray-600:#564c3d;
  --gray-500:#6c6253; --gray-400:#938876; --gray-300:#c9bca2; --gray-200:#ddd2bd;
  --gray-100:#efe7d6; --gray-50:#f6f0e2;

  /* ---- Amber: the single active accent ---- */
  --amber:      #bf6a1e;  /* active fills, borders, the filament */
  --amber-deep: #9a5212;  /* hover / pressed / amber-on-tint hover */
  --amber-tint: #f4e2c4;  /* active backgrounds */
  --amber-ink:  #7a3d0a;  /* text on amber-tint (>=7:1, AA/AAA) */
  /* repoint brand/accent at amber so all `var(--accent)` consumers recolor */
  --blue:#bf6a1e; --blue-light:#f4e2c4; --blue-dark:#9a5212; /* legacy aliases */
  --accent:var(--amber); --accent-soft:var(--amber-tint); --accent-hover:var(--amber-deep);

  /* ---- Hairlines ---- */
  --line:#ddd2bd; --line-strong:#c9bca2;
  --border-subtle:#e7ddc8; --border-default:var(--line); --border-strong:var(--line-strong);

  /* ---- Semantic clinical signal (warm-shifted, still distinct + AA) ---- */
  --green:#5d7a3a; --green-light:#e6ecd4; --green-dark:#3c5021;  /* complete / typical */
  --red:#a8432b;   --red-light:#f3dcd2;   --red-dark:#7a2c19;    /* criteria warning */
  /* note: amber is the brand AND the "suspected/caution" semantic — intended */

  /* ---- Type ---- */
  --font-display:'Fraunces',Georgia,'Times New Roman',serif;
  --font:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-mono:'IBM Plex Mono','Courier New',Courier,monospace;
  --font-serif:Georgia,'Times New Roman',Charter,serif;  /* LETTERS — keep formal, unchanged */
  /* type scale unchanged: --text-9 … --text-15 */

  /* ---- Radii: machined, modest ---- */
  --radius-sm:3px; --radius:5px; --radius-md:7px; --radius-lg:10px; --radius-pill:999px;

  /* ---- Shadows: warm-tinted + tactile "key" insets (SIGNATURE) ---- */
  --shadow-sm:0 1px 2px rgba(80,60,25,.10);
  --shadow:0 1px 3px rgba(80,60,25,.12),0 1px 2px rgba(80,60,25,.08);
  --shadow-md:0 2px 6px rgba(80,60,25,.12),0 1px 3px rgba(80,60,25,.08);
  --shadow-lg:0 12px 30px rgba(70,50,20,.16),0 3px 8px rgba(70,50,20,.10);
  --shadow-card:var(--shadow);
  --key-rest:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(120,90,40,.08),0 1px 1.5px rgba(80,60,25,.14);
  --key-press:inset 0 1px 2px rgba(90,65,25,.22);
  --emboss:0 1px 0 rgba(255,255,255,.75);  /* debossed numerals/labels */

  /* ---- Motion ---- */
  --dur-fast:110ms; --dur:160ms; --dur-slow:240ms;
  --ease:cubic-bezier(.2,.7,.2,1);

  /* ---- Focus: amber keyboard ring ---- */
  --focus-ring:0 0 0 2px var(--paper-card),0 0 0 4px color-mix(in srgb,var(--amber) 70%,transparent);
}
```

**Accessibility notes (verify on implementation, not assumed):**
- Active controls use **amber-tint fill + amber-ink text** (≈7:1) rather than
  white-on-amber, which would fail AA at small sizes. Do not invert this.
- Body ink `--ink-700` on `--paper-card` ≈ 9:1. Labels `--ink-500` ≈ 5:1. Hints
  `--ink-400` on `--paper-card` ≈ 3.5:1 — acceptable only at ≥12px/non-essential
  (matches the existing `.phi-hint` usage; do not demote essential text to it).
- Keep the existing `@media (prefers-reduced-motion)` block; the filament glow
  must collapse to an instant state change under it.

---

## 3. Component specs

Each keeps its **existing class name and `.is-on` state contract** (the wiring
lane enforces this). Only visuals change.

### Button — `.btn` (+ `.btn-blue/white/outline/gray/green/danger/epic`, `.btn-sm`)
| Variant | Role | Rest | Hover | Active |
|---------|------|------|-------|--------|
| Primary (`.btn-blue`→amber) | the one main action | amber fill, white text, `--key-rest` | `--amber-deep` | depress: `--key-press` + `translateY(.5px)` |
| Neutral (`.btn-gray`) | secondary | paper-card, ink-700, hairline | darker paper | depress |
| Ghost (`.btn-outline`) | tertiary on dark header | transparent, hairline | faint amber wash | depress |
| Danger (`.btn-danger`) | destructive | transparent, brick-red text/border | red wash | depress |

All buttons are "keys": `--key-rest` at rest, `--key-press` on `:active`.
Transition `background/box-shadow var(--dur)`, transform `var(--dur-fast)`.

### Chip — `.chip` (+ `.chip--sm/--check/--ring/--success`, state `.is-on`)
The selection primitive. Uses the existing `--chip-tint*` custom-prop hooks.
| State | Visual |
|-------|--------|
| Default | paper-card, 1.5px hairline border, ink-700, `--key-rest` |
| Hover | border → `--line-strong`, slight paper lift |
| `.is-on` | `--chip-tint-soft` (amber-tint) fill, `--chip-tint-strong` (amber-ink) text, `--chip-tint` border, **amber filament** bottom edge + one-shot glow |
| Focus-visible | `--focus-ring` |
Variant tints (`--success`) just repoint `--chip-tint*` — keep that mechanism.

### Radio option — `.r-opt` (state `.is-on`)
Same key treatment as chip but rectangular. `.is-on` → amber-tint fill, amber
border, `inset 0 0 0 1px var(--amber)` ring, weight 500. Native input hidden
(unchanged).

### Checkbox row — `.cb-row`
Row hover gets a faint paper wash (`--paper-card` → slightly warmer). The native
box keeps `accent-color:var(--amber)`. Touch target ≥44px on mobile (existing
rule preserved). Min ink contrast on the label maintained.

### Section / accordion — `.section`, `.sec-head`, `.sec-body`
Card = `--paper-card` on the `--paper-panel` desk, hairline border, `--shadow-sm`.
`:focus-within` raises to `--shadow-md`. **Section numeral is the signature
deboss**: the leading `N —` in `.sec-head` rendered in `--font-display` with
`text-shadow:var(--emboss)` so it reads as stamped into the paper. Header is
uppercase tracked Plex Sans; chevron rotates on `.collapsed`.

### Tabs — `.tab-btn` (state `.is-on`), output switcher
Rest: transparent, ink-500, pill. `.is-on`: `--paper-raised` fill, amber-ink
text, `--key-rest`, **amber filament** top edge. This is the "which document am
I looking at" control — the filament makes the active document unmistakable.

### Toggle — `.tog` / `.tog-sl`
Track `--line-strong` off / `--amber` on; knob `--paper-raised` with a hairline,
slides on `--dur`. Reads as a real switch.

### Pills (semantic) — `.pathway-pill`, `.ov-pill`, `.plan-pill`, `.dsm-cde-chip`, status
These carry **meaning + a text label** (colorblind-safe) so they keep distinct
hues, warm-shifted to the palette and documented as a fixed semantic set:
| Pill state | Hue family |
|------------|-----------|
| confirmed | warm slate-indigo |
| suspected | amber |
| BIF | plum |
| typical / complete | olive-green |
| warning / incomplete | brick-red |
Keep the existing per-variant classes; only revalue their colors.

### Sticky copy bar — `.note-sticky-bar`
Sits on `--paper-raised`, hairline top border, right-aligned key-style buttons.
The frame for the document — never overlaps the document text.

---

## 4. Off-limits — preserved clinical document format

**Do not apply Warm Instrument styling to the interior of these.** Style only
the *frame* (the preview pane, the paper sheet, tabs, copy bar).

| Surface | Class(es) | Keep |
|---------|-----------|------|
| A&P note (plain) | `.note-content` | **Pin to a system box-drawing-safe monospace** (`Consolas,'Menlo','DejaVu Sans Mono','Liberation Mono','Courier New',monospace`), the SAME in every theme — do NOT route it through the themed `--font-mono`, because webfont monos (e.g. Spline Sans Mono) lack full box-drawing glyphs and the `─`/`═` dividers fall back to dashed/gappy lines. `pre-wrap`, dividers intact, ink body, no app color, no decorative chrome on the text. |
| A&P note (rich) | `.note-doc`, `.note-ok`, `.note-err` | Plain clinical note. The ok/err banners may adopt the warm semantic greens/reds but stay restrained. |
| ABA + IEP letters | `.aba-doc`, `.aba-sec`, `.aba-sig`, `.aba-ref`, `.aba-caveat` | Formal business letter: `--font-serif` (Georgia) **unchanged**, black ink (`#1a1a2e`), left-aligned, 720px column. |
| Letter section header accent | `.aba-sec` | **Pin to a conservative dark ink**, NOT the amber brand. Today it uses `--blue-dark/--blue-light`; after the global revalue those become amber — so give `.aba-sec` its own pinned literal (e.g. `#2b2620` text / `#d9cfbd` rule) so letters stay formal regardless of theme. |
| `{placeholder}` highlight | `.iep-ph`, `.aba-ph` | Keep the pale-yellow highlight (`#fef9c3`) so the clinician sees fill-in fields; print/reviewer-eye flatten rules preserved. |
| Paste output | `generateRichHTML`, `_abaContent`, `_iepLetterContent` | **Zero changes.** Literal hex + `pt`, because Epic/Word can't resolve CSS vars. |

The one nuance worth a decision: the on-screen document *sheet* can become warm
paper (`--paper-raised`) so it sits beautifully on the desk — that's frame, not
interior, and the copied text is unaffected. If you'd rather the sheet stay
pure white to match how it prints, that's a one-line choice at implementation.

---

## 5. Implementation roadmap (test-aware)

The repo has four test lanes (golden / unit / wiring / invariants). Golden
snapshots generated **text**, not CSS; wiring lints the **class/state
contract**; invariants lint **lookup-table key sets**. Implication: **pure-CSS
revalues and font additions touch none of them.** Class renames and
markup changes do.

| Phase | Work | Risk | Tests |
|-------|------|------|-------|
| **0** | Standalone prototype (`prototype.html`) — this deliverable. Approve the look. | none (separate file) | n/a |
| **1** | **Token revalue.** Replace `:root` values per §2; add the Google Fonts `<link>`. No class/markup changes. | low | all four lanes still green (CSS-only). Run `npm test` to confirm. Visual-verify via preview server (port 3737). |
| **2** | **Component polish.** Add the signature treatments (letterpress `--key-rest`/`--key-press`, embossed numerals, amber filament) to `.chip/.r-opt/.cb-row/.tab-btn/.btn/.section`. CSS-only; class names unchanged. | low–med | wiring lane confirms class contract intact; golden unchanged; visual-verify. |
| **3** | **Pin document surfaces.** Give `.aba-sec` (and any letter-internal accent) pinned conservative literals so the letters stay formal after the global amber revalue. Confirm `.note-content`/`.note-doc`/`.aba-doc` interiors are visually unchanged except the (optional) paper sheet. | med | **Eyeball each generated document** (A&P, ABA, IEP) in the preview; `npm run test:golden` (text must be byte-identical). |
| **4** | **Optional structural polish.** Header redesign, panel spacing, mobile nav. Any class rename → update `tests/wiring.mjs` in the *same commit*. Any markup change near generators → re-run golden + eyeball. | med–high | full `npm test`; `/verify`; `/code-review` for the diff. |

**Guardrails carried from `CLAUDE.md`:**
- No smart/curly quotes in JS string literals.
- Keep the `─`/`═` box-drawing dividers in note output.
- No em dashes in generated note prose (headers OK).
- Update `docs/references.md` only if citations change (this work doesn't).
- This work touches no clinical decision logic — golden text must not move. If
  it does, something is wrong; investigate before running `test:update`.

---

## 6. Open questions for the maintainer
1. **Document sheet:** warm paper (`--paper-raised`) or stay pure white to match
   print? (Frame-only either way; copied text unaffected.)
2. **Display face:** Fraunces (recommended — warm, characterful) vs. staying
   within the IBM Plex superfamily (Plex Serif) for maximum cohesion?
3. **Header:** keep the current gradient bar (recolored amber→too loud?) or
   move to a flat warm-paper header with a debossed wordmark? (Prototype shows
   the flat option.)
4. **Phase 4 appetite:** stop after Phase 3 (pure revalue + polish, near-zero
   risk) or proceed into structural/markup changes?
