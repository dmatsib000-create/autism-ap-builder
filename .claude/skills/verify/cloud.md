# /verify in a cloud session

Cloud replacement for SKILL.md's Launch section; everything else in SKILL.md still
applies, and its `document.querySelector(...)` snippets work unchanged.

There is no browser pane in the cloud, so `scripts/drive.mjs` opens the app from disk
(`file://`, as clinicians do) in a headless Chromium, runs one snippet of page
JavaScript, and prints what it returned.

## Run a check

Write the snippet to a scratch file (it runs as the body of an async function, so
`await` and `return` work; `sleep(ms)` is provided), then:

```bash
node .claude/skills/verify/scripts/drive.mjs /tmp/check.js --shot /tmp/check.png
```

Example snippet (IEP plain-text copy for a school-age case):

```js
document.querySelector('input[name="diagStatus"][value="confirmed"]').click();
document.querySelector('input[name="ageGroup"][value="schoolAge"]').click();
document.querySelector('input[name="schoolDoc"][value="iep_needed"]').click();
document.getElementById('tabIEP').click();
let cap = null;
Object.defineProperty(navigator.clipboard, 'writeText',
  { configurable: true, writable: true, value: t => { cap = t; return Promise.resolve(); } });
document.getElementById('copyIEPEpicBtn').click();
await sleep(400);
return cap;
```

Output has three parts: `== result ==` (a returned string prints raw, anything else as
JSON), the screenshot path if `--shot` was given, and `== page errors ==` (printed only
once the page has loaded). Exit code is 1 if the snippet threw or the page raised an
uncaught exception (for example, a smart quote in a JS string), and 2 if the run itself
failed (browser would not start, page would not load, snippet exceeded `--timeout`,
default 60 s). Exit 2 means the app was **not** driven; say so in the report.

- **Every run is a fresh page with a fresh profile.** Nothing carries over between runs,
  so each snippet sets up its whole case from scratch. Put a before/after comparison in
  one snippet, or run two snippets and diff their output.
- **Screenshots:** open the PNG with the Read tool to look at it. Use `--width 700` to see
  the single-column layout (then click the "View Note" tab first, per Gotchas).
- `--eval "return document.title"` runs a one-line snippet without a file.
- `--page docs/branching-logic-for-clinicians.html` opens another repo page instead.
- The browser cannot resolve hostnames, so a snippet cannot fetch anything from the
  internet by name (the app makes no network requests by design). This is not a full
  network sandbox: requests to a literal IP address have not been verified as blocked,
  so do not point snippets at outside addresses.

## First run in a session

The first run downloads `chrome-headless-shell` (about 120 MB, under a minute) from
`storage.googleapis.com` into `~/.cache/verify-chrome/`; later runs reuse it. Nothing is
added to `package.json`. If the driver says the pinned Chrome version is stale, mention
that in the report. If the browser will not start, run the install command its error
prints, then retry.
If the download itself is blocked (a custom network setting), say so in the report.

## When the browser cannot be made to work

Fall back to `npm test`, inspect any golden diffs, and say plainly in the report that the
live app was **not** driven and why. Do not describe test results as verification.
