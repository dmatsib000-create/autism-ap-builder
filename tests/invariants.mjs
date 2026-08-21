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
// We blank out string-literal VALUES first: a colon inside a value (a label
// sub-clause like 'APD: waiver...' or a URL 'https://...') would otherwise be
// read as a phantom key by the `identifier:` regex. The replace keeps the quotes
// (so the literal still parses structurally) but empties the contents, including
// escaped quotes. Order: single- then double-quoted; the targeted tables don't
// mix quote styles within one value, so there's no cross-eating.
const stripStringValues = s =>
  s.replace(/'(?:[^'\\]|\\.)*'/g, "''").replace(/"(?:[^"\\]|\\.)*"/g, '""');
const flatObjectKeys = slice =>
  [...stripStringValues(slice).matchAll(/([A-Za-z_]\w*)\s*:/g)].map(m => m[1]);

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
// Accept either quote style on the key (key:'x' or key:"x"). A single-quote-only
// match would make a future double-quoted entry invisible here — a false NEGATIVE
// (the dangerous direction), so we also cross-check the def count below.
const ovDefsSlice = balancedAfter('const OV_DEFS=');
const ovDefKeys = [...ovDefsSlice.matchAll(/key:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
// Belt-and-suspenders: every `key:` token in OV_DEFS must have yielded a key. If
// a future entry uses a syntax this regex doesn't catch, the counts diverge and
// we fail loudly rather than silently skipping that def.
const ovDefKeyTokens = (ovDefsSlice.match(/key:/g) || []).length;
if (ovDefKeyTokens !== ovDefKeys.length) {
  failures.push(
    `OV_DEFS: found ${ovDefKeyTokens} \`key:\` tokens but extracted ${ovDefKeys.length} keys — ` +
    `an entry uses a key syntax invariants.mjs doesn't parse (update the OV_DEFS key regex).`
  );
}
// OV_GROUPS: flatten every keys:[...] array.
const ovGroupKeys = [...balancedAfter('const OV_GROUPS=').matchAll(/keys:\[([^\]]*)\]/g)]
  .flatMap(m => [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]));
const ovInitKeys = flatObjectKeys(balancedAfter('overrides:{'));

// A key listed in two groups would dedupe away in the set-diff below and pass
// silently, but it renders a duplicate pill in the UI. "Grouped exactly once" is
// the real invariant, so assert no duplicates before the set comparison.
const ovGroupDupes = ovGroupKeys.filter((k, i) => ovGroupKeys.indexOf(k) !== i);
if (ovGroupDupes.length) {
  failures.push(`OV_GROUPS: key(s) listed in more than one group: ${[...new Set(ovGroupDupes)].join(', ')}`);
}

// Every def is grouped exactly once, and every grouped key has a def.
check('Override pills (OV_DEFS vs OV_GROUPS)',
  diff('OV_DEFS', ovDefKeys, 'OV_GROUPS', ovGroupKeys));
// socialWork is intentionally NOT in S.overrides: its inclusion is gated by the
// S.socialWork boolean, and resolveOv()'s undefined->'auto' fallthrough handles
// it. So the cycle-able override set is OV_DEFS minus socialWork.
const ovDefCycleable = ovDefKeys.filter(k => k !== 'socialWork');
check('Override state (S.overrides init vs OV_DEFS minus socialWork)',
  diff('S.overrides', ovInitKeys, 'OV_DEFS\\socialWork', ovDefCycleable));

