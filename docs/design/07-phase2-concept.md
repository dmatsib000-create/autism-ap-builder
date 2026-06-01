# Phase 2 Conceptualization — the signature layer

> Output of `/gui-design` + `/design-system`, run to **conceptualize** Phase 2.
> Companion to `01`–`06`. Phase 1 (merged, PR #22) recolored the themes; **Phase 2
> is the per-component signature layer** deferred from Phase 1 — the treatments
> that turn a recolor into a worldview. This is the design intent + component spec.
> The build *sequence* and markup-vs-CSS risk gating belong to `/system-design`
> next; the open items at the bottom are explicitly handed to it.

## What Phase 2 is (one sentence)

Phase 1 made Warm and Slate the current UI **revalued** (same shapes, new colors
and fonts). Phase 2 adds the **signature treatments** — the letterpress/filament
of Warm and the rules/underscore/masthead of Slate — so each theme reads as a
distinct instrument, not a palette swap. Every clinical document stays formal and
the paste output stays byte-identical, exactly as in Phase 1.

## Decisions (locked — from the conceptualization Q&A, 2026-06-01)

1. **Editorial Slate goes full editorial.** Cards → hairline rules, ~25–30%
   density increase, ruled tabular checkbox lists, **and** the folio-numeral +
   vermilion-kicker masthead section header. The complete philosophy, including
   the one markup change the masthead needs.
2. **Warm document sheet = warm paper.** The on-screen note/letter sheet renders
   on `--paper-raised` (`#fffdf7`) so it sits on the warm desk. Frame only — the
   copied-into-Epic text is byte-identical regardless.
3. **Persistent cue only; no one-shot flourish.** The filament/underscore appears
   on selection and stays (CSS-only, zero `render()` risk). The `.just-on`
   warm-up-glow / pencil-draw animation is **not** ported in Phase 2. The
   persistent cue is the load-bearing part (per `06` handoff); the flourish can be
   reconsidered later as an isolated, low-value add.

## The two tiers

Phase 2 has two ambition tiers with very different risk profiles. Both ship.

---

## Tier 1 — Signature cues (CSS-only, test-safe, the must-have)

These attach to classes that **already exist** and are already reapplied from `S`
on every `render()`, so they are a pure CSS addition: no class renames, no markup
change, golden/unit/wiring/invariants stay green.

**Architectural rule that keeps this safe:** the prototype used a helper class
`.sig` to host the `::after` marker. **Do not add `.sig` to the real app.** Attach
the `::after` directly to the existing state selectors
(`.chip.is-on`, `.r-opt.is-on`, `.tab-btn.is-on`). A new class would be a new
wiring-lane contract (must be applied in markup *and* defined in CSS); attaching
to existing `.is-on` selectors avoids that entirely.

### Warm Instrument — "letterpress keys + amber filament"

| Component | Real class | Phase 2 treatment | Mechanism |
|---|---|---|---|
| Buttons | `.btn` (+ variants) | every control is a physical *key* | `box-shadow:var(--key-rest)` at rest; `:active` → `var(--key-press)` + `transform:translateY(.5px)`. Tokens already exist in the Warm block. |
| Chips | `.chip.is-on` | amber **filament** along the bottom edge | `.chip.is-on::after{content:'';position:absolute;left:8px;right:8px;bottom:-1px;height:2px;background:var(--accent);border-radius:2px}` — requires `.chip{position:relative}` (verify it's already relative). |
| Selected chip mark | `.chip.is-on::before` | checkmark `✓` (`\2713`) | keeps Warm's affirmative read. |
| Radio | `.r-opt.is-on` | inset amber ring | `box-shadow:inset 0 0 0 1px var(--accent),var(--key-rest)`. |
| Tabs | `.tab-btn.is-on` | amber filament on the **top** edge | raised-key fill + `::after` filament; makes the active document tab unmistakable. |
| Section numeral | `.sec-head` numeral | **debossed** stamp | `font-family:var(--font-display);text-shadow:var(--emboss)` — reads as pressed into paper. `--emboss` already defined. |

**Signature detail (named):** *the amber filament* — the "live" cue rendered as a
glowing 2px wire on the selected element's edge, not a fill. Proof of craft: it's
a treatment nobody reaches for, and it's what makes Warm feel like an instrument.

### Editorial Slate — "the red pencil: rules, not boxes"

| Component | Real class | Phase 2 treatment | Mechanism |
|---|---|---|---|
| Chips | `.chip.is-on` | neutral graphite tint + bold ink + 2px vermilion **underscore** | `.chip.is-on::after{...left:0;right:0;bottom:-1px;height:2px;background:var(--accent)}` (full-width, unlike Warm's inset filament). |
| Selected chip mark | `.chip.is-on::before` | em-dash `—` (`\2014`) in accent | replaces Warm's checkmark; the editorial "entry" mark. |
| Radio | `.r-opt.is-on` | bold + vermilion underscore + 1px graphite top/left emphasis | underscore via `::after`. |
| Tabs | `.tab-btn.is-on` | newspaper section-nav: bold + 2–3px vermilion underscore, no pill, no shadow | `::after` underscore on the ruled baseline. |
| Buttons | `.btn-blue` (primary) | **solid vermilion fill** (action only) | the locked "underscore = state, solid fill = action" rule. Other variants stay flat + hairline. |
| Toggle | `.tog-sl` | square knob | `border-radius:1px` on track + knob under `[data-theme="slate"]`. |

**Signature detail (named):** *the red-pencil underscore* — vermilion appears
**only** as a 2px rule under live elements; state is carried by weight + rule, so
it survives grayscale and colorblindness. Structure is rules, never boxes.

---

## Tier 2 — Editorial Slate structural transformation (the big move)

This is where Slate stops being "flat colors" and becomes an editorial layout.
Larger visual diff; one genuine markup change. CSS-only *except* the masthead hook.

### Sections become ruled regions, not cards
`[data-theme="slate"] .section` drops the card: `border:none;
border-top:1px solid var(--rule-strong); box-shadow:none; border-radius:0`. The
left panel reads as a ruled document, not a stack of cards. **Largest visual
change** — budget a careful pass on the panel's section rhythm (per `04` §4).

### Density (the "increase density" decision)
Slate runs ~25–30% tighter than the shared default. Phase 1 deliberately **held**
`--space-*` and `--text-*`. Phase 2 tightens them **scoped to the slate
selector** so the default and Warm are untouched. Two candidate mechanisms (a
`/system-design` call):
- **Scoped scale override** — re-point `--space-2…6` (and a display step) under
  `:root[data-theme="slate"]`. Fewest rules, but moves *everything* at once.
- **Per-component padding cuts** — tighten `.section`, `.cb-row`, `.r-opt`,
  `.sec-head` paddings individually under the slate selector. More rules, more
  control, less blast radius.
Guardrail (from `04`): body text stays ≥13px, AA contrast holds; density comes
from spacing + rules, never from shrinking essential text.

### Checkbox lists become ruled tabular rows
`[data-theme="slate"] .cb-list{border-top:1px solid var(--rule)}` +
`.cb-row{border-bottom:1px solid var(--rule);border-radius:0}`. Very editorial;
hover = faint slate wash. ≥44px touch target preserved on mobile (the existing
`max-width:768px` rule must still win over the desktop density).

### The masthead section header (the one markup change)
The signature Slate layout: a hanging **folio numeral** (Newsreader, narrow left
margin) + a stacked **vermilion kicker** (tiny tracked uppercase) over the
**Newsreader title**. The kicker needs a markup hook the current `.sec-head`
doesn't have — in the prototype it's `<span class="sec-kicker">Diagnosis</span>`
above `<span class="sec-title">`. This is the **only part of Phase 2 that touches
markup**, so it's the part `/system-design` must gate:
- Confirm `.sec-head` markup is static (not generated by `generateNote()` — it
  isn't; section headers are page chrome, not note output), so golden is unaffected.
- Adding `.sec-kicker` / `.sec-title` spans + showing the kicker only under
  `[data-theme="slate"]` (`display:none` by default, `display:block` in slate) is
  a wiring-lane concern: any new class needs both a CSS rule and a markup use —
  both are satisfied if added together.

## Warm paper sheet (decision 2)
The on-screen document sheet's container background becomes `--paper-raised`
(`#fffdf7`, already set in the Warm block) so the note/letter sits on warm paper.
This is **frame only** — `.note-content` stays the pinned system monospace,
`.aba-doc`/`.aba-sec` stay formal serif with `--letter-ink` pinned, and the paste
output is literal hex (untouched). `/system-design` pins the exact sheet-container
selector and confirms it does not bleed into the preserved interiors.

## What Phase 2 explicitly does NOT do
- **No `.just-on` flourish** (decision 3). No JS animation hooks in `render()`.
- **No clinical-logic changes.** `generateNote()` text stays byte-identical;
  golden must not move. If it moves, something is wrong — investigate, don't
  `test:update`.
- **No paste-output changes.** `generateRichHTML` / `_abaContent` /
  `_iepLetterContent` are untouched.
- **No new fonts.** All four faces shipped in Phase 1.

## Test-lane impact (the conceptual read; `/system-design` confirms)
| Lane | Tier 1 cues | Tier 2 Slate structure | Warm sheet |
|---|---|---|---|
| Golden (note text) | none (CSS-only) | none, *if* masthead markup is page chrome not note output (it is) | none |
| Unit | none | none | none |
| Wiring (class/state) | none (attaches to existing `.is-on`) | **the masthead** adds `.sec-kicker`/`.sec-title` — add CSS + markup together | none |
| Invariants | none | none | none |

The only lane Phase 2 can move is **wiring**, and only via the masthead's new
classes — which pass as long as the rule and the markup land in the same commit.

## Open items handed to `/system-design`
1. **Density mechanism:** scoped scale override vs. per-component padding cuts.
2. **Masthead markup:** exact `.sec-head` restructure + which spans, confirmed
   non-generated; the kicker's per-section label source.
3. **Build sequence / commit split:** recommend Tier 1 (both themes, CSS-only)
   first as one low-risk commit, then Slate structure as a second, larger commit
   with its own visual-verify, then a pin/regress check (all three documents in
   all three themes; `npm run test:golden` byte-identical). Matches `06` §"Build
   sequence" 2→3→4.
4. **`.chip{position:relative}` precondition** for the `::after` markers — verify
   present (or add it once, globally, harmlessly).
5. **Warm sheet selector** — pin the exact container; confirm no interior bleed.

## Signature details, named (gui-design "proof of craft")
- **Warm:** the amber filament — the live edge lit as a wire, not a wash.
- **Slate:** the red-pencil underscore — structure carried entirely by rules.
