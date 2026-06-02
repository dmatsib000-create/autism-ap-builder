# Tests for `autism-ap-builder.html`

A regression net for the note generator. Each fixture sets up an `S` state, runs
the real shipped `generateNote()` / letter generators, and compares the exact
plain text against a committed golden file. If a code change alters output, the
diff shows up here so it can be reviewed as an intentional change, not shipped by
accident.

## Test lanes

`npm test` runs all four:

- **Golden lane** (`tests/run.mjs`, `npm run test:golden`) — the regression net
  described above. Snapshots the exact note/letter text a clinician copies.
- **Unit lane** (`tests/unit.mjs`, `npm run test:unit`) — asserts on the pure
  clinical-decision functions (`bifSpecifierAllowed`, `currentClinicalPathway`)
  that drive specifier / BIF gating. These live behind DOM wrappers
  (`toggleBifSpecifierGate`, `bridgeCogProfileToSpecifier`) that fire only from
  `onchange`/`render` and early-return on the harness's null `querySelector`, so
  the golden lane can't reach them — but the wrappers are thin appliers over
  these pure deciders, which read `S` and touch no DOM. The unit lane tests the
  gate predicate and the never-auto-bridge invariant (borderline → no specifier,
  Greenspan 2017) directly. It also covers the one DOM wrapper whose state cleanup
  is load-bearing — `toggleBifSpecifierGate` removing an unsupported `withBIF` — by
  handing `makeApp({ querySelector })` a mutable fake checkbox so the cleanup branch
  runs and can be asserted. These lanes share `makeApp()` and the real, unmodified
  shipped script.
- **Wiring lane** (`tests/wiring.mjs`, `npm run test:wiring`) — a source-text lint
  (no script eval) that checks the chip/state class contract: every state class
  JS toggles has a CSS rule, and every chip-family CSS rule is actually applied or
  toggled. Catches a rename that desyncs JS/CSS/markup — invisible to the output
  lanes. Proves the wiring is connected, not that it looks right (the preview
  check still owns "looks right").
- **Invariants lane** (`tests/invariants.mjs`, `npm run test:invariants`) — a
  source-text lint that checks hand-maintained parallel lookup tables share the
  same key set: the three social-work-reason tables (`SW_REASON_LABELS`, the note
  prose's own `swLbls` copy with intentionally different casing, and the §8 HTML
  checkboxes) and the override registry (`OV_DEFS` / `OV_GROUPS` / the `S.overrides`
  init, where `socialWork` is intentionally absent from `S.overrides`). A
  half-finished edit that adds a key in one table but not another renders a
  referral reason or override pill in one place and silently drops it elsewhere;
  the output lanes can't see it because some tables live in unreachable scopes.
  This lane also guards the **theme boundary** (section C): the formal-letter pins
  (`--letter-ink` / `--letter-rule`) and the clinical amber semantic (`--amber*`)
  must stay defined only in base `:root` and never be overridden inside a
  `:root[data-theme=...]` block — otherwise the ABA/IEP letters bleed the theme
  accent (Warm flips them amber, Slate vermilion), the exact preserved-document
  regression the manual sweep would otherwise have to catch by eye. It does NOT
  assert the Warm and Slate blocks define the same token *set* — they
  intentionally differ (Warm's letterpress `--key-*`/`--emboss` vs Slate's
  `--radius-lg`/`--shadow-card`), so set-equality would be a false positive.

## Running

```
npm test                 # all four lanes: golden, unit, wiring, invariants
npm run test:golden      # golden lane only
npm run test:unit        # unit lane only
npm run test:wiring      # wiring lane only
npm run test:invariants  # invariants lane only
npm run test:update      # re-save goldens — lists what changed and asks first
node tests/run.mjs aba   # run only fixtures whose name includes "aba"
```

No dependencies — plain Node (≥ 18). Run from the repo root.

`test:update` does not overwrite silently: it lists every golden that would
change, shows the first differing line (old above, new below), and waits for you
to type `yes`. This is your chance to confirm you didn't change something by
accident. To skip the prompt in an automated run: `node tests/run.mjs --update --yes`.

If the harness itself can't run (e.g. a generator was renamed, or the app has a
syntax error), it prints a plain-English explanation of what to check instead of
a raw stack trace.

## How it works

