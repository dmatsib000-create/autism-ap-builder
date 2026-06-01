# Theming Plan — three switchable themes

> Decision from the design-critique pass: ship the two new directions as
> **opt-in themes** alongside the existing look, with the current blue design as
> the **default**. Companion to `01`–`04`. This doc is the implementation spec;
> nothing here is built in the live app yet.

## Decisions (locked)
- **Three themes:** `Current` (the existing blue UI) · `Warm Instrument` · `Editorial Slate`.
- **Default:** `Current` (blue). Nothing changes for existing users unless they opt in. A new default can be promoted later once a theme is proven in use.
- **Toggle:** a small **header cycle button** — Current → Warm → Slate → Current — persisted to `localStorage`.
- **Persistence is PHI-safe:** the only stored value is a theme name string. No patient data. Consistent with the tool's no-PHI constraint.

## Why this is low-risk
Both new directions were authored against the *existing* `:root` variable
names and the *existing* class/`.is-on` contract. So theming is:
1. a set of **alternate variable blocks** (pure values), plus
2. a few **structure overrides** gated to one theme (Editorial Slate flattens
   shadows/radii and rules its lists), plus
3. one **toggle control** + 3 lines of JS.

All CSS-only and class-name-stable ⇒ **no impact on the golden, unit, wiring, or
invariants lanes** (golden snapshots generated *text*; wiring lints *class
names*, which don't change). The wiring lane may even gain a cheap new assertion
(below).

## Architecture

```css
/* :root = DEFAULT theme (current blue). Unchanged from today. */
:root { --accent:#1e50d2; /* …all existing tokens… */ }

/* Opt-in themes override the SAME variable names. */
:root[data-theme="warm"]  { /* Warm Instrument token block from 02-design-system.md §2 */ }
:root[data-theme="slate"] { /* Editorial Slate token block from 04-…  §2 */ }

/* Editorial Slate also needs a handful of STRUCTURE overrides (not just colors):
   flatten cards to rules, square the radii, rule the checkbox list. Gate them. */
:root[data-theme="slate"] .section { border:none; border-top:1px solid var(--rule-strong); box-shadow:none; border-radius:0 }
:root[data-theme="slate"] .cb-list { border-top:1px solid var(--rule) }
:root[data-theme="slate"] .cb-row  { border-bottom:1px solid var(--rule); border-radius:0 }
/* …etc. Keep this block small and clearly commented as theme-scoped. */
```

```html
<!-- Header control -->
<button id="themeBtn" class="btn btn-sm" onclick="cycleTheme()" title="Switch theme">
  <span id="themeLabel">Theme: Default</span>
</button>
```

```js
// Theme cycle — UI preference only, no PHI. Applied to <html> so CSS var
// cascade reaches everything including generated-document FRAMES (not interiors).
const THEMES = [
  { id:'',      label:'Default' },     // current blue; absent data-theme attr
  { id:'warm',  label:'Warm Instrument' },
  { id:'slate', label:'Editorial Slate' },
];
function applyTheme(id){
  if(id) document.documentElement.setAttribute('data-theme', id);
  else   document.documentElement.removeAttribute('data-theme');
  const t = THEMES.find(t=>t.id===id) || THEMES[0];
  document.getElementById('themeLabel').textContent = 'Theme: ' + t.label;
  try { localStorage.setItem('apTheme', id); } catch(e){} // private-mode safe
}
function cycleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || '';
  const i = THEMES.findIndex(t=>t.id===cur);
  applyTheme(THEMES[(i+1)%THEMES.length].id);
}
// On load — restore saved choice; default to '' (current) if none/blocked.
(function(){ let saved=''; try{ saved=localStorage.getItem('apTheme')||''; }catch(e){} applyTheme(saved); })();
```

## Hard boundary still holds
Theming recolors the **chrome and the document FRAME only**. The generated
clinical documents stay plain/formal in every theme:
- `.note-content` / `.note-doc` (A&P note) — mono, box-drawing dividers, ink body.
- `.aba-doc` / `.aba-sec` / `.iep-ph` (ABA + IEP letters) — formal serif, black
  ink, `.aba-sec` **pinned to a conservative graphite that does NOT inherit the
  theme accent** (critical: otherwise Warm flips it amber, Slate flips it
  vermilion). Pin it with a literal in each theme or a dedicated
  `--letter-rule` token that all three themes set to the same conservative ink.
- Paste output (`generateRichHTML`, `_abaContent`, `_iepLetterContent`) — the
  hardcoded hex/`pt` literals are theme-independent by design (Epic/Word can't
  resolve CSS vars). **Unchanged in all themes.** The copied note looks identical
  no matter which theme is on screen — which is exactly correct.

## Pre-ship fixes (from the critique)
Items 1–4 are **resolved in the prototypes** (`prototype.html`,
`prototype-editorial-slate.html`); carry the same patterns into the real app's
theme blocks. Item 5 still needs an in-browser check.

1. **Editorial Slate "on" cues — DONE.** Selected chip now adds a neutral
   graphite tint + bold ink + a *persistent* red-pencil underscore + em-dash
   (additive, scannable). Selected radio gains a graphite tint + a 3px left
   vermilion tick. No longer relies on subtraction.
2. **Calm the active animation (both) — DONE.** The state cue (underscore /
   amber filament) now **persists** while `.is-on` with no animation; the
   draw/glow fires once via a one-shot `.just-on` class added on genuine
   activation and removed on `animationend`. Rapid toggling never replays a
   backlog. (Replaces the old `style.animation` reflow hack.)
3. **Accent ↔ semantic collision — DONE.** "Suspected" pathway pill pulled off
   the brand accent: Warm → a deeper `--clay`; Slate → a muted `--amber`. Both
   stay distinct from the active-state accent; the text label still carries
   meaning.
4. **Mobile touch targets — DONE.** Both prototypes restore ≥44px `.cb-row` /
   ≥42px `.r-opt` (and larger toggles on Slate) inside the `max-width:768px`
   query, overriding the denser desktop padding.
5. **Mono dividers — DONE.** Root cause was theming the note's font per theme:
   Spline Sans Mono (Slate) lacks full box-drawing glyphs, so `─`/`═` fell back
   to dashed/gappy lines. Fix: the A&P note (`.note-content`) is pinned to a
   **system** monospace stack with solid box-drawing coverage
   (`Consolas,'Menlo','DejaVu Sans Mono','Liberation Mono','Courier New',monospace`),
   identical in all three themes. The note is a preserved formal document, so a
   fixed, theme-independent mono is also more correct. The `─`/`═` **characters
   are unchanged** (they copy into Epic verbatim; a CSS rule can't replace them).
   System fonts ⇒ nothing extra to self-host for the note.

## Fonts
All three themes need their fonts **self-hosted/inlined**, not pulled from
Google Fonts — the app's no-external-network constraint forbids the `<link>`.
Default theme uses the system stack (no new fonts). Warm adds Fraunces + IBM
Plex Sans/Mono; Slate adds Newsreader + Libre Franklin + a mono. Subset to the
weights used and embed as `@font-face` with base64 or local files. This is the
single largest line-item in the migration (file size); budget for it in Phase 1.

## Rollout (test-aware)
| Phase | Work | Tests |
|-------|------|-------|
| **0** | Combined switchable **prototype** (one HTML, header cycle button, all 3 themes) to validate the toggle + boundary in one place. | none (separate file) |
| **1** | Add the two `[data-theme]` token blocks + structure-override block + toggle + font `@font-face` to the real app. Default path = `:root` untouched. | full `npm test` (CSS-only ⇒ all green); visual-verify each theme on port 3737. |
| **2** | Apply the 5 pre-ship fixes to the theme blocks. | wiring lane green; visual-verify. |
| **3** | Pin `.aba-sec` / letter accents per theme; **eyeball all three generated documents in each theme** and confirm `npm run test:golden` text is byte-identical. | golden + manual doc review. |
| **opt** | Optional: a tiny wiring-lane assertion that every theme block defines the same variable names (parallel-table invariant, fits the existing invariants-lane philosophy). | invariants lane. |

## Open question
- **Display serif for Slate:** Newsreader (recommended) vs. a higher-contrast
  masthead serif. Independent of the theming work; decide before Phase 1 font
  subsetting so we only embed one.
