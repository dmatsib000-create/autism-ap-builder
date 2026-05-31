# Design Philosophy — "Warm Instrument"

> Phase 1 of the design overhaul (gui-design skill). This document is the
> aesthetic worldview the whole redesign answers to. It governs the **app
> chrome only** — the controls, panels, header, tabs, and the *frame* around
> the generated documents. It explicitly does **not** restyle the generated
> clinical documents themselves (A&P note, ABA letter, IEP letter), which stay
> in their plain, formal, copy-into-Epic format. See §"What this philosophy
> does NOT touch" at the bottom and `02-design-system.md` for the hard
> boundary.

---

## The name

**Warm Instrument.**

A precision tool with the warmth of a well-made physical object. Think of a
mid-century medical instrument or a fine drafting set: machined, exact,
trustworthy — but made of brass and bakelite and paper, not cold glass and
neon. The software equivalent of a tool that has been on a clinician's desk for
years and earned its place.

## The philosophy

**Emotional register.** The moment the page loads, the clinician should feel
*settled*, not stimulated. This is a tool used in the cognitive load of a live
visit — between a family, a child, and a diagnosis. It must lower the
temperature of the room, not raise it. The dominant mood is *quiet competence*:
the unhurried confidence of an instrument that does exactly one thing
extremely well. Nothing pulses for attention; nothing is "engaging." The
interface earns trust by being calm, legible, and unmistakably built by
someone who cared about every millimeter. This is the kind of polish that only
comes from obsessive iteration — and it should read that way.

**Color and material.** The surface is *warm paper*, lit softly from above.
Backgrounds are bone, oat, and manila — never the AI-default cool gray or pure
`#ffffff`. Text is a warm near-black ink, as if pressed into the page. There is
exactly **one** accent: a confident burnt **amber**, used *only* to signal an
active, chosen, or live state — never decoration. Amber is the tungsten glow of
an instrument that is powered on. Semantic clinical colors (the criteria
warning, the "complete" confirmation, the diagnostic pathway pills) survive as
a small, warm-shifted, deliberately distinct set — they carry meaning, so they
keep their hue, but they are retuned to belong to the paper-and-ink world rather
than fight it. The whole palette is small enough to hold in your head: three
papers, four inks, one amber, a handful of muted semantics.

**Typography.** Three voices, each with a job. A characterful display
serif — **Fraunces** — for the app's identity and the big section numerals,
giving the warmth and the sense of a *crafted object*. A humane technical
sans — **IBM Plex Sans** — for every label, control, and line of UI prose:
engineered, legible, unfussy. And a monospace sibling — **IBM Plex Mono** — for
data values and, critically, for the A&P note document itself, where the
box-drawing dividers (`─`, `═`) demand a fixed grid. Sans + mono from the same
superfamily reinforces the "instrument" identity; the serif supplies the
warmth. Sizes, weights, and tracking are calibrated to the half-pixel — labels
are small, uppercase, and finely tracked; body sits at a comfortable 13px;
nothing is tiny gray text on a gray field. Typography here is structure, not
ornament.

**Motion and state.** Interaction is acknowledged the way a good physical
control acknowledges a press: immediately, with a small, satisfying,
mechanical response. Transitions are swift (110–160ms) on a single confident
easing curve. There is no animation theater — no slides, no bounces, no
spinners where a state change will do. The one indulgence is the *active*
state: when a control becomes live, a thin amber **filament** edge appears and
gives a single, brief warm-up glow, like a tungsten element coming on. It
happens once, fast, and then rests. All of this respects
`prefers-reduced-motion` and collapses to instant state changes.

**Spatial logic.** Calm density. The left form panel is information-rich — this
is a real clinical tool with eight sections and dozens of controls — but it is
governed by a strict, invisible 4px rhythm so that density never tips into
clutter. Sections are clearly bounded paper cards with generous internal
breathing room. The right preview panel is the opposite: spacious, centered,
reverent — the generated document floats on the desk like a sheet of paper
under good light. The grid is disciplined; where it breaks (a numeral that
hangs into the margin, a pill that floats to a row's edge), it breaks on
purpose.

**Signature detail.** *Letterpress keys and the warming filament.* Every
interactive surface — chip, radio option, checkbox, tab, button — is treated
as a key pressed into warm paper: a precisely calibrated highlight-above +
shadow-below pair makes it sit a hair proud of the surface at rest, and
*depress* on `:active`. The section numerals (1–8) are **debossed** into the
panel — rendered in Fraunces with a single white under-highlight so they read
as *stamped into the page*, like the numbered dials of a real instrument. And
the amber filament (above) turns the boring "selected" state into the small
pleasure of switching on a beautifully made device. These three moves — the
emboss, the press physics, the filament — are the proof of craft. No generic
generator would think to add them.

---

## The tension we are committing to

> The exactness of a clinical instrument, rendered in the warmth of paper and
> ink and the tactile pleasure of mechanical keys.

If a choice makes the tool feel more like *cold software* or more like
*decorative consumer app*, it is wrong. If it makes the tool feel like a
**warm, precise instrument**, it is right.

---

## What this philosophy does NOT touch (hard boundary)

The redesign beautifies the **chrome**. It must leave the **generated clinical
documents** in their plain, formal, professional format, because they are
copied verbatim into Epic / Word and read by insurers, schools, and the medical
record:

- **The A&P Note** (`.note-content` monospace, `.note-doc` render) — stays a
  plain clinical note. Monospace, box-drawing dividers intact, no app color in
  the body, no card decoration applied to the text itself.
- **The ABA Letter and IEP Letter** (`.aba-doc`, `.aba-sec`, `.iep-ph`) — stay
  formal business letters: serif, black ink, left-aligned, the existing pale-
  yellow `{placeholder}` highlight preserved. The letter's own restrained
  section-header accent is part of its *formal* identity and is pinned to a
  conservative ink, NOT swapped to the new amber brand.
- **The copy/paste output** (`generateRichHTML`, `_abaContent`,
  `_iepLetterContent` inline-hex styles) — untouched. Those literals exist
  because Epic/Word cannot resolve CSS variables.

Warm Instrument styles the *paper the document rests on*, the tabs that switch
between documents, and the sticky copy bar — never the document's interior.
