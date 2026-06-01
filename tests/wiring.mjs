// Static class-wiring guard for autism-ap-builder.html.
//
// The golden and unit lanes test the note OUTPUT. They are blind to the input
// form's DOM/CSS — so a refactor that renames a state class in JS but not in CSS
// (or vice versa) leaves `npm test` green while a control's "selected" style is
// silently dead in the browser. That is the dominant risk of the chip-primitive
// refactor (tech-debt #4), where the same class name is the contract between a
// classList.toggle() in JS, a `class="..."` in the HTML, and a `.name{}` rule in
// the CSS.
//
// This guard reads the file as text (no script eval) and checks that contract:
// every state class JS toggles has a CSS rule, and every chip/state CSS rule is
// actually used. It is a lint, not a behavior test — it proves the wiring is
// connected, not that it looks right; the visual/preview check still owns "looks
// right". Run by `npm test` and standalone via `npm run test:wiring`.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, '..', 'autism-ap-builder.html'), 'utf8');

// Raw (un-stripped) style block for the comment-integrity guard below. The
// stripped version (for class wiring) is derived from this.
const styleRaw = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));

// Strip CSS comments first: a comment like `/* .str-chip migrated */` would
// otherwise read as a live `.str-chip` rule and produce a false dead-rule report.
const styleBlock = styleRaw.replace(/\/\*[\s\S]*?\*\//g, '');
const scriptBlock = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

// All class names that have at least one CSS rule (any `.name` selector token).
const cssClasses = new Set([...styleBlock.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));

// Classes referenced from JS via classList ops — the second arg of toggle() is a
// boolean condition, not a class, so we only take the first string literal.
const jsToggled = new Set(
  [...scriptBlock.matchAll(/classList\.(?:toggle|add|remove|contains)\(\s*'([a-zA-Z][\w-]*)'/g)].map(m => m[1])
);

// Classes applied via markup `class="..."`, JS template-literal `class="a ${x}"`,
// and `className='...'` assignments. We capture the whole attribute value (which
// may contain ${...} interpolation), split on whitespace, and keep only the
// static, valid class-name tokens — so `class="ov-pill ${cls}"` still records
// `ov-pill`. Without this, interpolated class strings read as "never applied" and
// produce false dead-rule reports.
const applied = new Set();
const VALID = /^[a-zA-Z][\w-]*$/;
const addTokens = v => v.split(/\s+/).forEach(c => { if (VALID.test(c)) applied.add(c); });
for (const m of html.matchAll(/class="([^"]*)"/g)) addTokens(m[1]);
for (const m of html.matchAll(/className\s*=\s*'([^']*)'/g)) addTokens(m[1]);
for (const m of html.matchAll(/className\s*=\s*"([^"]*)"/g)) addTokens(m[1]);

// The chip/selectable-control + state family this guard governs. Scoping to an
// explicit family (rather than every class in the app) keeps the assertions
// meaningful and quiet. Add an entry when a new selectable control is introduced.
// Selection state across the chip family is fully unified to .is-on as of
// tech-debt #4 (PR-2). The legacy on-names (sel/active/used/tab-active/
// mnav-active/pill-on) are retired — none are toggled anymore. .pill-off stays:
// it's the plan-pill's distinct visible "off" state, not the absence of on.
// The remaining entries are non-chip UI states that still carry their own names.
const STATE_FAMILY = [
  'is-on', 'pill-off',
  'dx-active', 'has-content', 'outcome-required', 'collapsed', 'vt-unset',
];
const CHIP_FAMILY = [
  'chip', 'r-opt', 'mod-chip', 'str-chip', 'chip-tier', 'chip-strip', 'chip-grp-hd',
  'plan-pill', 'ov-pill', 'tab-btn',
];

const failures = [];

// (0) CSS comment integrity. A literal `*/` inside comment PROSE closes the
// comment early, leaking the rest of the comment into the stylesheet as invalid
// CSS that silently invalidates the following rule. This actually happened: a
// banner comment containing `--amber*/--letter-*` closed early and killed the
// entire `:root[data-theme="warm"]` block, so the Warm theme never applied while
// every test stayed green (golden/unit snapshot generated TEXT; the class-wiring
// checks below don't parse CSS validity). Two cheap, targeted assertions:
//   a. `/*` and `*/` counts must balance across the style block.
//   b. No `*/` may appear immediately after a `--custom-prop-token` fragment —
//      the signature of a hyphenated token (`--amber*/...`) being misread as a
//      comment close. We scan only INSIDE comments so real CSS like
//      `width:calc(2*/* x */1)` (pathological but legal) can't false-positive.
{
  const opens = (styleRaw.match(/\/\*/g) || []).length;
  const closes = (styleRaw.match(/\*\//g) || []).length;
  if (opens !== closes) {
    failures.push(`CSS comment delimiters unbalanced in <style>: ${opens} '/*' vs ${closes} '*/' (a '*/' inside comment text closes it early)`);
  }
  // Walk comments; flag any whose TEXT contains an extra '*/' beyond its closer,
  // or a '--word*/' fragment (custom-property token swallowed as a comment end).
  for (const m of styleRaw.matchAll(/\/\*[\s\S]*?\*\//g)) {
    const inner = m[0].slice(2, -2); // text between the matched /* and */
    if (inner.includes('*/')) {
      failures.push(`CSS comment closes early near: ${JSON.stringify(m[0].slice(0, 60))} ('*/' appears inside comment text)`);
    }
  }
  // Belt-and-suspenders: the exact bug signature, anywhere in <style>.
  if (/--[\w-]*\*\//.test(styleRaw)) {
    failures.push(`A '--token*/' fragment appears in <style> — a hyphenated custom-property name is closing a CSS comment early`);
  }
}

// (1) Every JS-toggled state class in our family must have a CSS rule. This is
// the desync catcher: rename in JS without renaming in CSS -> fails here.
for (const cls of jsToggled) {
  if (!STATE_FAMILY.includes(cls)) continue; // only police the family we own
  if (!cssClasses.has(cls)) failures.push(`JS toggles '.${cls}' but no CSS rule defines it (rename desync?)`);
}

// (2) Every chip-family CSS rule must be referenced (applied in markup/JS or
// toggled). Catches a dead rule left behind after a migration.
for (const cls of CHIP_FAMILY) {
  if (!cssClasses.has(cls)) continue; // not defined yet (e.g. mid-migration) — fine
  if (!applied.has(cls) && !jsToggled.has(cls)) {
    failures.push(`CSS defines '.${cls}' but nothing applies or toggles it (dead rule?)`);
  }
}

console.log('');
console.log(`wiring: ${cssClasses.size} CSS classes, ${jsToggled.size} JS-toggled, ${applied.size} applied in markup`);
for (const f of failures) console.log('✗ ' + f);
console.log('');
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} — ${failures.length} wiring issue(s)`);
if (failures.length) process.exit(1);