`harness.mjs` reads `autism-ap-builder.html`, extracts the `<script>` body, and
evaluates it inside a `Function` with no-op DOM stubs, appending a `return {…}`
that hands back the generators and the `S` state object. **The production file is
never modified** — the test-only export lives only in the wrapper, so the app's
"no functions on `window`" design constraint is preserved.

`generateNote()` is pure (it reads `S` and returns strings; it touches no DOM),
and the only top-level browser access in the app is one `DOMContentLoaded`
handler that never fires under Node — which is why this works without a real DOM
or a headless browser. The script is re-evaluated fresh for every fixture, so no
state leaks between them through the shared module-scope `S`.

## What these lanes do NOT cover (the DOM blind spot)

All four lanes are intentionally **no-browser**: the golden/unit lanes eval the
`<script>` against no-op DOM stubs, and the wiring/invariants lanes never run the
script at all. That is what keeps the suite zero-dependency — plain Node, no
`npm install`, no lockfile, no headless browser — a property the CI workflow and
this README both advertise and rely on.

The cost is a real blind spot: **nothing here exercises the app's DOM-mutating
paths.** `render()` and the functions it drives — `updateSectionHeaders()` /
`setSH()`, `toggleSec()`, the section completion-dot prepend, the `onchange` /
`onclick` handlers — fire only from real DOM events and never run under Node. An
uncaught throw inside `render()` is invisible to every lane.

This is not hypothetical. A change once nested new spans inside `.sec-head`, which
broke `setSH()`'s `h.querySelector('span:last-child')` lookup so `insertBefore`
threw on *every* render — yet all four lanes stayed green, because the throw fires
*after* note generation, so `generateNote()`'s text was unchanged. It surfaced
only in a manual in-browser pass. A jsdom-based DOM smoke lane was considered and
**deliberately declined**: a faithful one needs a DOM library, and that would
trade away the zero-dependency property documented above. The boundary is
accepted on purpose, not unnoticed.

**The mitigation is process, not code.** After any change that touches
section-header markup or other DOM-manipulating JS (`render()` and what it calls),
open the app on the preview server, populate state (an archetype preset plus a
diagnosis selection, which triggers a full `render()`), and confirm the console is
clean and the UI renders. That preview sweep is the only check that sees this
class of bug — treat it as mandatory for DOM-touching changes, the same way
`test:update` review is mandatory for output changes.

## Singular-"they" verb-agreement guard

The app rewrites third-person-singular verbs to the bare form for `they` patients
via a hardcoded `V3_MAP` (`v3()` in the app). A verb missing from that map falls
through to ungrammatical output ("they has") and only emits a `console.warn` —
invisible to a clinician in production. The harness captures those warnings on
`app.__warnings`, and the runner turns any `v3()` missing-verb warning into a
hard failure (compare mode). The `they-pronoun-broad-prose` fixture exists to
exercise this: it turns on every needs category, both letters, comorbidities,
and the ID specifier under one `they` patient, so a missing verb surfaces as a
failure instead of being baked silently into a golden. Any new `they`-pronoun
fixture gets the same protection automatically. When the guard fires, add the
named verb to `V3_MAP` (see `docs/audits/verb-agreement.md`).

## Adding a fixture

Create `tests/fixtures/<name>.mjs`:

```js
export default {
  name: 'my-scenario',                 // golden files: golden/my-scenario.<output>.txt
  describe: 'one-line clinical scenario',
  outputs: ['note', 'aba', 'iep'],     // any of: note | aba | iep
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.diagStatus = 'confirmed';
    S.criteriaA.add('a1');             // Set fields use real .add()
    // ... mutate S to express the scenario
  },
};
```

Then `npm run test:update` to write the golden, **read the generated `.txt` to
confirm it's clinically sane**, and commit fixture + golden together.

Output kinds map to what a clinician copies from each tab:
`note` → `generateNote().main`, `aba` → `generateABALetterPlain()`,
`iep` → `generateIEPLetterPlain()`. Only request the letters for fixtures whose
state actually renders them (ABA: confirmed diagnosis; IEP: `schoolDoc` set and
not a toddler).

## When a test fails

Either you introduced an unintended regression (fix the code), or the output
change is deliberate (run `npm run test:update`, **read the change list it shows
you before typing `yes`**, and commit the updated goldens alongside the code
change). The goldens are the reviewable record of what the note looks like.
