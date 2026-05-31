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

const styleBlock = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
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
// meaningful and quiet. Add entries here as the chip refactor migrates names.
const STATE_FAMILY = [
  'sel', 'active', 'used', 'tab-active', 'mnav-active', 'is-on', 'pill-on', 'pill-off',
  'dx-active', 'has-content', 'outcome-required', 'collapsed', 'vt-unset', 'used',
];
const CHIP_FAMILY = [
  'r-opt', 'mod-chip', 'str-chip', 'chip-tier', 'chip-strip', 'chip-grp-hd',
  'plan-pill', 'ov-pill', 'tab-btn',
];

const failures = [];

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
