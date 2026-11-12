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

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
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

// ── D2. Prior-testing instruments: label table = checkboxes; adaptive subset is real ──
// PRIOR_TEST_LABELS is the one instrument-name table every surface reads, and
// ASD_DX_TEST_KEYS (what may be cited as evidence for the diagnosis) is derived from
// it minus ADAPTIVE_TEST_KEYS. A checkbox with no label renders its raw key; an
// adaptive key missing from ADAPTIVE_TEST_KEYS would be cited as autism-specific.
const priorTestCheckboxKeys = [...html.matchAll(/data-key="priorTesting"\s+value="([^"]+)"/g)].map(m => m[1]);
const priorTestLabelKeys = flatObjectKeys(balancedAfter('const PRIOR_TEST_LABELS='));
const adaptiveTestKeys = [...(html.match(/const ADAPTIVE_TEST_KEYS=new Set\(\[([^\]]*)\]\)/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]);
check('Prior testing (checkboxes vs PRIOR_TEST_LABELS)',
  diff('checkboxes', priorTestCheckboxKeys, 'PRIOR_TEST_LABELS', priorTestLabelKeys));
check('Prior testing (ADAPTIVE_TEST_KEYS are real instruments)',
  subset('ADAPTIVE_TEST_KEYS', adaptiveTestKeys, 'PRIOR_TEST_LABELS', priorTestLabelKeys));

