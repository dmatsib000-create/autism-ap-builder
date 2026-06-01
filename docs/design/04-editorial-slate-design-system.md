# Design System — "Editorial Slate"

> Companion to `03-editorial-slate-philosophy.md`. Token + component spec for the
> Editorial Slate direction. The **current-system audit**, the **off-limits
> clinical-document boundary**, and the **test-aware implementation roadmap** are
> identical to the Warm Instrument spec — see `02-design-system.md` §1, §4, §5
> rather than repeating them. This file gives the Editorial Slate **tokens**,
> **component specs**, and **signature**.

---

## 1. The core move

Same as Warm Instrument: the current `:root` is already a real token system, so
this is a **revalue + add fonts**, not a rebuild. Keep variable names and class
names; change values. The two directions are therefore the *same* low-risk
Phase-1 swap with different values — you could even ship them as two selectable
themes off one set of variables if you ever wanted.

The defining difference from Warm Instrument: **structure is hairline rules, not
cards + shadows.** So beyond recoloring, Editorial Slate also *removes* most
`box-shadow` and `border-radius` and leans on `border` rules. That is still
CSS-only and still class-name-stable.

---

## 2. Proposed tokens (Editorial Slate)

```css
:root{
  /* ---- Surfaces: cool paper; pure white reserved for the document sheet ---- */
  --paper-0:#ececea;   /* app shell / desk */
  --paper-1:#f6f6f4;   /* left panel */
  --paper-2:#fcfcfb;   /* control/field surface */
  --paper-3:#ffffff;   /* the document sheet ONLY */
  --surface:var(--paper-1); --bg-card:var(--paper-2); --bg-elevated:#fff;

  /* ---- Ink: graphite ---- */
  --ink-900:#191b1f; --ink-700:#2c2f35; --ink-500:#5a5f68; --ink-400:#878d97;
  /* map legacy grays onto the slate scale */
  --gray-900:#15171a; --gray-800:#191b1f; --gray-700:#2c2f35; --gray-600:#454a52;
  --gray-500:#5a5f68; --gray-400:#878d97; --gray-300:#bcbcb6; --gray-200:#dcdcd8;
  --gray-100:#ececea; --gray-50:#f4f4f2;

  /* ---- Accent: editorial vermilion (the red pencil) — used ONLY as a rule ---- */
  --red:#c8362a; --red-deep:#9c241a; --red-tint:#f6ded9; --red-ink:#86201a;
  /* repoint brand/accent at vermilion so var(--accent) consumers recolor */
  --blue:#c8362a; --blue-light:#f6ded9; --blue-dark:#9c241a;
  --accent:var(--red); --accent-soft:var(--red-tint); --accent-hover:var(--red-deep);

  /* ---- Rules: the structural primitive ---- */
  --rule:#dcdcd8; --rule-strong:#bcbcb6; --rule-heavy:#2c2f35;
  --border-subtle:#e6e6e2; --border-default:var(--rule); --border-strong:var(--rule-strong);

  /* ---- Semantic clinical signal (muted, earth-toned, distinct, AA) ---- */
  --green:#4a6b43; --green-light:#e4ebe0; --green-dark:#314a2c;  /* complete / typical */
  /* warnings use the vermilion family; criteria-error uses a deeper brick */
  --amber:#9a6b12; --amber-light:#f1e6cf; --amber-dark:#6b480a;
  --red-sem:#a8302a; --red-sem-light:#f2dad7; --red-sem-dark:#7a201b;

  /* ---- Type ---- */
  --font-display:'Newsreader',Georgia,'Times New Roman',serif;
  --font:'Libre Franklin',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-mono:'Spline Sans Mono','IBM Plex Mono','Courier New',monospace;
  --font-serif:Georgia,'Times New Roman',Charter,serif;  /* LETTERS — keep formal */
  /* type scale unchanged: --text-9 … --text-15 */

  /* ---- Radii: editorial = near-square ---- */
  --radius-sm:0; --radius:2px; --radius-md:2px; --radius-lg:3px; --radius-pill:2px;

  /* ---- Shadows: essentially none; the document sheet gets ONE soft shadow ---- */
  --shadow-sm:none; --shadow:none; --shadow-md:none;
  --shadow-lg:0 10px 30px rgba(25,27,31,.10),0 2px 6px rgba(25,27,31,.06);
  --shadow-card:none;

  /* ---- Motion ---- */
  --dur-fast:110ms; --dur:150ms; --dur-slow:220ms; --ease:cubic-bezier(.2,.7,.2,1);

  /* ---- Focus: vermilion keyboard ring ---- */
  --focus-ring:0 0 0 2px var(--paper-2),0 0 0 4px color-mix(in srgb,var(--red) 65%,transparent);
}
```

