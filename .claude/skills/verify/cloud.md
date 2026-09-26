# /verify in a cloud session

Use this file only when `echo $CLAUDE_CODE_REMOTE` prints `true`. On the desktop, the
Launch section of SKILL.md applies and this file does not.

Cloud sessions have no browser pane, no `preview_start`, and no `.claude/launch.json`.
Instead, `scripts/drive.mjs` serves the repo on loopback, opens the app in a headless
Chromium, runs one snippet of page JavaScript, and prints what it returned. The Drive it,
Capture the real copy output, and Gotchas sections of SKILL.md still apply: the same
`document.querySelector(...)` snippets work unchanged.

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
JSON), the screenshot path if `--shot` was given, and `== page errors ==`. Exit code is
1 if the snippet threw or the page raised an uncaught exception (for example, a smart
quote in a JS string), 2 if the browser could not start.

- **Every run is a fresh page with a fresh profile.** Nothing carries over between runs,
  so each snippet sets up its whole case from scratch. Put a before/after comparison in
  one snippet, or run two snippets and diff their output.
- **Screenshots:** open the PNG with the Read tool to look at it. Use `--width 700` to see
  the single-column layout (then click the "View Note" tab first, per Gotchas).
- `--eval "return document.title"` runs a one-line snippet without a file.

## First run in a session

The first run downloads `chrome-headless-shell` (about 100 MB, under a minute) into
`~/.cache/verify-chrome` from Chrome for Testing (`storage.googleapis.com`, which is on
the default cloud allowlist) using `npx @puppeteer/browsers`. Later runs in the same
session reuse it. Nothing is added to `package.json`.

If the browser will not start, the error lists any missing system libraries. Install them
with `npx -y playwright install-deps chromium` (uses apt only, needs root), then retry.
If the download itself is blocked (a custom network setting), say so in the report.

## When the browser cannot be made to work

Fall back to `npm test`, inspect any golden diffs, and say plainly in the report that the
live app was **not** driven and why. Do not describe test results as verification.
