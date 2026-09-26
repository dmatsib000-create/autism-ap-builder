---
name: verify
description: Build, launch and drive autism-ap-builder.html to observe a change at its real surface (the rendered note and the three letter outputs).
---

# Verifying autism-ap-builder

Single-file app: all HTML/CSS/JS lives in `autism-ap-builder.html`. No build step.
The surface is a browser GUI plus three copy-to-clipboard outputs.

## Launch

```
preview_start with {"name": "autism-ap-builder"}     # .claude/launch.json, port 3737
navigate to http://localhost:3737/autism-ap-builder.html
```

**Cloud sessions** (`$CLAUDE_CODE_REMOTE` is `true`): skip this Launch section and follow
[cloud.md](cloud.md) instead. Everything from "Drive it" down still applies.

`preview_start` with a **url** only opens a tab — it does not start the server. Use the
**name** form. Confirm the server is actually serving the working tree before trusting
anything:

```bash
curl -s http://localhost:3737/autism-ap-builder.html | sha256sum | cut -c1-16
sha256sum autism-ap-builder.html | cut -c1-16
```

## Drive it

Script functions are **not** on `window` — you cannot call `generateNote()` or
`_iepLetterContent()` directly. Drive the DOM:

```js
document.querySelector('input[name="diagStatus"][value="ruleOut"]').click();
document.querySelector('input[name="ageGroup"][value="schoolAge"]').click();
document.querySelector('input[name="schoolDoc"][value="iep_needed"]').click();
document.querySelector('input[data-key="comorbid"][value="adhd_combined"]').click();
document.getElementById('tabIEP').click();          // IEP letter tab
document.querySelector('.aba-doc').innerText;        // rendered letter
```

Diagnosis states: `confirmed` | `suspected` | `ruleOut`.
School doc: `iep` | `iep_needed` | `504` | `neither`. IEP tab hides for `toddler`.

## Capture the real copy output

The preview is not the deliverable — the clipboard is. Clipboard *reads* are blocked;
intercept the *write* instead.

```js
// plain / Epic path (copyIEPEpicBtn) uses writeText
window.__cap=null;
const orig=navigator.clipboard.writeText;
Object.defineProperty(navigator.clipboard,'writeText',
  {configurable:true,writable:true,value:t=>{window.__cap=t;return Promise.resolve();}});
document.getElementById('copyIEPEpicBtn').click();
// ...await ~350ms, then restore orig and read window.__cap

// rich / Word path (copyIEPBtn) uses clipboard.write with a ClipboardItem
Object.defineProperty(navigator.clipboard,'write',{configurable:true,writable:true,
  value:async items=>{ html=await (await items[0].getType('text/html')).text(); }});
document.getElementById('copyIEPBtn').click();
```

Button ids: `copyIEPBtn` = **rich/Word**, `copyIEPEpicBtn` = **plain text, `{placeholder}` braces intact (no `***` rewrite)**.
There is no separate plain button — intercepting `writeText` on `copyIEPBtn` catches
only its *fallback* path, which is misleading.

## Gotchas

- `.aba-sec` headings are uppercased by CSS, so `innerText.includes('Assessment Results')`
  is a false negative. Match case-insensitively or use `textContent`.
- Clear All is an **inline** confirm, not `window.confirm`. Clicking the button only opens
  the prompt; click the "Yes, clear" `.btn-danger` inside the wrap to actually reset.
- Below ~800px viewport the layout goes single-column and the letter hides behind a
  "View Note" tab — click that before screenshotting the output.
- Screenshots have intermittently returned stale frames. Cross-check anything visual
  against the DOM before reporting it.
- Never commit smart quotes into JS strings; they break the whole script silently in a
  browser (the test harness catches it, the browser does not).

## Scope note

Tests exist (`npm test`, four lanes) and CI runs them. Running them is not verification —
drive the app.