// ── C. Preserved-document boundary tokens stay theme-independent ─────────────
// The formal-letter pins (--letter-ink/--letter-rule) and the clinical amber
// semantic (--amber/-light/-dark) are defined once in base :root and are
// DELIBERATELY not overridden per theme (see the comment above the
// :root[data-theme] blocks). If a theme block redefines one, the letters bleed
// the theme accent (Warm would flip --letter-ink amber, Slate vermilion) or the
// amber clinical signal drifts — the exact preserved-document regression the
// manual preview sweep currently has to catch by eye. This static guard makes
// that boundary fail at `npm test` instead.
//
// NAMES only, and intentionally strict: a theme re-declaring a pin even to the
// SAME value is flagged — it has no business in a theme block at all. Whether a
// value is correct stays the visual sweep / contrast audit's job (see
// tests/README.md "the DOM blind spot"). We do NOT assert Warm/Slate define the
// same token SET: they intentionally differ (Warm's --key-*/--emboss/--blue-darker
// signature vs Slate's --radius-lg/--shadow-card), so set-equality would be a
// false positive. This guards only the never-theme-these tokens.
//
// balancedAfter() can't be reused here: its marker would contain the '[' of the
// attribute selector and it would grab `[data-theme="warm"]` instead of the
// `{...}` rule body. cssBlockAfter finds the first '{' AFTER the full selector.
const cssBlockAfter = sel => {
  const i = html.indexOf(sel);
  if (i < 0) throw new Error(
    `invariants.mjs: selector "${sel}" not found in autism-ap-builder.html.\n` +
    `    If a theme block was renamed or removed, update this test to match.`
  );
  const open = html.indexOf('{', i + sel.length);
  let depth = 0;
  for (let k = open; k < html.length; k++) {
    if (html[k] === '{') depth++;
    else if (html[k] === '}' && --depth === 0) return html.slice(open, k + 1);
  }
  throw new Error(`invariants.mjs: unbalanced "{" after selector "${sel}".`);
};

const PIN_TOKENS = ['--letter-ink', '--letter-rule', '--amber', '--amber-light', '--amber-dark'];
const themeBlocks = [
  ['Warm',  cssBlockAfter(':root[data-theme="warm"]')],
  ['Slate', cssBlockAfter(':root[data-theme="slate"]')],
];
for (const tok of PIN_TOKENS) {
  const def = tok + ':';                       // `--amber:` won't match `--amber-light:` (different next char)
  for (const [themeName, block] of themeBlocks) {
    if (block.includes(def)) failures.push(
      `Boundary token ${tok} is overridden in the ${themeName} theme block — it must stay ` +
      `theme-independent (formal-letter pin / clinical amber). Remove it from the theme block.`
    );
  }
  if (!html.includes(def)) failures.push(
    `Boundary token ${tok} is no longer defined anywhere — it must remain defined in base :root ` +
    `(was it renamed or removed?).`
  );
}

