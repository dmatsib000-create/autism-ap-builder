// Unit-test lane for the pure clinical-decision functions behind specifier /
// BIF gating.
//
// Why a second lane: the golden harness (run.mjs) only calls the generators
// (generateNote, letter builders), which read the final S. The gating logic
// lives in DOM wrappers (toggleBifSpecifierGate, bridgeCogProfileToSpecifier)
// that fire only from onchange/render and early-return on the harness's
// null-returning querySelector — so the golden lane structurally can't reach
// them. But those wrappers are thin appliers over PURE deciders
// (bifSpecifierAllowed, currentClinicalPathway) that read S and touch no DOM.
// This lane tests those deciders directly: the gate predicate and the
// never-auto-bridge invariant at their source. See tests/README.md.
//
// Each case gets a FRESH app via makeApp() (the script is re-evaluated, so no
// state leaks between cases through the shared module-scope S). A case mutates
// app.S, then asserts on a decider's return with node:assert (throws on fail).
//
//   node tests/unit.mjs          run the unit lane
//   npm run test:unit            same, via package.json
//   npm test                     golden lane then this lane

import assert from 'node:assert/strict';
import { makeApp } from './harness.mjs';

// { name, setup(S), check(app) } — check throws on failure.
const CASES = [
  // ── bifSpecifierAllowed(): true iff cogProfile==='borderline' AND a source ──
  { name: 'BIF gate open: borderline + comprehensive',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), true); } },
  { name: 'BIF gate open: borderline + prior outside eval',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='priorExternal'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), true); } },
  { name: 'BIF gate open: borderline + screener',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='screener'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), true); } },
  { name: 'BIF gate closed: borderline, no data source',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource=''; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), false); } },
  { name: 'BIF gate closed: average profile (wrong profile, has source)',
    setup(S){ S.cogProfile='average'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), false); } },
  { name: 'BIF gate closed: unknown profile',
    setup(S){ S.cogProfile='unknown'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), false); } },
  { name: 'BIF gate closed: no profile selected',
    setup(S){ S.cogProfile=''; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.bifSpecifierAllowed(), false); } },

  // ── currentClinicalPathway().specKey: the auto-bridge decision ──
  // Borderline is NEVER auto-bridged (specKey:null), gate open or closed
  // (Greenspan 2017) — the clinician checks withBIF manually.
  { name: 'BIF never auto-bridged: borderline + source -> specKey null',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, null); } },
  { name: 'BIF never auto-bridged: borderline, no source -> specKey null',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource=''; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, null); } },

  // ID: withID only on comprehensive/priorExternal source + formally-impaired
  // adaptive + standardized adaptive evidence; otherwise withSuspectedID.
  { name: 'ID confirmed: id_mild + comprehensive + impaired + standardized -> withID',
    setup(S){ S.cogProfile='id_mild'; S.cogDataSource='comprehensive'; S.adaptProfile='mildlyImpaired'; S.adaptiveStandardized=true; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withID'); } },
  { name: 'ID suspected: id_mild + screener (source cannot confirm) -> withSuspectedID',
    setup(S){ S.cogProfile='id_mild'; S.cogDataSource='screener'; S.adaptProfile='mildlyImpaired'; S.adaptiveStandardized=true; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withSuspectedID'); } },
  { name: 'ID suspected: id_mild + comprehensive but adaptive not standardized -> withSuspectedID',
    setup(S){ S.cogProfile='id_mild'; S.cogDataSource='comprehensive'; S.adaptProfile='mildlyImpaired'; S.adaptiveStandardized=false; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withSuspectedID'); } },

  // GDD: withGDD on a confirming source (no standardized-adaptive requirement);
  // otherwise withSuspectedGDD.
  { name: 'GDD confirmed: gdd + comprehensive -> withGDD',
    setup(S){ S.cogProfile='gdd'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withGDD'); } },
  { name: 'GDD suspected: gdd + screener -> withSuspectedGDD',
    setup(S){ S.cogProfile='gdd'; S.cogDataSource='screener'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withSuspectedGDD'); } },

  // Normal range: withoutID for older, withoutGDD for under-5 (DSM-5 ID age rule).
  { name: 'Normal range, school-age -> withoutID',
    setup(S){ S.cogProfile='average'; S.ageGroup='schoolAge'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withoutID'); } },
  { name: 'Normal range, preschool (under 5) -> withoutGDD',
    setup(S){ S.cogProfile='average'; S.ageGroup='preschool'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, 'withoutGDD'); } },

  // Unknown -> no specifier; no profile -> no pathway at all.
  { name: 'Unknown profile -> specKey null',
    setup(S){ S.cogProfile='unknown'; },
    check(a){ assert.equal(a.currentClinicalPathway().specKey, null); } },
  { name: 'No profile selected -> pathway null',
    setup(S){ S.cogProfile=''; },
    check(a){ assert.equal(a.currentClinicalPathway(), null); } },

  // ── toggleBifSpecifierGate() cleanup wiring (DOM wrapper) ──
  // The gate is the only direct enforcement that an unsupported withBIF can't
  // survive on the chart (the note prose does NOT re-check the gate on the base
  // label). The harness's null querySelector would normally early-return this
  // function; each case below injects a mutable fake checkbox so the cleanup
  // branch runs against the real S. Same `cb` object is visible to the injected
  // querySelector and the post-call assertion via the enclosing IIFE. Each `cb`
  // is built once at module load; the runner executes every case exactly once, so
  // that's fine — but do not add repeat/retry to the loop without resetting `cb`.
  (() => {
    const cb = { checked: true, disabled: false };
    return {
      name: 'Gate cleanup: borderline + no source -> withBIF removed',
      querySelector: s => s.includes('withBIF') ? cb : null,
      setup(S){ S.cogProfile='borderline'; S.cogDataSource=''; S.specifiers.add('withBIF'); },
      check(a){ a.toggleBifSpecifierGate();
                assert.equal(a.S.specifiers.has('withBIF'), false, 'withBIF should be deleted');
                assert.equal(cb.checked, false, 'checkbox should be unchecked');
                assert.equal(cb.disabled, true, 'checkbox should be disabled'); } };
  })(),
  (() => {
    const cb = { checked: true, disabled: false };
    return {
      name: 'Gate cleanup: wrong profile (average) -> withBIF removed',
      querySelector: s => s.includes('withBIF') ? cb : null,
      setup(S){ S.cogProfile='average'; S.cogDataSource='comprehensive'; S.specifiers.add('withBIF'); },
      check(a){ a.toggleBifSpecifierGate();
                assert.equal(a.S.specifiers.has('withBIF'), false, 'withBIF should be deleted');
                assert.equal(cb.checked, false, 'checkbox should be unchecked'); } };
  })(),
  (() => {
    const cb = { checked: true, disabled: false };
    return {
      name: 'Gate open: borderline + comprehensive -> withBIF retained',
      querySelector: s => s.includes('withBIF') ? cb : null,
      setup(S){ S.cogProfile='borderline'; S.cogDataSource='comprehensive'; S.specifiers.add('withBIF'); },
      check(a){ a.toggleBifSpecifierGate();
                assert.equal(a.S.specifiers.has('withBIF'), true, 'withBIF should be retained');
                assert.equal(cb.disabled, false, 'checkbox should be enabled'); } };
  })(),
];

let pass = 0;
const failures = [];
for (const c of CASES) {
  // A case may inject a custom document.querySelector (gate-wiring cases hand a
  // mutable fake checkbox to toggleBifSpecifierGate); otherwise default null DOM.
  const app = makeApp(c.querySelector ? { querySelector: c.querySelector } : undefined);
  c.setup(app.S);
  try {
    c.check(app);
    pass++;
  } catch (err) {
    failures.push(`${c.name}\n    ${err.message.replace(/\n/g, '\n    ')}`);
  }
}

console.log('');
for (const f of failures) console.log('✗ ' + f);
console.log('');
console.log(`${pass} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
