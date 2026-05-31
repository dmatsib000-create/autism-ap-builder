# Design Philosophy — "Editorial Slate"

> Alternative to "Warm Instrument" (`01-design-philosophy.md`). Same scope rules:
> this governs the **app chrome only** — controls, panels, header, tabs, and the
> *frame* around the generated documents. It does **not** restyle the generated
> clinical documents (A&P note, ABA letter, IEP letter), which stay plain and
> formal for copy-into-Epic. See the boundary section at the bottom and
> `04-editorial-slate-design-system.md`.

---

## The name

**Editorial Slate.**

The interface as a well-set page from a serious newspaper's graphics desk. Think
the print sensibility of *The Economist*, the *FT*, or a Tufte chart room:
information-dense but never chaotic, because every element sits on a strict,
invisible grid and is divided by hairline rules rather than boxes and shadows.
Cool slate-and-graphite neutrals, paper-white surfaces, and exactly one vivid
editorial accent: a confident vermilion, used like a red pencil.

## The philosophy

**Emotional register.** The moment the page loads, the clinician should feel the
quiet authority of *print*. Not an app demanding engagement, but a document that
has already organized the world for you. The dominant mood is *editorial
composure*: dense, exact, and calm, the way a great broadsheet can put an
enormous amount on one page and still feel effortless to read. The trust comes
from typographic discipline, not decoration. This must look like the work of a
masthead designer who spent weeks setting type and ruling columns, the kind of
polish that only comes from obsessive iteration over a grid most people will
never consciously notice.

**Color and material.** The surface is cool *paper* with a faint slate tint,
never the AI-default warm-white or pure `#fff` (which is reserved for the
document sheet alone). Text is graphite ink. The neutral scale runs from
near-white through slate to a deep graphite for the heaviest rules. Then there is
**one** accent, and only one: an editorial **vermilion**, deployed mostly as an
editor's red pencil would deploy it: an underscore, a kicker, a single ruled
emphasis. The one sanctioned fill is the primary *action* button, where a solid
vermilion is the logical, expected signal for "do this." The discipline is
otherwise absolute: underscore for state, a solid fill only for a primary action,
and never a second accent. If the vermilion appears, it means *this is live*,
*this matters*, or *press this*, and nothing else. Semantic
clinical colors survive as a small, muted, earth-toned set, retuned so they read
as ink on paper rather than UI badges.

**Typography.** This is the soul of the direction, so it carries the most weight.
A genuine editorial serif, **Newsreader** (designed for news reading), sets the
masthead, the section titles, and the hanging folio numerals, giving the whole
thing the cadence of a printed article. A newspaper-lineage grotesque, **Libre
Franklin** (Franklin Gothic's descendant), handles every label, control, and
line of UI prose, dense and legible at small sizes. Section labels use small,
finely tracked, uppercase **kickers**, the tiny standfirst line you see above a
magazine headline. A monospace is reserved for data values and, necessarily, the
A&P note itself, where the box-drawing dividers demand a fixed grid. Type here is
not styling; it *is* the layout.

**Motion and state.** Print does not animate, so neither does this, almost.
Transitions are minimal, swift (110-150ms), and confined to the things that must
move: a rule sliding in, a chevron rotating, a tab's underscore drawing itself.
There are no glows, no shadows lifting, no theater. The single signature gesture
is the *red-pencil underscore*: when an element becomes active, a vermilion rule
draws itself beneath it left-to-right, fast, as if an editor underlined it. Then
it rests. Everything respects `prefers-reduced-motion` and collapses to instant.

**Spatial logic.** Maximum honest density. This is a real clinical tool with
eight sections and dozens of controls, and Editorial Slate embraces that rather
than hiding it: it puts more on screen, governed by a strict column grid and
divided by hairline rules instead of padding-heavy cards. Section numerals hang
in a narrow left margin like figure numbers. Checkbox lists are ruled, tabular
rows. The right preview panel inverts the density: the generated document floats
as a single white sheet with wide margins, reverent and uncluttered, the way a
finished page sits apart from the working layout that produced it.

**Signature detail.** *The red-pencil underscore, and rules instead of boxes.*
The lone vermilion accent only ever manifests as a hairline-to-2px rule beneath
the live element, drawn left-to-right on activation like a stroke of an editor's
pencil. The accent's only filled use is the primary action button; everywhere else it is a rule, not a fill.
Paired with this: structure is built from **hairline rules, never cards or drop
shadows**, and each section header carries a tiny vermilion **kicker** above a
Newsreader title with a hanging folio numeral in the margin. Together these make
the interface read as a typeset page. No generic generator would refuse itself
the easy comfort of boxes and shadows; this direction's craft is in that refusal.

---

## The tension we are committing to

> The density of a great broadsheet, made calm by a strict grid, hairline rules,
> and a single red-pencil accent used with absolute restraint.

If a choice adds a box, a drop shadow, a second accent color, or decoration for
its own sake, it is wrong. If it makes the tool read like a beautifully typeset
page, it is right.

---

## What this philosophy does NOT touch (hard boundary)

Identical to the Warm Instrument boundary. The redesign beautifies the **chrome**
and leaves the **generated clinical documents** in their plain, formal format,
because they are copied verbatim into Epic / Word:

- **A&P Note** (`.note-content`, `.note-doc`) — plain clinical note. Monospace,
  box-drawing `─`/`═` dividers intact, ink body, no accent in the text.
- **ABA + IEP letters** (`.aba-doc`, `.aba-sec`, `.iep-ph`) — formal serif
  business letters, black ink, left-aligned, pale-yellow `{placeholder}`
  highlight preserved. The letter's section-header rule is pinned to a
  conservative graphite, **not** the vermilion accent.
- **Paste output** (`generateRichHTML`, `_abaContent`, `_iepLetterContent`) —
  untouched literal hex + `pt` (Epic/Word can't resolve CSS vars).

Editorial Slate styles the *page the document rests on*, the section-nav tabs,
and the sticky copy bar, never the document's interior.
