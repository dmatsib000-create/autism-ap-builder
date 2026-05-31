// Static structural-invariant guard for autism-ap-builder.html.
//
// The app has several hand-maintained lookup tables that MUST share the same key
// set but live in different scopes — some inside function bodies, some in the
// HTML — so the golden/unit lanes (which only see note output and exported pure
// functions) are structurally blind to a drift between them. A half-finished
// edit (add a key here, forget it there) ships a referral reason or an override
// pill that renders in one place and silently vanishes in another.
//
// Like wiring.mjs, this reads the file as TEXT (no script eval): the constructs
// it checks aren't all reachable at runtime under the harness (e.g. a `const`
// local to generateNote, or §8 HTML checkboxes). It is a lint that proves the
// parallel tables agree, not a behavior test. Run by `npm test` and standalone
// via `npm run test:invariants`.
//
// When this fails, the message names the table and the exact keys that differ.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, '..', 'autism-ap-builder.html'), 'utf8');

// ── helpers ────────────────────────────────────────────────────────────────

// Return the balanced {...} or [...] literal that begins at/after `marker`.
// Brace-depth counting; safe here because none of the targeted tables contain
// braces/brackets inside their string values (labels use parens, not braces).
// Throws loudly if the marker is gone — a rename should fail here, not silently
// skip the check (same philosophy as harness.mjs's extractScript guard).
function balancedAfter(marker) {
  const i = html.indexOf(marker);
  if (i < 0) throw new Error(
    `invariants.mjs: could not find "${marker}" in autism-ap-builder.html.\n` +
    `    If that construct was renamed or moved, update this test to match.`
  );
  let j = i;
  while (j < html.length && html[j] !== '{' && html[j] !== '[') j++;
  const open = html[j], close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let k = j; k < html.length; k++) {
    if (html[k] === open) depth++;
    else if (html[k] === close && --depth === 0) return html.slice(j, k + 1);
  }
  throw new Error(`invariants.mjs: unbalanced "${open}" after "${marker}".`);
}

// Top-level identifier keys of a flat object literal slice (`{ a: '...', b: ... }`).
// Only used on tables known to be flat (no nested object values).
const flatObjectKeys = slice =>
  [...slice.matchAll(/([A-Za-z_]\w*)\s*:/g)].map(m => m[1]);

// Compare two key collections as sets; returns the symmetric difference.
function diff(aLabel, a, bLabel, b) {
  const A = new Set(a), B = new Set(b);
  const missing = [...A].filter(k => !B.has(k)); // in A, not in B
  const extra = [...B].filter(k => !A.has(k));   // in B, not in A
  if (!missing.length && !extra.length) return null;
  const parts = [];
  if (missing.length) parts.push(`in ${aLabel} but not ${bLabel}: ${missing.join(', ')}`);
  if (extra.length) parts.push(`in ${bLabel} but not ${aLabel}: ${extra.join(', ')}`);
  return parts.join('; ');
}

const failures = [];
const check = (name, msg) => { if (msg) failures.push(`${name}: ${msg}`); };

// ── A. Social-work referral reasons: three tables, same keys ─────────────────
// SW_REASON_LABELS (popover source) vs swLbls (note-prose local copy, different
// CASING by design — mid-sentence lowercase — so only KEYS must agree) vs the §8
// HTML checkboxes. See the comments at those sites in autism-ap-builder.html.
const swLabelKeys = flatObjectKeys(balancedAfter('const SW_REASON_LABELS'));
const swProseKeys = flatObjectKeys(balancedAfter('const swLbls='));
// §8 checkboxes: data-key="socialWorkReasons" value="...". Scope to that data-key
// so the unrelated `data-key="ag" value="caregiver_support"` row is not counted.
const swHtmlKeys = [...html.matchAll(/data-key="socialWorkReasons"\s+value="([^"]+)"/g)].map(m => m[1]);

check('SW reasons (SW_REASON_LABELS vs note-prose swLbls)',
  diff('SW_REASON_LABELS', swLabelKeys, 'swLbls', swProseKeys));
check('SW reasons (SW_REASON_LABELS vs §8 HTML checkboxes)',
  diff('SW_REASON_LABELS', swLabelKeys, '§8 HTML', swHtmlKeys));

// ── B. Override registry: OV_DEFS / OV_GROUPS / S.overrides agree ────────────
const ovDefKeys = [...balancedAfter('const OV_DEFS=').matchAll(/key:'([^']+)'/g)].map(m => m[1]);
// OV_GROUPS: flatten every keys:[...] array.
const ovGroupKeys = [...balancedAfter('const OV_GROUPS=').matchAll(/keys:\[([^\]]*)\]/g)]
  .flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
const ovInitKeys = flatObjectKeys(balancedAfter('overrides:{'));

// Every def is grouped exactly once, and every grouped key has a def.
check('Override pills (OV_DEFS vs OV_GROUPS)',
  diff('OV_DEFS', ovDefKeys, 'OV_GROUPS', ovGroupKeys));
// socialWork is intentionally NOT in S.overrides: its inclusion is gated by the
// S.socialWork boolean, and resolveOv()'s undefined->'auto' fallthrough handles
// it. So the cycle-able override set is OV_DEFS minus socialWork.
const ovDefCycleable = ovDefKeys.filter(k => k !== 'socialWork');
check('Override state (S.overrides init vs OV_DEFS minus socialWork)',
  diff('S.overrides', ovInitKeys, 'OV_DEFS\\socialWork', ovDefCycleable));

// ── report ───────────────────────────────────────────────────────────────────
console.log('');
console.log(
  `invariants: SW reasons ${swLabelKeys.length} keys; ` +
  `overrides ${ovDefKeys.length} defs / ${ovInitKeys.length} state keys`
);
for (const f of failures) console.log('✗ ' + f);
console.log('');
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} — ${failures.length} invariant issue(s)`);
if (failures.length) process.exit(1);
