# Golden-output tests for `autism-ap-builder.html`

A regression net for the note generator. Each fixture sets up an `S` state, runs
the real shipped `generateNote()` / letter generators, and compares the exact
plain text against a committed golden file. If a code change alters output, the
diff shows up here so it can be reviewed as an intentional change, not shipped by
accident.

## Running

```
npm test                 # compare current output against golden files
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
