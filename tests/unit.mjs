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

  // ── gaitFindings(): toe walking / gait decisions ([gelfer-2024], [haynes-2018], [noritz-2013]) ──
  { name: 'gait: no gait need -> inactive, and stale exam findings are inert',
    setup(S){ S.gaitExam.add('lmn'); S.gaitExam.add('contracture'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.active, false);
              assert.equal(g.needsCK||g.needsNeuro||g.ptIndicated, false, 'exam findings must not count without a gait need'); } },
  { name: 'gait: toe walking alone -> observe only (no PT, neurology, or CK)',
    setup(S){ S.needsMotor.add('toeWalk'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.observeOnly, true);
              assert.equal(g.ptIndicated||g.needsNeuro||g.needsCK, false); } },
  { name: 'gait: toe walking + contracture -> PT, not neurology',
    setup(S){ S.needsMotor.add('toeWalk'); S.gaitExam.add('contracture'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.ptIndicated, true);
              assert.equal(g.needsNeuro, false, 'contracture alone is not a neurologic red flag'); } },
  { name: 'gait: gait concerns alone -> PT',
    setup(S){ S.needsMotor.add('gait'); },
    check(a){ assert.equal(a.gaitFindings().ptIndicated, true); } },
  { name: 'gait: each red flag -> neurology',
    setup(S){ S.needsMotor.add('toeWalk'); },
    check(a){ for(const k of ['asymmetric','umn','lmn','lateOnset','history']){
                a.S.gaitExam.clear(); a.S.gaitExam.add(k);
                assert.equal(a.gaitFindings().needsNeuro, true, k+' should trigger neurology'); } } },
  { name: 'gait: CK for LMN signs or hypotonia, not for UMN signs alone',
    setup(S){ S.needsMotor.add('toeWalk'); },
    check(a){ a.S.gaitExam.add('umn');
              assert.equal(a.gaitFindings().needsCK, false, 'UMN alone: MRI, not CK');
              assert.equal(a.gaitFindings().needsMRI, true);
              a.S.gaitExam.add('lmn');
              assert.equal(a.gaitFindings().needsCK, true, 'LMN signs -> CK');
              a.S.gaitExam.clear(); a.S.needsMotor.add('hypotonia');
              assert.equal(a.gaitFindings().needsCK, true, 'hypotonia + toe walking -> CK'); } },
  { name: 'gait: hypotonia without a gait need does not trigger CK',
    setup(S){ S.needsMotor.add('hypotonia'); },
    check(a){ assert.equal(a.gaitFindings().needsCK, false); } },
  { name: 'gait: ABA fence - gait needs alone are not core motor needs',
    setup(S){ S.needsMotor.add('toeWalk'); S.needsMotor.add('gait'); },
    check(a){ assert.equal(a.hasCoreMotor(), false);
              a.S.needsMotor.add('fine');
              assert.equal(a.hasCoreMotor(), true); } },
  { name: 'gait: school PT added for gait concerns and for toe walking + contracture, not toe walking alone',
    setup(S){ S.ageGroup='schoolAge'; S.needsMotor.add('toeWalk'); },
    check(a){ a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('pt_school'), false, 'observation-only toe walking adds no school PT');
              a.S.gaitExam.add('contracture'); a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('pt_school'), true); } },

  // Watch-only path (council 2026-10-31): a family request or an unexaminable ankle sends
  // the child to outpatient PT, but never through ptIndicated, so no school PT or IEP content.
  { name: 'gait: family PT request -> outpatient PT only, no school PT',
    setup(S){ S.ageGroup='schoolAge'; S.needsMotor.add('toeWalk'); S.gaitExam.add('familyPT'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.familyPT, true); assert.equal(g.outpatientPT, true);
              assert.equal(g.ptIndicated, false, 'a family request must not set ptIndicated');
              a.syncSchoolSvcFromNeeds();
              assert.equal(a.S.schoolSvc.has('pt_school'), false, 'a family request must not add school PT'); } },
  { name: 'gait: ankle not assessed and heels never seen flat -> PT to measure',
    setup(S){ S.needsMotor.add('toeWalk'); S.gaitExam.add('notAssessed'); },
    check(a){ assert.equal(a.gaitFindings().ptMeasure, true);
              a.S.gaitExam.add('heelsFlat');
              assert.equal(a.gaitFindings().ptMeasure, false, 'heels seen flat: recheck instead of PT now'); } },
  { name: 'gait: family PT request survives a red flag (neurology path)',
    setup(S){ S.needsMotor.add('toeWalk'); S.gaitExam.add('familyPT'); S.gaitExam.add('history'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.observeOnly, false); assert.equal(g.needsNeuro, true);
              assert.equal(g.familyPT, true, 'a checked family request must not be dropped by a red flag');
              const note=a.generateNote().main;
              assert.match(note, /outpatient evaluation for toe walking at the family's request/); } },
  { name: 'gait: a checked contracture overrides "not assessed"',
    setup(S){ S.needsMotor.add('toeWalk'); S.gaitExam.add('contracture'); S.gaitExam.add('notAssessed'); },
    check(a){ assert.equal(a.gaitFindings().notAssessed, false);
              assert.doesNotMatch(a.generateNote().main, /not reliably assessed/); } },
  { name: 'gait: family PT request is ignored once PT is already indicated',
    setup(S){ S.needsMotor.add('toeWalk'); S.gaitExam.add('contracture'); S.gaitExam.add('familyPT'); },
    check(a){ const g=a.gaitFindings();
              assert.equal(g.ptIndicated, true); assert.equal(g.familyPT, false); } },

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

  // ── appendEvidence(): observation chip text joined onto evidence prose (reaches the note) ──
  { name: 'appendEvidence: empty box takes the chip text alone',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('   ', 'Hand flapping'), 'Hand flapping'); } },
  { name: 'appendEvidence: after a source heading joins with a space, not "; "',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('Direct observation: ', 'Hand flapping'), 'Direct observation: Hand flapping'); } },
  { name: 'appendEvidence: heading on a later line keeps earlier text intact',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('Toe walking\nParent report: ', 'Lines up toys'), 'Toe walking\nParent report: Lines up toys'); } },
  { name: 'appendEvidence: after existing text joins with "; "',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('Direct observation: Hand flapping', 'Toe walking'), 'Direct observation: Hand flapping; Toe walking'); } },
  { name: 'appendEvidence: after typed trailing ";" or "," does not double the separator',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('Hand flapping;', 'Toe walking'), 'Hand flapping; Toe walking');
              assert.equal(a.appendEvidence('Hand flapping,', 'Toe walking'), 'Hand flapping, Toe walking'); } },
  { name: 'appendEvidence: after a typed sentence ending in "." joins with a space, not ".; "',
    setup(S){ },
    check(a){ assert.equal(a.appendEvidence('Concerns since 18 months. ', 'Hand flapping'), 'Concerns since 18 months. Hand flapping'); } },

  // ── parseLabGroups(): labs box text -> note groups (text is never reworded) ──
  { name: 'parseLabGroups: empty or whitespace-only text yields no groups',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups(''), []); assert.deepEqual(a.parseLabGroups(' \n\n  \r\n'), []); } },
  { name: 'parseLabGroups: a colon-ended first line is the reason for the lines beneath it',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups('Pica:\nCBC\nFerritin\n\nVitamin D'),
              [{head:'Pica', tests:['CBC','Ferritin']}, {head:'Vitamin D', tests:[]}]); } },
  { name: 'parseLabGroups: a forgotten colon gives one item per line, in order',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups('Pica\nCBC'), [{head:'Pica', tests:[]}, {head:'CBC', tests:[]}]); } },
  { name: 'parseLabGroups: a one-line "reason: test" stays a single item as typed',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups('Hypotonia: CK'), [{head:'Hypotonia: CK', tests:[]}]); } },
  { name: 'parseLabGroups: CRLF, stray spaces, and pasted list markers are tidied',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups('  GDD:  \r\n- Chromosomal microarray\r\n• Fragile X \r\n \r\n* EEG'),
              [{head:'GDD', tests:['Chromosomal microarray','Fragile X']}, {head:'EEG', tests:[]}]); } },
  { name: 'parseLabGroups: hyphens inside a test name are kept',
    setup(S){ },
    check(a){ assert.deepEqual(a.parseLabGroups('25-OH vitamin D'), [{head:'25-OH vitamin D', tests:[]}]); } },

  // ── labOrderOverlap(): tool-only warnings for tests the note already writes ──
  { name: 'labOrderOverlap: EEG typed while the seizure checkbox orders one is a repeat',
    setup(S){ S.seizureConcern = true; S.labsOrdered = 'EEG'; },
    check(a){ assert.deepEqual(a.labOrderOverlap(), {genetics:false, repeats:['EEG (Medical Referrals)']}); } },
  { name: 'labOrderOverlap: EEG typed with no auto EEG line is not a repeat',
    setup(S){ S.labsOrdered = 'EEG'; },
    check(a){ assert.deepEqual(a.labOrderOverlap().repeats, []); } },
  { name: 'labOrderOverlap: a genetic test flags only when the genetics referral prints',
    setup(S){ S.labsOrdered = 'GDD:\nChromosomal microarray'; },
    check(a){ assert.equal(a.labOrderOverlap().genetics, false);
              a.S.diagStatus = 'confirmed';
              assert.equal(a.labOrderOverlap().genetics, true); } },
  { name: 'labOrderOverlap: CK repeats only when the gait plan recommends it',
    setup(S){ S.labsOrdered = 'CK'; S.needsMotor.add('toeWalk'); },
    check(a){ assert.deepEqual(a.labOrderOverlap().repeats, []);
              a.S.gaitExam.add('lmn');
              assert.deepEqual(a.labOrderOverlap().repeats, ['CK (gait plan)']); } },

  // ── Form-section defaults and auto-open (SEC_TABLE / sectionRelevance / secAutoOpenKeys) ──
  // Four rarely-entered sections start collapsed and open themselves once when they
  // gain content or become relevant. The DOM applier can't run here; these lock the
  // pure deciders it reads.
  { name: 'sections: the four collapsed-by-default sections, and only those',
    setup(){},
    check(a){ assert.deepEqual(a.SEC_TABLE.map(r=>r.key), ['medflags','comorbid','safety','overrides']); } },
  { name: 'sections: empty form -> nothing has content, nothing is relevant',
    setup(){},
    check(a){ const s=a.sectionRelevance();
              for (const k of Object.keys(s)) assert.deepEqual(s[k], {content:false, relevant:false}, k); } },
  { name: 'sections: elopement, self-injury, aggression, community safety, stranger danger each make Safety relevant',
    setup(){},
    check(a){ for (const set of [s=>s.needsBehavior.add('elopement'), s=>s.needsBehavior.add('sib'), s=>s.needsBehavior.add('aggression'),
                                 s=>s.needsAdaptive.add('commSafety'), s=>{s.strangerDanger=true;}]) {
                const fresh=makeApp(); set(fresh.S);
                assert.equal(fresh.sectionRelevance().safety.relevant, true);
                assert.equal(fresh.sectionRelevance().safety.content, false, 'relevance is not content');
              } } },
  { name: 'sections: an unrelated behavior (pica) does not make Safety relevant',
    setup(S){ S.needsBehavior.add('pica'); },
    check(a){ assert.equal(a.sectionRelevance().safety.relevant, false); } },
  { name: 'sections: a ticked safety box is content, independent of relevance',
    setup(S){ S.safety.add('water_counsel'); },
    check(a){ assert.deepEqual(a.sectionRelevance().safety, {content:true, relevant:false}); } },
  { name: 'sections: toe walking makes Medical Flags relevant; exam findings become content only once a gait need exists',
    setup(S){ S.gaitExam.add('contracture'); },
    check(a){ assert.deepEqual(a.sectionRelevance().medflags, {content:false, relevant:false}, 'stale exam findings alone');
              a.S.needsMotor.add('toeWalk');
              assert.deepEqual(a.sectionRelevance().medflags, {content:true, relevant:true}); } },
  { name: 'sections: labs typed or social work ticked is Medical Flags content',
    setup(S){ S.labsOrdered='CBC'; },
    check(a){ assert.equal(a.sectionRelevance().medflags.content, true);
              const b=makeApp(); b.S.socialWork=true;
              assert.equal(b.sectionRelevance().medflags.content, true); } },
  { name: 'sections: a comorbidity is Comorbid content',
    setup(S){ S.comorbid.add('anxiety'); },
    check(a){ assert.equal(a.sectionRelevance().comorbid.content, true); } },
  { name: 'sections: overrides count only a manual yes/no, never auto',
    setup(){},
    check(a){ assert.equal(a.sectionRelevance().overrides.content, false);
              a.S.overrides.pt='no';
              assert.equal(a.sectionRelevance().overrides.content, true); } },
  { name: 'secAutoOpenKeys: opens on a rising edge, never on steady or falling',
    setup(){},
    check(a){ const off={content:false,relevant:false}, c={content:true,relevant:false}, r={content:false,relevant:true};
              assert.deepEqual(a.secAutoOpenKeys({}, {safety:c}), ['safety'], 'first appearance of content');
              assert.deepEqual(a.secAutoOpenKeys({safety:c}, {safety:c}), [], 'steady content (a keystroke render)');
              assert.deepEqual(a.secAutoOpenKeys({safety:c}, {safety:off}), [], 'content removed: one-way, nothing closes');
              assert.deepEqual(a.secAutoOpenKeys({safety:c}, {safety:{content:true,relevant:true}}), ['safety'], 'relevance rises while content already true');
              assert.deepEqual(a.secAutoOpenKeys({}, {safety:r, medflags:c, comorbid:off}), ['safety','medflags'], 'two edges at once');
              assert.deepEqual(a.secAutoOpenKeys({safety:c}, {safety:off, medflags:c}), ['medflags'], 'a key missing from prev counts as all-false'); } },
  { name: 'secAutoOpenKeys: the keystroke sequence opens Safety exactly once',
    setup(S){ S.needsBehavior.add('elopement'); },
    check(a){ const c1=a.sectionRelevance();
              assert.deepEqual(a.secAutoOpenKeys({}, c1), ['safety']);
              a.S.strengths='loves trains';            // an unrelated keystroke
              assert.deepEqual(a.secAutoOpenKeys(c1, a.sectionRelevance()), []); } },

  // ── Export / restore selections ──
  // The string must carry clicked choices only. These cases lock the three promises the
  // panel makes: typed text never leaves, nothing but a page-control value comes back
  // in, and a version-1 string keeps meaning the same thing.
  { name: 'selections: every state field is classified exactly once (saved, typed, or view)',
    setup(){},
    check(a){ const all=[...Object.keys(a.SEL_FIELDS),...a.SEL_TYPED,...a.SEL_VIEW];
              assert.deepEqual([...all].sort(), Object.keys(a.initialState()).sort());
              assert.equal(new Set(all).size, all.length); } },
  { name: 'selections: field type matches the state shape',
    setup(){},
    check(a){ const init=a.initialState();
              for(const [k,t] of Object.entries(a.SEL_FIELDS)){
                const v=init[k];
                const shape=v instanceof Set?'many':typeof v==='boolean'?'flag':typeof v==='string'?'one':'map';
                assert.equal(t, shape, k);
              } } },
  { name: 'selections: an empty form exports the bare version prefix at both levels',
    setup(){},
    check(a){ assert.equal(a.encodeSelections('full'), 'APB1');
              assert.equal(a.encodeSelections('template'), 'APB1;scope=template');
              assert.equal(a.formHasAnything(), false); } },
  { name: 'selections: typed text is never exported',
    setup(S){ const init=S; for(const k of ['unevenCogDesc','strengths','asdLevelJustificationSC','asdLevelJustificationRRB','rtcInterval','labsOrdered','paeDetail','teacherMaterialOther','iepInstruments']) init[k]='ZZTYPED';
              Object.keys(S.ev).forEach(k=>{S.ev[k]='ZZTYPED';});
              Object.keys(S.behavFreq).forEach(k=>{S.behavFreq[k]='ZZTYPED';});
              S.priorTestingDate.ados2='2019'; S.priorTesting.add('ados2'); S.ageGroup='schoolAge'; },
    check(a){ for(const k of a.SEL_TYPED){ const v=a.S[k];
                assert.ok(typeof v==='string'?v:Object.values(v).some(Boolean), k+' was not filled by this test'); }
              const full=a.encodeSelections('full');
              assert.ok(!full.includes('ZZTYPED')); assert.ok(!full.includes('2019'));
              assert.equal(full, 'APB1;ageGroup=schoolAge;priorTesting=ados2');
              assert.equal(a.formHasAnything(), true); } },
  { name: 'selections: Template leaves out every child-specific and sensitive field',
    setup(S){ S.ageGroup='preschool'; S.diagStatus='confirmed'; S.cogProfile='gdd_mild'; S.criteriaB.add('b2');
              S.needsBehavior.add('tantrums'); S.needsBehavior.add('rigidity'); S.comorbid.add('trauma');
              S.prenatalAlcohol=true; S.socialWork=true; S.abaTargets.add('transitions'); S.schoolSvc.add('counseling'); S.overrides.pt='no'; },
    check(a){ assert.equal(a.encodeSelections('template'),
                'APB1;scope=template;ageGroup=preschool;needsBehavior=tantrums;overrides=pt:no');
              // Derived fields are filled by the syncs from omitted findings, so they stay out too.
              for(const k of ['schoolSvc','schoolSvcManualOff','abaTargets']) assert.ok(!a.SEL_TEMPLATE.has(k), k);
              const t=a.decodeSelections(a.encodeSelections('template'), {ageGroup:['preschool'],needsBehavior:['tantrums'],overrides:{pt:['yes','no']}});
              assert.equal(t.template, true); assert.deepEqual(t.ignored, []);
              assert.equal(a.decodeSelections(a.encodeSelections('full'), {}).template, false);
              for(const keys of Object.values(a.SEL_SENSITIVE)) for(const k of keys){
                assert.ok(k in a.SEL_FIELDS, k+' is not a saved field');
                assert.ok(!a.SEL_TEMPLATE.has(k), k+' is sensitive but exported at Template level'); }
              for(const k of a.SEL_TEMPLATE) assert.ok(k in a.SEL_FIELDS, k);
              assert.deepEqual(a.selSensitiveIn(a.encodeSelections('template')), []);
              assert.deepEqual(a.selSensitiveIn(a.encodeSelections('full')),
                ['mental-health and other diagnoses','prenatal alcohol exposure','family and social circumstances']); } },
  { name: 'selections: Full round-trips every field type, keeping Set click order',
    setup(S){ S.ageGroup='schoolAge'; S.ados2Module='Module 3'; S.showDSMTable=false; S.criteriaC=true;
              ['receptive','expressive'].forEach(v=>S.needsComm.add(v));
              S.therapyStatus.slp='continue'; S.priorTestingOutcome.ados2='consistent'; S.overrides.aba='yes'; },
    check(a){ const str=a.encodeSelections('full');
              assert.equal(str, 'APB1;ageGroup=schoolAge;criteriaC=1;needsComm=receptive,expressive;therapyStatus=slp:continue;priorTestingOutcome=ados2:consistent;ados2Module=Module%203;showDSMTable=0;overrides=aba:yes');
              const allowed={ageGroup:['schoolAge'],ados2Module:['Module 3'],needsComm:['expressive','receptive'],
                therapyStatus:{slp:['continue']},priorTestingOutcome:{ados2:['consistent']},overrides:{aba:['yes','no']}};
              const r=a.decodeSelections(str, allowed);
              assert.equal(r.version, 1); assert.deepEqual(r.ignored, []); assert.equal(r.applied, 9);
              assert.equal(r.state.ados2Module, 'Module 3'); assert.equal(r.state.showDSMTable, false);
              assert.equal(r.state.criteriaC, true); assert.deepEqual([...r.state.needsComm], ['receptive','expressive']);
              assert.deepEqual(r.state.therapyStatus, {slp:'continue'}); assert.deepEqual(r.state.overrides, {aba:'yes'}); } },
  { name: 'selections: whitespace from a wrapped paste is tolerated',
    setup(){},
    check(a){ const r=a.decodeSelections('  APB1;ageGroup=school\nAge ;\r\n needsComm=expressive ', {ageGroup:['schoolAge'],needsComm:['expressive']});
              assert.equal(r.state.ageGroup, 'schoolAge'); assert.equal(r.applied, 2); } },
  { name: 'selections: unknown keys, unknown values and typed fields are dropped, reported by key only',
    setup(){},
    check(a){ const r=a.decodeSelections(
                'APB1;ageGroup=Jane%20Doe;futureField=x;strengths=loves%20trains;needsComm=expressive,MRN12345;criteriaC=yes;overrides=aba:maybe,nope:yes;constructor=1;John Smith 3/4/2019',
                {ageGroup:['schoolAge'],needsComm:['expressive'],overrides:{aba:['yes','no']}});
              assert.deepEqual(Object.keys(r.state).sort(), ['needsComm','overrides']);
              assert.deepEqual([...r.state.needsComm], ['expressive']); assert.deepEqual(r.state.overrides, {});
              assert.equal(r.applied, 1);
              assert.deepEqual(r.ignored, ['ageGroup','futureField','strengths','needsComm','criteriaC','overrides','overrides','constructor','JohnSmith3/4/2019']);
              assert.ok(!JSON.stringify(r.state).match(/Jane|MRN|trains/)); } },
  { name: 'selections: a field with no page control is dropped rather than trusted',
    setup(){},
    check(a){ const r=a.decodeSelections('APB1;cogProfile=average', {});
              assert.deepEqual(r.state, {}); assert.deepEqual(r.ignored, ['cogProfile']); } },
  { name: 'selections: version is reported, and non-strings are rejected outright',
    setup(){},
    check(a){ assert.equal(a.SEL_VERSION, 1);
              assert.equal(a.decodeSelections('APB2;ageGroup=schoolAge', {ageGroup:['schoolAge']}).version, 2);
              for(const junk of ['', 'hello', 'APB;x=1', 'APBx1;ageGroup=schoolAge', 'The child is 7 years old; lives with mother'])
                assert.deepEqual(a.decodeSelections(junk, {}), {error:'not-a-selections-string'}); } },
  // Compatibility pin. This literal is what a clinician may already have saved. If this
  // case fails, a key or value was renamed: bump SEL_VERSION and add a SEL_MIGRATIONS
  // entry rather than editing the expected values here.
  { name: 'selections: a saved version-1 string still decodes to the same fields',
    setup(){},
    check(a){ const r=a.decodeSelections(
                'APB1;visitType=initial;ageGroup=preschool;langLevel=phrase;langModifiers=echolalic;needsComm=expressive,receptive;needsSocial=play,peer;schoolSvc=slp_school,social_skills_school;insuranceType=medicaid;abaTargets=functional_comm,joint_attention,imitation,play',
                {visitType:['initial'],ageGroup:['preschool'],langLevel:['phrase'],langModifiers:['echolalic'],needsComm:['expressive','receptive'],
                 needsSocial:['play','peer'],schoolSvc:['slp_school','social_skills_school'],insuranceType:['medicaid'],
                 abaTargets:['functional_comm','joint_attention','imitation','play']});
              assert.deepEqual(r.ignored, []); assert.equal(r.applied, 15);
              assert.deepEqual(Object.keys(r.state), ['visitType','ageGroup','langLevel','langModifiers','needsComm','needsSocial','schoolSvc','insuranceType','abaTargets']); } },
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