**Accessibility notes (verify at build):**
- Vermilion is an **accent rule + small label**, almost never a text color over
  paper. Where it is text (`--red-ink` #86201a on `--paper-2`) contrast ≈ 7:1.
- Graphite body `--ink-700` on `--paper-2` ≈ 11:1; labels `--ink-500` ≈ 5.5:1.
- Active state is conveyed by **bold weight + the underscore rule**, not color
  alone, so it survives colorblindness and grayscale printing.
- Keep `@media (prefers-reduced-motion)`; the underscore must appear instantly
  (no draw animation) under it.

---

## 3. Component specs

Same class names + `.is-on` contract as today (wiring lane enforces it). The
recurring move: **flat, ruled, with a vermilion underscore for "live."** A
*solid* vermilion fill is reserved for primary action buttons only — the rule of
thumb is **underscore = state, solid fill = action.**

**Density (decided):** this direction runs deliberately tighter than today —
component paddings cut ~25–30%, checkbox lists become ruled tabular rows, section
headers and field labels lose vertical air, and display sizes shrink a step. Keep
body text ≥13px and AA contrast intact; density comes from spacing and rules, not
from shrinking essential text. The prototype reflects this.

### Button — `.btn` (+ variants, `.btn-sm`)
Flat, square-ish, hairline-bordered. No shadow.
| Variant | Rest | Hover | Active |
|---------|------|-------|--------|
| Primary (`.btn-blue`→solid vermilion) | `--red` fill, paper text | `--red-deep` | inset darken |
| Neutral (`.btn-gray`) | `--paper-2`, graphite, hairline | rule → graphite | inset |
| Ghost (`.btn-outline`) | transparent, hairline | faint vermilion underscore | inset |
| Danger (`.btn-danger`) | transparent, brick text/border | red-sem wash | inset |

### Chip — `.chip` (+ variants, `.is-on`)
Square-ish, hairline border, flat. `.is-on` = subtle graphite tint + **bold ink +
2px vermilion red-pencil underscore** (drawn on activation). No pill rounding, no
fill-shout. Variant tints repoint `--chip-tint*` as today.

### Radio option — `.r-opt` (`.is-on`)
Hairline-bordered rectangle. `.is-on` = bold + vermilion underscore + a 1px
graphite top/left emphasis. Native input hidden (unchanged).

### Checkbox row — `.cb-row`
**Ruled tabular list**: each row separated by a hairline rule (very editorial).
Row hover = faint slate wash. Native box `accent-color:var(--red)`. ≥44px touch
target on mobile preserved.

### Section / accordion — `.section`, `.sec-head`, `.sec-body`
**No card.** A section is a ruled region on `--paper-1`: a top hairline rule, a
header, content. Header is a grid: a hanging **folio numeral** (Newsreader, in a
narrow left margin) + a stacked **vermilion kicker** (tiny tracked uppercase) over
a **Newsreader title**. Chevron rotates on `.collapsed`. This is the signature
layout move.

### Tabs — `.tab-btn` (`.is-on`), the document section-nav
Reads like newspaper section navigation: flat, serif-or-tracked-sans labels on a
ruled baseline. `.is-on` = bold + a **2px vermilion underscore** (the active
section marker). No filled pill, no shadow.

### Toggle — `.tog` / `.tog-sl`
Flat track, near-square knob. Off = `--rule-strong`; on = `--red`. Restrained.

### Pills (semantic) — `.pathway-pill`, `.ov-pill`, `.plan-pill`, `.dsm-cde-chip`, status
Flat **tags**, not rounded pills: hairline border + small-caps label + a colored
left rule carrying the hue. Keep per-variant classes; revalue to the muted
earth set. Each keeps its text label (colorblind-safe).

### Sticky copy bar — `.note-sticky-bar`
Flat, hairline top rule, right-aligned flat buttons. Frame only.

---

## 4. Off-limits & roadmap

**Unchanged from `02-design-system.md` §4 (off-limits) and §5 (roadmap).** The
clinical documents stay plain/formal; `.aba-sec` is pinned to a conservative
graphite rule (here `#2c2f35` on `#bcbcb6`), not the vermilion accent; the
`{placeholder}` yellow highlight is kept; the paste templates are untouched. The
phased rollout (0 prototype → 1 token revalue → 2 component polish → 3 pin docs →
4 optional structural) and its test-lane reasoning apply identically.

One extra Phase-2 note specific to this direction: removing `box-shadow`/
`border-radius` is a CSS-only revalue, but visually larger than Warm Instrument's
— budget a careful visual-verify pass on the left panel's section rhythm once the
cards become rules.

---

## 5. Signature detail (recap)
**The red-pencil underscore + rules instead of boxes.** Vermilion appears only as
a left-to-right-drawn 2px rule under live elements; structure is hairline rules;
section headers use a vermilion kicker + Newsreader title + hanging folio.

## 6. Decisions & open questions

**Decided:**
- **Density — increase it.** Genuinely higher on-screen density (see §3). Density
  from spacing + rules, not from shrinking essential text; body ≥13px, AA holds.
- **Accent — solid red allowed when logical.** Vermilion underscore = state;
  solid vermilion fill = primary/affirmative action (Copy / generate buttons).

**Still open:**
1. **Display serif:** Newsreader (recommended, news-native) vs. a higher-contrast
   masthead serif (e.g. a didone) for more drama?
2. **vs. Warm Instrument:** deliberately opposite directions sharing one variable
   set. Take one to Phase 1, or keep both as selectable themes?