// ── D3. Gait exam: every finding checkbox has note wording ───────────────────
// The gait problem and the neurology clause print GAIT_FINDING_LABELS[key]; a finding
// checkbox with no label would print "undefined" in the note. The three watch-only
// inputs are plan controls, not findings, so they have no label; every red flag must.
const GAIT_PLAN_INPUTS = ['notAssessed', 'heelsFlat', 'familyPT'];
const gaitExamKeys = [...html.matchAll(/data-key="gaitExam"\s+value="([^"]+)"/g)].map(m => m[1]);
const gaitLabelKeys = flatObjectKeys(balancedAfter('const GAIT_FINDING_LABELS='));
const gaitRedFlags = [...(html.match(/const GAIT_RED_FLAGS=\[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g)].map(m => m[1]);
check('Gait exam finding checkboxes ⇄ GAIT_FINDING_LABELS',
  diff('finding checkboxes', gaitExamKeys.filter(k => !GAIT_PLAN_INPUTS.includes(k)), 'GAIT_FINDING_LABELS', gaitLabelKeys));
check('GAIT_RED_FLAGS ⊆ GAIT_FINDING_LABELS', subset('GAIT_RED_FLAGS', gaitRedFlags, 'GAIT_FINDING_LABELS', gaitLabelKeys));
if (!gaitRedFlags.length) failures.push('Gait: could not read GAIT_RED_FLAGS; update the D3 parse if it was renamed.');

// ── D4. Behavior/interfering checkboxes: every one has a note summary label ──
// The note's Functional Needs block prints '  • Behavior/interfering: ' followed by
// a hand-maintained .has(key) → label chain inside needsSummaryLines(). A checkbox
// with no entry there prints the heading with NOTHING after the colon when it is
// the only behavior checked (exactly how 'smearing' and 'boundaryViol' shipped).
// 'rigidity' is the one key with no checkbox on purpose: it is derived from DSM-5
// criterion B2 (see the b2 → needsBehavior.add('rigidity') cascade), so it must
// appear in the summary chain but is exempt from the checkbox side of the diff.
const BEHAVIOR_DERIVED = ['rigidity'];
const behaviorCheckboxKeys = [...html.matchAll(/data-key="needsBehavior"\s+value="([^"]+)"/g)].map(m => m[1]);
const behaviorSummaryChain = balancedAfter('function needsSummaryLines')
  .match(/if\(S\.needsBehavior\.size\)\{const x=\[\];(.*?)L\.push\('  • Behavior\/interfering: '/)?.[1] ?? '';
const behaviorSummaryKeys = [...behaviorSummaryChain.matchAll(/S\.needsBehavior\.has\('([^']+)'\)/g)].map(m => m[1]);
if (!behaviorSummaryKeys.length) failures.push('Behavior summary: could not read the needsBehavior chain in needsSummaryLines(); update the D4 parse if it was restructured.');
check('Behavior/interfering checkboxes ⇄ note summary labels',
  diff('checkboxes', behaviorCheckboxKeys, 'needsSummaryLines() labels', behaviorSummaryKeys.filter(k => !BEHAVIOR_DERIVED.includes(k))));
check('Behavior/interfering derived keys have a summary label',
  subset('derived keys', BEHAVIOR_DERIVED, 'needsSummaryLines() labels', behaviorSummaryKeys));

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
//
// Known limit, same shape as the other lanes here: this is a text lint, so it
// proves the field is MENTIONED in each surface, not that it reaches output. A
// render line deleted but left behind as a comment would still pass. The golden
// lane covers actual rendering for the plain surface; the preview and Word
// surfaces have no output test, which is why presence is worth checking at all.
const IEP_SHARED_FIELDS = [
  'ruleOutReferralTail', 'ruleOutDxRest', 'ruleOutDxPivot', 'ruleOutRelatedSvcNote',
  'eligibilityCandidates', 'eligibilityLead', 'eligibilityFallback',
  'ruleOutEvalRequest', 'ruleOutAsk504', 'ruleOutIEPCategoryReview',
  'accomCoreHeading', 'accomCoreLead',
  'requestPara', 'instrumentBlocks', 'evalDomains', 'ddConsider',
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

// ── F. Contrast floors for hand-tuned theme tokens ───────────────────────────
// Several tokens were picked per theme to JUST clear WCAG 2.1 AA (the field edge
// clears 3:1 by ~0.15 in Slate; the selected-chip hint clears 4.5:1 by ~0.1 in
// Warm). Retuning a neighbouring token (a paler --gray-50, a new --accent-soft)
// can drop them under the line with nothing visibly "broken", so the ratios are
// computed here from the token values in base :root and each theme block. A
// theme inherits any token it doesn't redefine. This checks the TOKEN pairs the
// CSS is known to render together; it can't see a rule that pairs other colors
// (that remains the contrast audit's job, see tests/README.md).
const declsOf = block => Object.fromEntries(
  [...block.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)]
    .map(m => [m[1], m[2].trim()])
);
// ':root ' (trailing space, no brace): cssBlockAfter searches for the first '{'
// AFTER the selector, so including the brace would skip to the next rule.
const baseTokens = declsOf(cssBlockAfter(':root '));
if (!baseTokens['--border-control']) throw new Error(
  'invariants.mjs: base :root block not found or lacks --border-control; update the contrast check.'
);
const resolveColor = (tokens, value, seen = []) => {
  const v = value.trim();
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) {
    if (seen.includes(ref[1]) || !(ref[1] in tokens)) throw new Error(
      `invariants.mjs: contrast check can't resolve ${ref[1]} (${[...seen, ref[1]].join(' -> ')}).`
    );
    return resolveColor(tokens, tokens[ref[1]], [...seen, ref[1]]);
  }
  if (!/^#[0-9a-f]{6}$/i.test(v)) throw new Error(
    `invariants.mjs: contrast check expects a 6-digit hex, got "${v}". ` +
    `If a token became a color-mix()/rgba(), extend resolveColor or drop that pair.`
  );
  return v;
};
const relLum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// [what, foreground, background, minimum]. '#ffffff' is literal white text.
const CONTRAST_PAIRS = [
  ['text-box edge on field fill',   '--border-control', '--gray-50',  3],
  ['text-box edge on card',         '--border-control', '--bg-card',  3],
  ['text-box edge on page surface', '--border-control', '--surface',  3],
  ['age hint on a resting chip',    '--gray-500',       '--bg-card',  4.5],
  // Base and Warm render the selected chip (and its hint, via color:inherit) as
  // --accent-hover on --accent-soft. Slate overrides that rule; checked anyway.
  ['hint on a selected chip',       '--accent-hover',   '--accent-soft', 4.5],
  ['white text on copy button',     '#ffffff',          '--btn-green', 4.5],
  ['white text on copy button hover', '#ffffff',        '--btn-green-hover', 4.5],
];
const contrastThemes = [['Current', baseTokens], ...themeBlocks.map(([n, b]) => [n, { ...baseTokens, ...declsOf(b) }])];
for (const [themeName, tokens] of contrastThemes) {
  for (const [what, fg, bg, min] of CONTRAST_PAIRS) {
    const col = t => t.startsWith('#') ? t : resolveColor(tokens, `var(${t})`);
    const label = t => t.startsWith('#') ? t : `${t} ${col(t)}`;
    const r = contrast(col(fg), col(bg));
    if (r < min) failures.push(
      `Contrast (${themeName} theme): ${what} is ${r.toFixed(2)}:1, under the ${min}:1 WCAG AA floor ` +
      `(${label(fg)} on ${label(bg)}).`
    );
  }
}

// Text-entry fields get their edge from the base :where(...) rule. An inline
// `border` on one re-opens the per-field drift that rule exists to prevent.
const inlineBorderFields = [...html.matchAll(/<(?:textarea|select|input\b(?=[^>]*type="(?:text|number|search)"))[^>]*style="[^"]*\bborder(?:-color)?:[^"]*"[^>]*>/g)]
  .map(m => (m[0].match(/id="([^"]+)"/) || [, m[0].slice(0, 60)])[1]);
for (const f of inlineBorderFields) failures.push(
  `Text-entry field "${f}" sets an inline border; drop it so the base :where(textarea,select,input…) ` +
  `rule supplies the accessible --border-control edge.`
);

// ── G. Golden fixtures only set values a page control can actually produce ───
// Each fixture writes the state object `S` directly in its apply(S), bypassing
// the form. That is what lets the golden lane run without a browser, but it also
// means a typo or a stale key (`S.langLevel = 'singleWords'` when the radio is
// `singleWord`; `S.abaTargets.add('comm')` when the checkbox is `functional_comm`)
// is never rejected by anything: the value falls through to the default prose and
// the golden faithfully snapshots a state no clinician can reach. Eleven fixtures
// had drifted that way before this check existed (one of them was recommending a
// preschool social-skills group for a child meant to be single-word, because the
// stale key read as "no language level set"). This makes the class impossible to
// reintroduce.
//
// The allowed values come from the page markup itself, read as text: every
// checkbox/radio `<input>` keyed by data-key (multi-select Sets), data-bind or
// name (scalar radios), and the handful of `<select id="…Sel">` menus whose
// options the JS copies into S. Only keys the page defines are checked; a state
// field with no control (free text, booleans, derived or override state) is
// ignored, and '' is always allowed because it is every scalar's unset value.
// Fixtures that import another fixture as a base only have their OWN source
// scanned; the base is scanned when its own file comes up.
//
// Exemption: needsBehavior 'rigidity' has no checkbox on purpose. The app derives
// it from DSM-5 criterion B2 (see the "rigidity has no standalone checkbox"
// comment near syncABATargetsFromNeeds), so a fixture that checks b2 and sets
// rigidity is reproducing exactly what the page would do.
const FIXTURE_VALUE_EXEMPTIONS = [['needsBehavior', 'rigidity']];
// `<select id="paeDrinksSel">` feeds S.paeQuantity, not S.paeDrinks; every other
// `…Sel` menu feeds the S field of the same name (see the getElementById reads
// in the eval-pathway and prenatal-alcohol handlers).
const SELECT_ID_TO_KEY = { paeDrinksSel: 'paeQuantity' };
// `data-key="single"` checkboxes are booleans whose VALUE names the S field
// (S.feeding = true), so there is nothing to compare a value against.
const BOOLEAN_CHECKBOX_KEY = 'single';

const controlValues = new Map(); // S key -> Set of values the page can produce
const addControlValue = (key, value) => {
  if (value.includes('${')) return; // a JS template, not a literal option
  if (!controlValues.has(key)) controlValues.set(key, new Set());
  controlValues.get(key).add(value);
};
// (?<![\w-]) keeps `value=` from matching inside `data-value=` and `name=` from
// matching inside `data-sw-reason-name=`-style attributes.
const attrOf = (tag, name) => tag.match(new RegExp(`(?<![\\w-])${name}="([^"]*)"`))?.[1];
for (const [tag] of html.matchAll(/<input\b[^>]*>/g)) {
  const type = attrOf(tag, 'type');
  if (type !== 'checkbox' && type !== 'radio') continue;
  const key = attrOf(tag, 'data-key') ?? attrOf(tag, 'data-bind') ?? attrOf(tag, 'name');
  const value = attrOf(tag, 'value');
  if (!key || value === undefined || key === BOOLEAN_CHECKBOX_KEY) continue;
  addControlValue(key, value);
}
for (const m of html.matchAll(/<select\b[^>]*\bid="(\w+Sel)"[^>]*>([\s\S]*?)<\/select>/g)) {
  const key = SELECT_ID_TO_KEY[m[1]] ?? m[1].replace(/Sel$/, '');
  for (const o of m[2].matchAll(/<option\b[^>]*\bvalue="([^"]*)"/g)) addControlValue(key, o[1]);
}
if (controlValues.size < 20) throw new Error(
  `invariants.mjs: only ${controlValues.size} keyed controls were read from autism-ap-builder.html; ` +
  `the <input>/<select> parse in section G no longer matches the markup.`
);

// Everything between `forEach(` and its matching `)`, skipping quoted strings so
// a parenthesis inside a label can't end the scan early.
const callBodyAfter = (src, openParenIdx) => {
  let depth = 0, quote = null;
  for (let k = openParenIdx; k < src.length; k++) {
    const ch = src[k];
    if (quote) { if (ch === '\\') k++; else if (ch === quote) quote = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === '(') depth++;
    else if (ch === ')' && --depth === 0) return src.slice(openParenIdx, k);
  }
  return src.slice(openParenIdx);
};
const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

const fixturesDir = join(HERE, 'fixtures');
let fixtureWritesChecked = 0;
for (const file of readdirSync(fixturesDir).filter(f => f.endsWith('.mjs')).sort()) {
  const src = readFileSync(join(fixturesDir, file), 'utf8');
  const writes = []; // [key, value, line]
  // S.key = 'value'   (scalar; also dotted keys like S.therapyStatus.slp)
  for (const m of src.matchAll(/\bS\.([\w.]+)\s*=\s*(['"])(.*?)\2/g)) writes.push([m[1], m[3], lineOf(src, m.index)]);
  // S.key.add('value')
  for (const m of src.matchAll(/\bS\.([\w.]+)\.add\(\s*(['"])(.*?)\2\s*\)/g)) writes.push([m[1], m[3], lineOf(src, m.index)]);
  // ['a', 'b'].forEach(k => S.key.add(k))  — also the block form that adds to two Sets
  for (const m of src.matchAll(/\[([^\]]*)\]\.forEach\(\s*(\w+)\s*=>/g)) {
    const values = [...m[1].matchAll(/(['"])(.*?)\1/g)].map(x => x[2]);
    const body = callBodyAfter(src, m.index + m[0].lastIndexOf('('));
    const adds = [...body.matchAll(new RegExp(`\\bS\\.([\\w.]+)\\.add\\(\\s*${m[2]}\\s*\\)`, 'g'))].map(a => a[1]);
    for (const key of adds) for (const value of values) writes.push([key, value, lineOf(src, m.index)]);
  }
  for (const [key, value, line] of writes) {
    const allowed = controlValues.get(key);
    if (!allowed || value === '') continue;
    fixtureWritesChecked++;
    if (allowed.has(value)) continue;
    if (FIXTURE_VALUE_EXEMPTIONS.some(([k, v]) => k === key && v === value)) continue;
    failures.push(
      `Fixture tests/fixtures/${file}:${line} sets S.${key} to '${value}', which no page control can produce. ` +
      `The page offers: ${[...allowed].filter(Boolean).map(v => `'${v}'`).join(', ')}.`
    );
  }
}
if (!fixtureWritesChecked) failures.push(
  'Fixture values: no S.<key> writes were matched in tests/fixtures/*.mjs; update the section G fixture regexes.'
);

// ── H. Collapsed-by-default sections: SEC_TABLE and the markup agree ────────
// SEC_TABLE is the runtime authority for which form sections start collapsed, but
// the markup carries the same state (`sec-head collapsed` + `sec-body hidden` inert)
// so the first paint is right before the script runs. A row added to one side and
// not the other would flash open-then-shut on load, or stay open despite the table.
const secTableKeys = [...balancedAfter('const SEC_TABLE=').matchAll(/key:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const markupCollapsedKeys = [...html.matchAll(/id="sh-([^"]+)" class="sec-head collapsed"/g)].map(m => m[1]);
check('Collapsed sections (SEC_TABLE vs markup `sec-head collapsed`)',
  diff('SEC_TABLE', secTableKeys, 'markup', markupCollapsedKeys));
for (const k of secTableKeys) {
  const head = html.match(new RegExp(`id="sh-${k}" class="sec-head collapsed"[^\\n]*\\n\\s*<div class="([^"]*)"([^>]*)>`));
  if (!head) check('Collapsed sections', `no sec-body line follows the #sh-${k} head`);
  else if (head[1] !== 'sec-body hidden' || !/\binert\b/.test(head[2]))
    check('Collapsed sections', `#sh-${k}: body must be <div class="sec-body hidden" inert> to match its collapsed head (found class="${head[1]}"${head[2]})`);
}

// ── I. Export / restore: every reveal-on-check row is repainted on restore ───
// Restore writes S wholesale and fires no change handler, so paintFormFromState()
// recomputes sub-row visibility from SEL_SUBROWS. A row that a checkbox handler
// reveals but that table does not know stays hidden after a restore, with its
// restored sub-options invisible. Rows recomputed elsewhere on every render or by a
// named helper that restore also calls are exempt.
const SUBROW_RECOMPUTED = ['ritaTRow', 'evalStatusRow', 'withBifRow', 'menstrualCareRow', 'gaitExamRow'];
const hiddenRowIds = [...html.matchAll(/<[a-z]+\b[^>]*\bid="(\w+Row)"[^>]*display:none[^>]*>/g)].map(m => m[1]);
const subrowKeys = [...balancedAfter('const SEL_SUBROWS=').matchAll(/^\s*(\w+):\(\)=>/gm)].map(m => m[1]);
check('Restore sub-rows (hidden-by-default "...Row" ids vs SEL_SUBROWS + recomputed list)',
  diff('markup', hiddenRowIds, 'SEL_SUBROWS + exempt', [...subrowKeys, ...SUBROW_RECOMPUTED]));

// ── J. GDD cognitive-profile tier: one list, no inline copies ────────────────
// GDD_COG_PROFILES must hold exactly the gdd* cogProfile radios, and no other array
// literal may restate the tier. An inline copy that omitted the ungraded 'gdd' is how
// a GDD diagnosis once survived an age change to school-age.
const gddRadioVals = [...html.matchAll(/name="cogProfile" value="(gdd[^"]*)"/g)].map(m => m[1]);
const gddConst = html.match(/const GDD_COG_PROFILES=\[([^\]]*)\]/);
if (!gddConst) check('GDD tier list', 'const GDD_COG_PROFILES=[...] not found; update section J if it was renamed');
else check('GDD tier list (cogProfile gdd* radios vs GDD_COG_PROFILES)',
  diff('radios', gddRadioVals, 'GDD_COG_PROFILES', [...gddConst[1].matchAll(/'([^']+)'/g)].map(m => m[1])));
const inlineGddLists = (html.match(/\[[^\[\]\n]*'gdd_mild'[^\[\]\n]*\]/g) || []).length;
if (inlineGddLists > 1) check('GDD tier list',
  `${inlineGddLists - 1} inline array(s) restate the GDD tier; use GDD_COG_PROFILES instead`);

// Every reveal row must also say which fields live inside it (SEL_ROW_FIELDS), or a
// restored string could switch one of those fields on under an unticked parent.
const rowFieldKeys = [...balancedAfter('const SEL_ROW_FIELDS=').matchAll(/^\s*(\w+):\[/gm)].map(m => m[1]);
check('Restore sub-rows (SEL_SUBROWS vs SEL_ROW_FIELDS)', diff('SEL_SUBROWS', subrowKeys, 'SEL_ROW_FIELDS', rowFieldKeys));

// ── K. Export / restore: every saved field has a control restore can repaint ──
// The unit lane makes sure a new S property is classified in SEL_FIELDS. This makes
// sure the classified field is also reachable on the page: a 'flag' wired by id but
// missing from SEL_ID_FLAGS, or a 'one' whose menu is missing from SEL_MENUS, would
// export and decode fine and then never be shown after a restore.
const selFields = Object.fromEntries(
  [...balancedAfter('const SEL_FIELDS=').matchAll(/(\w+):'(one|flag|many|map)'/g)].map(m => [m[1], m[2]]));
if (Object.keys(selFields).length < 60) throw new Error(
  `invariants.mjs: only ${Object.keys(selFields).length} SEL_FIELDS entries parsed; the table's shape changed.`);
const idMapOf = marker => Object.fromEntries(
  [...balancedAfter(marker).matchAll(/(\w+):'(\w+)'/g)].map(m => [m[1], m[2]]));
const selMenus = idMapOf('const SEL_MENUS='), selIdFlags = idMapOf('const SEL_ID_FLAGS=');
const hasTag = re => re.test(html);
const singleFlags = new Set([...html.matchAll(/<input\b[^>]*data-key="single"[^>]*value="(\w+)"/g)].map(m => m[1]));
const modIds = [...html.matchAll(/\bid="mod_(\w+)"/g)].map(m => m[1]);
const planPillKeys = [...html.matchAll(/class="plan-pill" data-cv="(\w+)"/g)].map(m => m[1]);
const cogSpecExcl = [...balancedAfter('const COG_SPEC_EXCL').matchAll(/'(\w+)'/g)].map(m => m[1]);
const outcomeMenus = Object.fromEntries(
  [...html.matchAll(/<select\b[^>]*data-outcome-key="(\w+)"[^>]*>([\s\S]*?)<\/select>/g)]
    .map(m => [m[1], [...m[2].matchAll(/<option\b[^>]*\bvalue="([^"]+)"/g)].map(o => o[1])]));
const valuesOf = k => [...(controlValues.get(k) || [])].filter(v => v !== '');
const pcpRowIds = [...balancedAfter('const PCP_DEFS=').matchAll(/\{id:'(\w+)',group:'(\w+)'/g)].map(m => m[1]);
// 'many' fields with no checkbox group of their own: where their members come from.
const SEL_MANY_SOURCES = {
  langModifiers: () => modIds,
  specifiersManuallySet: () => cogSpecExcl,
  schoolSvcManualOff: () => valuesOf('schoolSvc'),
  comorbidInPlan: () => planPillKeys,
  // Rows of the primary care list. Their leave-out / move-up buttons are drawn by
  // render(), so the saved values come from the row table, not from markup.
  pcpOmit: () => pcpRowIds,
  pcpFirst: () => pcpRowIds,
};
const vocabulary = {}; // field -> {type, values}; what a version-N string may contain
for (const [k, t] of Object.entries(selFields)) {
  let values = [], problem = null;
  if (t === 'flag') {
    const id = selIdFlags[k];
    if (id ? !hasTag(new RegExp(`<input\\b[^>]*type="checkbox"[^>]*\\bid="${id}"`))
           : !(singleFlags.has(k) || hasTag(new RegExp(`<input\\b[^>]*data-key="${k}"`))))
      problem = id ? `SEL_ID_FLAGS points at #${id}, which is not a checkbox on the page`
                   : 'no data-key="single" checkbox, no data-key checkbox, and no SEL_ID_FLAGS entry';
  } else if (t === 'one') {
    values = valuesOf(k);
    if (selMenus[k] && !hasTag(new RegExp(`<select\\b[^>]*\\bid="${selMenus[k]}"`))) problem = `SEL_MENUS points at #${selMenus[k]}, which is not a menu on the page`;
    else if (!values.length) problem = 'no radio group named after it and no SEL_MENUS entry with options';
  } else if (t === 'many') {
    values = SEL_MANY_SOURCES[k] ? SEL_MANY_SOURCES[k]() : valuesOf(k);
    if (k === 'needsBehavior') values = [...values, 'rigidity']; // derived from criterion B2
    if (!values.length) problem = 'no checkbox group with this data-key and no SEL_MANY_SOURCES entry';
  } else {
    values = k === 'therapyStatus' ? Object.fromEntries([...controlValues.keys()].filter(c => c.startsWith('therapyStatus.')).map(c => [c.split('.')[1], valuesOf(c)]))
           : k === 'priorTestingOutcome' ? outcomeMenus
           : k === 'overrides' ? Object.fromEntries(ovInitKeys.map(o => [o, ['yes', 'no']]))
           : {};
    if (!Object.keys(values).length) problem = 'a map field this lane does not know how to read; teach section K where its controls are';
  }
  if (problem) check('Restore controls', `saved field "${k}" (${t}): ${problem}`);
  vocabulary[k] = { type: t, values };
}

// ── L. Export / restore: the version-N vocabulary is a contract ──────────────
// A selections string a clinician saved last month must still mean the same thing.
// tests/selections-vocabulary.json records every field and every option a string of
// the current SEL_VERSION may contain. Any difference from the page fails here:
//   - something ADDED is safe for old strings; refresh the snapshot.
//   - something REMOVED or RENAMED silently drops that selection from every saved
//     string. Bump SEL_VERSION and add a SEL_MIGRATIONS entry first; the refresh
//     refuses a removal while the version is unchanged.
// Refresh with: npm run test:update-selections
const VOCAB_PATH = join(dirname(fileURLToPath(import.meta.url)), 'selections-vocabulary.json');
const selVersion = Number(html.match(/SEL_PREFIX='APB', SEL_VERSION=(\d+)/)?.[1]);
const flatVocab = v => Object.entries(v).flatMap(([k, f]) => [
  `${k} (${f.type})`,
  ...(Array.isArray(f.values) ? f.values.map(x => `${k}=${x}`)
    : Object.entries(f.values).flatMap(([m, xs]) => xs.map(x => `${k}=${m}:${x}`)))]);
const saved = existsSync(VOCAB_PATH) ? JSON.parse(readFileSync(VOCAB_PATH, 'utf8')) : null;
const nowFlat = flatVocab(vocabulary), savedFlat = saved ? flatVocab(saved.fields) : [];
const vocabAdded = nowFlat.filter(x => !savedFlat.includes(x)), vocabRemoved = savedFlat.filter(x => !nowFlat.includes(x));
if (process.argv.includes('--update-selections')) {
  if (saved && vocabRemoved.length && selVersion === saved.version) {
    console.log(`\nRefusing to refresh ${VOCAB_PATH}:\n  removed or renamed since version ${saved.version}: ${vocabRemoved.join(', ')}\n` +
      `  Saved strings that use these would silently lose them. Bump SEL_VERSION and add a\n  SEL_MIGRATIONS[${saved.version}] entry in autism-ap-builder.html, then run this again.`);
    process.exit(1);
  }
  writeFileSync(VOCAB_PATH, JSON.stringify({ version: selVersion, fields: vocabulary }, null, 1) + '\n');
  console.log(`\nselections vocabulary written: version ${selVersion}, ${nowFlat.length} entries (+${vocabAdded.length} / -${vocabRemoved.length})`);
  process.exit(0);
}
if (!saved) check('Selections vocabulary', `${VOCAB_PATH} is missing; run npm run test:update-selections`);
else {
  if (saved.version !== selVersion) check('Selections vocabulary', `snapshot is version ${saved.version} but SEL_VERSION is ${selVersion}; run npm run test:update-selections once the migration is in place`);
  if (vocabRemoved.length) check('Selections vocabulary', `REMOVED or RENAMED since the version-${saved.version} snapshot: ${vocabRemoved.join(', ')}. ` +
    `Strings clinicians already saved would silently lose these. Restore them, or bump SEL_VERSION and add SEL_MIGRATIONS[${saved.version}], then run npm run test:update-selections`);
  if (vocabAdded.length) check('Selections vocabulary', `new since the snapshot (safe for old strings): ${vocabAdded.join(', ')}. ` +
    `Decide whether each new field belongs in SEL_TEMPLATE, then run npm run test:update-selections`);
}

// ── M. Export / restore: example strings in the docs are real ────────────────
// The README shows clinicians a literal selections string. Nothing else ties it to the
// page, so a SEL_VERSION bump, a renamed key, or a field moved out of SEL_TEMPLATE would
// leave a documented example that no longer restores as shown. Every "APB<n>;key=..."
// in the tracked docs must be the current version and use only vocabulary entries; an
// example marked scope=template may hold only SEL_TEMPLATE fields.
const selTemplate = new Set([...balancedAfter('const SEL_TEMPLATE=').matchAll(/'(\w+)'/g)].map(m => m[1]));
const ROOT = join(HERE, '..');
const DOC_FILES = ['README.md', 'CLAUDE.md', 'tests/README.md',
  ...readdirSync(join(ROOT, 'docs')).filter(f => /\.(md|html)$/.test(f)).map(f => 'docs/' + f)];
let docExamples = 0;
for (const f of DOC_FILES) {
  const text = readFileSync(join(ROOT, f), 'utf8');
  for (const m of text.matchAll(/APB(\d+);[\w=;,:%-]+/g)) {
    docExamples++;
    const bad = [], parts = m[0].replace(/;+$/, '').split(';').slice(1);
    const template = parts.includes('scope=template');
    if (Number(m[1]) !== selVersion) bad.push(`is version ${m[1]}, SEL_VERSION is ${selVersion}`);
    for (const p of parts) {
      if (p === 'scope=template') continue;
      const eq = p.indexOf('='), k = p.slice(0, eq), raw = p.slice(eq + 1), v = vocabulary[k];
      if (eq < 1 || !v) { bad.push(`"${p}" is not a saved field`); continue; }
      if (template && !selTemplate.has(k)) bad.push(`"${k}" is not exported at Template level`);
      const items = raw.split(',').map(decodeURIComponent);
      const wrong = v.type === 'flag' ? items.filter(x => x !== '0' && x !== '1')
        : v.type === 'map' ? items.filter(x => { const [mk, mv] = x.split(':'); return !(v.values[mk] || []).includes(mv); })
        : v.type === 'one' && items.length !== 1 ? items
        : items.filter(x => !v.values.includes(x));
      if (wrong.length) bad.push(`${k} cannot hold ${wrong.join(', ')}`);
    }
    if (bad.length) check('Doc example strings', `${f}: "${m[0]}" ${bad.join('; ')}. Correct the example to what the tool exports now.`);
  }
}
if (!docExamples) check('Doc example strings', 'no "APB<n>;..." example found in the docs; if the README example was removed on purpose, drop section M');

// ── report ───────────────────────────────────────────────────────────────────
console.log('');
console.log(
  `invariants: SW reasons ${swLabelKeys.length} keys; ` +
  `collapsed sections ${secTableKeys.length} table rows = ${markupCollapsedKeys.length} marked heads; ` +
  `overrides ${ovDefKeys.length} defs / ${ovInitKeys.length} state keys; ` +
  `ABA targets ${abaCheckboxKeys.length} checkboxes = ${tlKeys.length} TL labels; ` +
  `prior tests ${priorTestCheckboxKeys.length} checkboxes = ${priorTestLabelKeys.length} labels (${adaptiveTestKeys.length} adaptive); ` +
  `gait exam ${gaitExamKeys.length - GAIT_PLAN_INPUTS.length} findings = ${gaitLabelKeys.length} labels; ` +
  `behavior ${behaviorCheckboxKeys.length} checkboxes + ${BEHAVIOR_DERIVED.length} derived = ${behaviorSummaryKeys.length} summary labels; ` +
  `boundary pins ${PIN_TOKENS.length} guarded theme-independent; ` +
  `contrast ${CONTRAST_PAIRS.length} token pairs x ${contrastThemes.length} themes; ` +
  `IEP fields ${IEP_SHARED_FIELDS.length} shared across 3 surfaces; ` +
  `fixture values ${fixtureWritesChecked} writes checked against ${controlValues.size} page controls; ` +
  `restore sub-rows ${subrowKeys.length} table rows + ${SUBROW_RECOMPUTED.length} recomputed = ${hiddenRowIds.length} hidden rows; ` +
  `selections vocabulary v${selVersion}: ${Object.keys(selFields).length} fields, ${nowFlat.length} entries; ` +
  `doc example strings ${docExamples} checked`
);
for (const f of failures) console.log('✗ ' + f);
console.log('');
console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} — ${failures.length} invariant issue(s)`);
if (failures.length) process.exit(1);
