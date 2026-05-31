# Tests for `autism-ap-builder.html`

A regression net for the note generator. Each fixture sets up an `S` state, runs
the real shipped `generateNote()` / letter generators, and compares the exact
plain text against a committed golden file. If a code change alters output, the
diff shows up here so it can be reviewed as an intentional change, not shipped by
accident.

## Two test lanes

`npm test` runs both:

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
  runs and can be asserted. Both lanes share `makeApp()` and the real, unmodified
  shipped script.

## Running

```
npm test                 # both lanes: golden then unit
npm run test:golden      # golden lane only
npm run test:unit        # unit lane only
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