// ── D. ABA-target tables agree (checkbox ⇄ TL label map) ─────────────────────
// Each ABA target has up to four hand-maintained parallel representations: the
// form checkboxes (data-key="abaTargets"), the TL label map (ABA-letter target
// list), the TARGET_RATIONALE map (ABA-letter rationale block), and the add('...')
// calls in syncABATargetsFromNeeds(). Nothing else lints these, so a target added
// to some-but-not-all tables silently desyncs. The sharpest failure: a missing TL
// entry renders the RAW KEY in the ABA letter (the `||t` fallthrough in the targets
// map ~`const targets=[...S.abaTargets].map(...)`), the exact bug that shipped when
// pica was keyed reduce_pica everywhere but `pica_reduction` in TL. (Found in the
// §4 review, docs/section-4-functional-needs-review.md.)
//
// TL is the load-bearing 1:1 table (its lookup falls through to the raw key), so
// checkbox value-set MUST EQUAL TL key-set. The other tables are SUBSET-checked:
// TARGET_RATIONALE is intentionally partial (its consumer .filter()s to keys it
// has) and TL_OLDER intentionally overrides only some targets — but neither may
// reference a target that has no checkbox (an orphan from a rename/removal), and
// no sync add() may target a non-existent checkbox.
const subset = (subLabel, sub, supLabel, sup) => {
  const SUP = new Set(sup);
  const orphans = [...new Set(sub)].filter(k => !SUP.has(k));
  return orphans.length ? `in ${subLabel} but not ${supLabel}: ${orphans.join(', ')}` : null;
};
const abaCheckboxKeys = [...html.matchAll(/data-key="abaTargets"\s+value="([^"]+)"/g)].map(m => m[1]);
const tlKeys = flatObjectKeys(balancedAfter('const TL='));
const tlOlderKeys = flatObjectKeys(balancedAfter('const TL_OLDER='));
const targetRationaleKeys = flatObjectKeys(balancedAfter('const TARGET_RATIONALE='));
// Match the local `add('target')` helper only — the negative lookbehind excludes
// Set-method calls like `S.needsBehavior.add('rigidity')` (the b2→rigidity cascade,
// a derived behavior with no checkbox by design), which are not abaTargets adds.
const abaSyncAddKeys = [...balancedAfter('function syncABATargetsFromNeeds')
  .matchAll(/(?<!\.)\badd\('([^']+)'\)/g)].map(m => m[1]);

check('ABA targets (checkboxes vs TL label map)',
  diff('checkboxes', abaCheckboxKeys, 'TL', tlKeys));
check('ABA targets (TL_OLDER overrides a real target)',
  subset('TL_OLDER', tlOlderKeys, 'TL', tlKeys));
check('ABA targets (TARGET_RATIONALE keys are real targets)',
  subset('TARGET_RATIONALE', targetRationaleKeys, 'checkboxes', abaCheckboxKeys));
check('ABA targets (sync add() targets a real checkbox)',
  subset('sync add()', abaSyncAddKeys, 'checkboxes', abaCheckboxKeys));

// ── E. IEP letter: three surfaces must consume the same content fields ───────
// The IEP letter is rendered THREE times from one `_iepLetterContent()` object:
// the on-screen preview (generateIEPLetterHTML), the plain text the clinician
// pastes into Epic (generateIEPLetterPlain), and the formatted Word paste inside
// copyIEPLetter's rich branch. The golden lane snapshots only the PLAIN one, so a
// field wired into two surfaces and forgotten in the third ships silently — which
// is exactly what happened to `accomCoreLead`: the rule-out rationale reached the
// preview but not the letter the school actually receives.
//
// Unlike the prose (which is deliberately NOT shared across the note/ABA/IEP
// audiences, per CLAUDE.md), these three are the SAME letter to the SAME reader in
// three formats. Every field below must be consumed by all three. Formatting may
// differ freely; presence may not.
//
// Add a field here whenever `_iepLetterContent()` returns something all three
// surfaces must print. Fields legitimately used by only some surfaces (e.g.
// `dxStr`, which the rule-out branch bypasses) are intentionally NOT listed.
const IEP_SHARED_FIELDS = [
  'ruleOutReferralTail', 'ruleOutDxRest', 'ruleOutRelatedSvcNote',
  'eligibilityCandidates', 'eligibilityLead', 'eligibilityFallback',
  'ruleOutEvalRequest', 'ruleOutAsk504', 'ruleOutIEPCategoryReview',
  'accomCoreHeading', 'accomCoreLead',
];
const sliceBetween = (startMarker, endMarker) => {
  const a = html.indexOf(startMarker);
  if (a < 0) throw new Error(
    `invariants.mjs: could not find "${startMarker}" — if that renderer was renamed, update this test.`
  );
  const b = html.indexOf(endMarker, a);
  if (b < 0) throw new Error(
    `invariants.mjs: could not find "${endMarker}" after "${startMarker}" — update this test.`
  );
  return html.slice(a, b);
};
const iepSurfaces = {
  'preview HTML': sliceBetween('function generateIEPLetterHTML(){', 'function generateIEPLetterPlain(){'),
  'plain text': sliceBetween('function generateIEPLetterPlain(){', 'async function copyIEPLetter(format){'),
  'Word paste': sliceBetween('async function copyIEPLetter(format){', 'function setPreviewMode(mode){'),
};
for (const field of IEP_SHARED_FIELDS) {
  // Word-boundary the field name so `accomCore` cannot match `accomCoreHeading`.
  const re = new RegExp(`\\bc\\.${field}\\b`);
  const absent = Object.entries(iepSurfaces).filter(([, src]) => !re.test(src)).map(([n]) => n);
  if (absent.length) {
    failures.push(
      `IEP letter surfaces: c.${field} is not consumed by ${absent.join(' / ')} — ` +
      `all three renderers must print it, or remove it from IEP_SHARED_FIELDS with a reason.`
    );
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log('');
console.log(
  `invariants: SW reasons ${swLabelKeys.length} keys; ` +
  `overrides ${ovDefKeys.length} defs / ${ovInitKeys.length} state keys; ` +
  `ABA targets ${abaCheckboxKeys.length} checkboxes = ${tlKeys.length} TL labels; ` +
  `boundary pins ${PIN_TOKENS.length} guarded theme-independent; ` +
  `IEP fields ${IEP_SHARED_FIELDS.length} shared across 3 surfaces`
);
for (const f of failures) console.log('✗ ' + f);
console.log('');
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} — ${failures.length} invariant issue(s)`);
if (failures.length) process.exit(1);
