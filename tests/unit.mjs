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

  // ── bifIdRisk(): "ID not yet excluded" ──
  // Borderline reached by a brief screener or clinical impression has NOT excluded
  // intellectual disability (comprehensive testing may land in the ID range, and a
  // confirmed borderline score plus impaired adaptive functioning can still support
  // ID). Drives the summary qualifier and the confirmatory-evaluation referral.
  // Derived only — it must never assert a specifier (see the invariant case below).
  { name: 'ID risk: borderline + screener -> true (the KBIT-2R case)',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='screener'; },
    check(a){ assert.equal(a.bifIdRisk(), true); } },
  { name: 'ID risk: borderline + clinical impression -> true',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='clinical'; },
    check(a){ assert.equal(a.bifIdRisk(), true); } },
  { name: 'ID risk: borderline + comprehensive -> false (nothing left to confirm)',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='comprehensive'; },
    check(a){ assert.equal(a.bifIdRisk(), false); } },
  { name: 'ID risk: borderline + prior outside eval -> false (own attribution path)',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='priorExternal'; },
    check(a){ assert.equal(a.bifIdRisk(), false); } },
  { name: 'ID risk: borderline with no source -> false (nothing to qualify yet)',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource=''; },
    check(a){ assert.equal(a.bifIdRisk(), false); } },
  { name: 'ID risk: low-average + screener -> false (borderline only, not adjacent tiers)',
    setup(S){ S.cogProfile='lowAverage'; S.cogDataSource='screener'; },
    check(a){ assert.equal(a.bifIdRisk(), false); } },
  { name: 'ID risk never asserts a specifier (derived-only invariant)',
    setup(S){ S.cogProfile='borderline'; S.cogDataSource='screener'; },
    check(a){ a.bifIdRisk();
              assert.equal(a.S.specifiers.has('withSuspectedID'), false, 'ID risk must not set withSuspectedID');
              assert.equal(a.S.specifiers.has('withBIF'), false, 'ID risk must not auto-assert withBIF');
              assert.equal(a.currentClinicalPathway().specKey, null, 'borderline must stay un-bridged'); } },

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

  // ── syncABATargetsFromNeeds(): behavior -> ABA-target mapping (DOM wrapper) ──
  // The sync fires from onchange/render in the app and add()s keys to S.abaTargets;
  // the golden lane can't reach it (fixtures set S.abaTargets directly). These cases
  // lock the two fixes from the §4 review (Unit 1, council 2026-06-02): D1 noncompliance
  // must map to instructional_control (and NOT stereotypy), and D2 reduce_stereotypy
  // must NOT fire on a non-repetitive interfering behavior. Both would FAIL pre-fix.
  { name: 'D1: noncompliance -> instructional_control, not stereotypy',
    setup(S){ S.needsBehavior.add('noncompliance'); },
    check(a){ a.syncABATargetsFromNeeds();
              assert.equal(a.S.abaTargets.has('instructional_control'), true, 'noncompliance should add instructional_control');
              assert.equal(a.S.abaTargets.has('reduce_stereotypy'), false, 'noncompliance must NOT add reduce_stereotypy'); } },
  { name: 'D2: aggression alone does not add reduce_stereotypy',
    setup(S){ S.needsBehavior.add('aggression'); },
    check(a){ a.syncABATargetsFromNeeds();
              assert.equal(a.S.abaTargets.has('reduce_aggression'), true, 'aggression should add reduce_aggression');
              assert.equal(a.S.abaTargets.has('reduce_stereotypy'), false, 'aggression alone must NOT add reduce_stereotypy'); } },
  { name: 'Stereotypy positive control: criteria B1 -> reduce_stereotypy',
    setup(S){ S.criteriaB.add('b1'); },
    check(a){ a.syncABATargetsFromNeeds();
              assert.equal(a.S.abaTargets.has('reduce_stereotypy'), true, 'b1 (repetitive movements) should add reduce_stereotypy'); } },
  { name: 'Stereotypy positive control: vocalDisruption -> reduce_stereotypy',
    setup(S){ S.needsBehavior.add('vocalDisruption'); },
    check(a){ a.syncABATargetsFromNeeds();
              assert.equal(a.S.abaTargets.has('reduce_stereotypy'), true, 'disruptive vocalizations should add reduce_stereotypy'); } },

  // ── syncSchoolSvcFromNeeds(): academic -> psychoed wiring (Unit 5, DOM wrapper) ──
  // A flagged academic concern routes to the 'psychoed' school service (the IDEA
  // psychoeducational-evaluation request) for preschool and up, deduped via the Set with
  // the suspected-SLD and hyperlexia triggers. The golden lane can't reach this (fixtures
  // set S.schoolSvc directly and never run the sync), so the causation is locked here.
  { name: 'Unit 5: academic (school-age) -> psychoed added',
    setup(S){ S.academic=true; S.ageGroup='schoolAge'; },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), true, 'academic should add psychoed for school-age'); } },
  { name: 'Unit 5: academic (preschool) -> psychoed added (age-gate lower bound)',
    setup(S){ S.academic=true; S.ageGroup='preschool'; },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), true, 'academic should add psychoed for preschool'); } },
  { name: 'Unit 5: academic (toddler) -> psychoed NOT added (Part C, not Part B)',
    setup(S){ S.academic=true; S.ageGroup='toddler'; },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), false, 'toddlers are served under Part C; no Part B psychoed eval'); } },
  { name: 'Unit 5: academic + suspected SLD -> psychoed deduped to one Set entry',
    setup(S){ S.academic=true; S.ageGroup='schoolAge'; S.comorbid.add('ld_suspected'); },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), true, 'psychoed present');
              assert.equal([...a.S.schoolSvc].filter(s=>s==='psychoed').length, 1, 'psychoed must appear exactly once (Set dedup across triggers)'); } },
  { name: 'Unit 5: academic but psychoed manually off -> not re-added',
    setup(S){ S.academic=true; S.ageGroup='schoolAge'; S.schoolSvcManualOff.add('psychoed'); },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), false, 'a manual uncheck of psychoed must be respected'); } },
  { name: 'Unit 5 negative control: no academic / no SLD -> no psychoed',
    setup(S){ S.ageGroup='schoolAge'; },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('psychoed'), false, 'psychoed must not auto-fire without a driver'); } },

  // ── evalPathSteps(): the workup-completion resolver ──
  // Role mapping, completion booleans, and the pendingTesting predicate that drives the
  // Family Resources ABA-waitlist wording. The ''-status defaults must map 1:1 onto the
  // retired cars2Done behavior (default-state notes byte-identical across the fold).
  { name: 'evalPathSteps: certainOlder has both step roles',
    setup(S){ S.dxEvalPath='certainOlder'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, true); assert.equal(st.hasDx, true); assert.equal(st.dxTodayAllowed, true); } },
  { name: 'evalPathSteps: certainYoung is dx-only, today allowed',
    setup(S){ S.dxEvalPath='certainYoung'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, false); assert.equal(st.hasDx, true); assert.equal(st.dxTodayAllowed, true); } },
  { name: 'evalPathSteps: uncertainComp is dx-only, today NOT allowed (outside report)',
    setup(S){ S.dxEvalPath='uncertainComp'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, false); assert.equal(st.hasDx, true); assert.equal(st.dxTodayAllowed, false); } },
  { name: 'evalPathSteps: uncertainADOS has both roles, today deferred to P1',
    setup(S){ S.dxEvalPath='uncertainADOS'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, true); assert.equal(st.hasDx, true); assert.equal(st.dxTodayAllowed, false); } },
  { name: 'evalPathSteps: ritaT has no status controls (same-day by construction)',
    setup(S){ S.dxEvalPath='ritaT'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, false); assert.equal(st.hasDx, false); assert.equal(st.pendingTesting, false); } },
  { name: 'evalPathSteps: pendingTesting true on scheduled instrument-bearing path (old !cars2Done)',
    setup(S){ S.dxEvalPath='certainYoung'; },
    check(a){ assert.equal(a.evalPathSteps().pendingTesting, true); } },
  { name: 'evalPathSteps: administered today clears pendingTesting (old cars2Done=true)',
    setup(S){ S.dxEvalPath='certainYoung'; S.evalDxStatus='today'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.dxDone, true); assert.equal(st.pendingTesting, false); } },
  { name: 'evalPathSteps: completed comprehensive eval clears pendingTesting (new capability)',
    setup(S){ S.dxEvalPath='uncertainComp'; S.evalDxStatus='done'; S.evalDxOutcome='consistent'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.dxDone, true); assert.equal(st.dxOutcome, 'consistent'); assert.equal(st.pendingTesting, false); } },
  { name: 'evalPathSteps: devOnly never pends testing; profile completion tracked',
    setup(S){ S.dxEvalPath='devOnly'; S.evalProfileStatus='done'; },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.pendingTesting, false); assert.equal(st.profileDone, true); assert.equal(st.hasDx, false); } },
  { name: 'evalPathSteps: statuses ignored on a path without that role (stale-state guard)',
    setup(S){ S.dxEvalPath='certainYoung'; S.evalProfileStatus='done'; },
    check(a){ assert.equal(a.evalPathSteps().profileDone, false, 'profile status must not count on a dx-only path'); } },
  { name: 'evalPathSteps: outcome only reported once the dx step is done',
    setup(S){ S.dxEvalPath='certainOlder'; S.evalDxOutcome='consistent'; },
    check(a){ assert.equal(a.evalPathSteps().dxOutcome, '', 'an outcome without a completed step must not surface'); } },
  { name: 'evalPathSteps: no path selected -> inert',
    setup(S){ },
    check(a){ const st=a.evalPathSteps();
              assert.equal(st.hasProfile, false); assert.equal(st.hasDx, false); assert.equal(st.pendingTesting, false); } },
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
