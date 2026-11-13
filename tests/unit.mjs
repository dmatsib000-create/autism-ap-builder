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

  // ── Age change tears down a GDD-tier profile (GDD is not diagnosable after ~age 5) ──
  // Drives the real age-radio handler. The ungraded 'gdd' ("Unspecified delays") value
  // was once missing from the teardown list: the profile survived the move to
  // school-age, the bridge re-asserted the specifier, and the note printed a GDD
  // diagnosis. All four values are looped so a tier cannot be skipped again.
  ...['gdd','gdd_mild','gdd_moderate','gdd_severe'].map(tier => ({
    name: `Age preschool -> school-age clears cogProfile '${tier}', its specifier, and GDD note wording`,
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='preschool'; S.cogProfile=tier;
              S.cogDataSource='screener'; S.specifiers.add('withSuspectedGDD'); },
    check(a){ assert.match(a.generateNote().main, /Autism Spectrum Disorder \(ASD\), with[^\n]*Global Developmental Delay/, 'precondition: confirmed preschool note names GDD on the ASD line');
              a.S.ageGroup='schoolAge'; a.onAgeGroupChange();
              assert.equal(a.S.cogProfile, '', 'cogProfile cleared');
              assert.equal(a.S.cogDataSource, '', 'evidence flags cleared');
              assert.deepEqual([...a.S.specifiers].filter(k => /GDD/.test(k)), [], 'no GDD specifier');
              const n=a.generateNote();
              // Case-sensitive on purpose: the capitalized diagnosis name, not the lowercase
              // DSM-5 exclusion sentence ("not better explained by intellectual disability or
              // global developmental delay alone") or the genetics citation title, both of
              // which belong in a school-age note.
              assert.doesNotMatch(n.main+n.assessment+n.plan, /Global Developmental Delay|\bGDD\b|F88|developmental delays are present/, 'note free of a GDD diagnosis'); } })),
  { name: 'Age preschool -> toddler keeps a GDD profile (still age-valid)',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='preschool'; S.cogProfile='gdd'; S.cogDataSource='screener'; S.specifiers.add('withSuspectedGDD'); },
    check(a){ a.S.ageGroup='toddler'; a.onAgeGroupChange();
              assert.equal(a.S.cogProfile, 'gdd');
              assert.equal(a.S.specifiers.has('withSuspectedGDD'), true); } },

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
    setup(S){ const init=S; for(const k of ['unevenCogDesc','strengths','asdLevelJustificationSC','asdLevelJustificationRRB','rtcInterval','labsOrdered','paeDetail','teacherMaterialOther','iepInstruments','pcpExtra']) init[k]='ZZTYPED';
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
  { name: 'selections: selDropped names fields the form did not keep',
    setup(S){ S.ageGroup='schoolAge'; S.specifiers.add('withoutID'); S.therapyStatus.slp=''; S.showDSMTable=true; },
    check(a){ assert.deepEqual(a.selDropped({ageGroup:'schoolAge',specifiers:new Set(['withoutID']),therapyStatus:{},showDSMTable:true}), []);
              assert.deepEqual(a.selDropped({ageGroup:'schoolAge',specifiers:new Set(['withoutID','withSuspectedGDD']),therapyStatus:{slp:'continue'},showDSMTable:false}),
                ['specifiers','therapyStatus','showDSMTable']); } },
  { name: 'selections: a sub-option without its parent is reset, and reported as not kept',
    setup(S){ S.depressionSafety='positive';                       // no depression in comorbid
              S.comorbidInPlan.add('anxiety');                     // not in comorbid
              S.comorbid.add('trauma'); S.comorbidInPlan.add('trauma'); S.traumaIncludeInIEP=true;   // consistent: must survive
              S.paeEvidence.add('quantityFrequency'); S.paeQuantity='1_2';   // prenatalAlcohol off: both go, parent row first
              S.teacherMaterials.add('srs2'); S.teacherMaterialsReturned.add('srs2'); S.teacherMaterialsReturned.add('gars3');
              S.evalDxStatus='done'; S.evalDxOutcome='consistent';  // no evaluation path chosen
              S.socialWork=true; S.socialWorkReasons.add('financial'); },   // consistent
    check(a){ a.selPruneOrphans(); const S=a.S;
              assert.equal(S.depressionSafety, ''); assert.deepEqual([...S.comorbidInPlan], ['trauma']);
              assert.equal(S.traumaIncludeInIEP, true);
              assert.equal(S.paeEvidence.size, 0); assert.equal(S.paeQuantity, '');
              assert.deepEqual([...S.teacherMaterialsReturned], ['srs2']);
              assert.equal(S.evalDxStatus, ''); assert.equal(S.evalDxOutcome, '');
              assert.deepEqual([...S.socialWorkReasons], ['financial']);
              assert.deepEqual(a.selDropped({depressionSafety:'positive',comorbidInPlan:new Set(['anxiety','trauma']),socialWorkReasons:new Set(['financial'])}),
                ['depressionSafety','comorbidInPlan']);
              // every reveal row declares the fields inside it, and they are saved fields
              assert.deepEqual(Object.keys(a.SEL_ROW_FIELDS).sort(), Object.keys(a.SEL_SUBROWS).sort());
              for(const f of Object.values(a.SEL_ROW_FIELDS).flat()) assert.ok(f in a.SEL_FIELDS, f); } },
  { name: 'selections: pruning leaves a consistent form untouched',
    setup(S){ S.dxEvalPath='certainOlder'; S.evalProfileStatus='done'; S.evalDxStatus='today'; S.evalDxOutcome='consistent';
              S.comorbid.add('depression'); S.depressionSafety='positive'; S.needsAdaptive.add('commSafety'); S.strangerDanger=true;
              S.prenatalAlcohol=true; S.paeEvidence.add('quantityFrequency'); S.paeTiming='first'; },
    check(a){ const before=a.encodeSelections('full'); a.selPruneOrphans(); assert.equal(a.encodeSelections('full'), before); } },
  { name: 'selections: a repeated key is counted once, last one wins',
    setup(){},
    check(a){ const r=a.decodeSelections('APB1;ageGroup=toddler;ageGroup=schoolAge;needsComm=expressive;needsComm=receptive', {ageGroup:['toddler','schoolAge'],needsComm:['expressive','receptive']});
              assert.equal(r.state.ageGroup, 'schoolAge'); assert.deepEqual([...r.state.needsComm], ['receptive']); assert.equal(r.applied, 2); } },
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
  // ── Primary care list (PCP_DEFS / pcpBuild / pcpSections / pcpPruneEdits) ──
  // The list must be built only from selections, must always say whether this clinic
  // expects the child back, and must keep the clinician's edits attached to rows (never
  // to text), so a rebuilt list can neither invent a line nor lose a wording change.
  { name: 'pcp: row ids are unique and every row names a known group',
    setup(){},
    check(a){ const ids=a.PCP_DEFS.map(d=>d.id);
              assert.equal(new Set(ids).size, ids.length);
              for(const d of a.PCP_DEFS){ assert.ok(['act','manage','refer','other'].includes(d.group), d.id);
                // An action names who does it; the other two groups are addressed to primary care as a whole.
                assert.equal(!!d.owner, d.group==='act', d.id+' owner'); } } },
  { name: 'pcp: an empty form produces no row and nothing to copy',
    setup(){},
    check(a){ const b=a.pcpBuild();
              for(const g of Object.values(b.groups)) assert.deepEqual(g.rows, []);
              assert.equal(b.empty, true); assert.equal(a.generatePCPPlain(), ''); assert.equal(a.generatePCPHTML(false), '');
              assert.ok(!a.generateNote().main.includes('Recommendations for Primary Care')); } },
  { name: 'pcp: a diagnosis alone adds re-referral triggers but no action and no "manage" row',
    setup(S){ S.diagStatus='confirmed'; S.overrides.genetics='no'; S.overrides.card='no'; },
    check(a){ const b=a.pcpBuild();
              assert.deepEqual(b.groups.act.rows, []); assert.deepEqual(b.groups.manage.rows, []);
              assert.deepEqual(b.groups.refer.rows.map(r=>r.id), ['tNewConcern','tBehavior','tDocs']);
              // Loss of skills is sent to neurology, not back to this clinic.
              assert.deepEqual(b.groups.other.rows.map(r=>[r.id,r.text]), [['tRegress','The child loses language, social, or motor skills they already had: refer to pediatric neurology.']]);
              // No row may simply restate the diagnosis.
              for(const g of Object.values(b.groups)) for(const r of g.rows) assert.ok(!/autism spectrum disorder/i.test(r.text), r.id); } },
  { name: 'pcp: the list reaches the note only once a follow-up plan is chosen, and can be switched off',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; },
    check(a){ const has=()=>a.generateNote().main.includes('── Recommendations for Primary Care ──');
              assert.equal(has(), false);
              assert.ok(a.generateNote().main.includes('Return to clinic: {interval}'));
              a.S.dbpFollowUp='pcp'; assert.equal(has(), true);
              const m=a.generateNote().main;
              assert.ok(m.indexOf('── Recommendations for Primary Care ──')<m.indexOf('RETURN TO CLINIC'));
              assert.ok(m.includes('No routine return visit is scheduled (see Recommendations for Primary Care for when and how to return).'));
              assert.ok(!m.includes('{interval}'));
              a.S.pcpInNote=false; assert.equal(has(), false);
              assert.ok(a.generateNote().main.includes('\nNo routine return visit is scheduled.\n'));
              assert.ok(a.generatePCPPlain().startsWith('RECOMMENDATIONS FOR PRIMARY CARE')); } },
  { name: 'pcp: follow-up line is the standing line only when nothing is left with this clinic',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.dbpFollowUp='pcp'; },
    check(a){ const lines=()=>a.pcpBuild().followUp, line=()=>lines()[0];
              const route='How to come back: within 2 years of the last visit, the family or your office can call us directly at (352) 265-8250. No new referral is needed. After 2 years, or if the child was dismissed from our clinic, please send a new referral.';
              assert.deepEqual(lines(), ['No routine DBP visits are planned; you can follow the child with the plan below. This is not a discharge: the child remains in our care and can return as needed. We are glad to see the child and family again for any reason listed under "Re-refer to DBP if". Thank you for caring for this child.', route]);
              // A typed return interval is a visit, so the standing line gives way to it.
              a.S.rtcInterval='6 months';
              assert.equal(line(), 'We will see the child for one more visit in 6 months {purpose of the return visit}. After that visit, no routine DBP visits are planned. This is not a discharge: the child remains in our care and can return as needed.');
              assert.equal(lines()[1], route, 'the way back is stated whenever routine visits stop');
              a.S.rtcInterval='as needed'; assert.ok(line().startsWith('No routine DBP visits are planned;'));
              // Open work in the form overrides it and names what the visit is for.
              a.S.rtcInterval=''; a.S.teacherMaterials.add('srs2');
              assert.ok(line().startsWith('We will see the child for one more visit to review the rating forms requested from school. After that visit, no routine DBP visits are planned'));
              assert.ok(a.generateNote().main.includes('Return to clinic: {interval}'), 'a visit is owed, so the interval stop stays');
              a.S.teacherMaterialsReturned.add('srs2'); assert.ok(line().startsWith('No routine DBP visits are planned;'));
              // An unfinished diagnostic evaluation is never handed back, and nothing is promised
              // about follow-up after it (attending, 2026-11-13).
              a.S.diagStatus='suspected';
              assert.deepEqual(lines(), ["We will see the child again in {interval} to complete the autism diagnostic evaluation. We will send the follow-up plan in that visit's note."]);
              a.S.diagStatus='confirmed'; a.S.comorbid.add('adhd_suspected'); a.S.comorbidInPlan.add('adhd_suspected');
              assert.ok(line().includes('one more visit to complete the ADHD evaluation'));
              a.S.rtcInterval='2 months'; assert.ok(line().includes('one more visit in 2 months to complete the ADHD evaluation')); } },
  { name: 'return interval: "as needed" or "PRN" after a real interval keeps the interval',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; },
    check(a){ const rtc=()=>{const m=a.generateNote().main.split('\n');return m[m.indexOf('RETURN TO CLINIC')+1];};
              // No plan chosen: the note prints the clinician's words, as it did before the list.
              for(const t of ['6 months, sooner PRN','3 months or sooner as needed','1 year prn']){
                a.S.rtcInterval=t; assert.equal(a.rtcVisitPlanned(), true, t);
                assert.equal(rtc(), 'Return to clinic in '+t+'.'); }
              for(const t of ['as needed','PRN','prn.','P.R.N.','As needed only']){
                a.S.rtcInterval=t; assert.equal(a.rtcVisitPlanned(), false, t);
                assert.equal(rtc(), 'Return to clinic as needed.'); }
              a.S.rtcInterval='   '; assert.equal(rtc(), 'Return to clinic: {interval}');
              // DBP follow-up continues: note and list name the same visit.
              a.S.dbpFollowUp='dbp'; a.S.rtcInterval='3 months or sooner as needed';
              assert.equal(rtc(), 'Return to clinic in 3 months or sooner as needed.');
              assert.ok(a.pcpBuild().followUp[0].includes('next in 3 months or sooner as needed.'));
              // Hand-back: a typed visit is kept, not replaced by "no routine return visit".
              a.S.dbpFollowUp='pcp'; a.S.rtcInterval='6 months, sooner prn';
              assert.equal(rtc(), 'Return to clinic in 6 months, sooner prn.');
              assert.ok(a.pcpBuild().followUp[0].startsWith('We will see the child for one more visit in 6 months, sooner prn')); } },
  { name: 'pcp: the wording follows the age band ("patient" from adolescence on)',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='adolescent'; S.dbpFollowUp='pcp'; },
    check(a){ const b=a.pcpBuild();
              assert.ok(b.followUp[0].includes('Thank you for caring for this patient.')); assert.ok(b.followUp[1].includes('if the patient was dismissed'));
              assert.ok(b.groups.other.rows[0].text.includes('The patient loses language, social, or motor skills they already had')); } },
  { name: 'pcp: a depression plan is handed to primary care with a suicide-risk screen, and does not force a DBP visit',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='adolescent'; S.dbpFollowUp='pcp'; S.comorbid.add('depression'); S.comorbidInPlan.add('depression'); },
    check(a){ const b=a.pcpBuild();
              assert.ok(b.followUp[0].startsWith('No routine DBP visits are planned;'));
              const mood=b.groups.act.rows.find(r=>r.id==='mood').text;
              assert.ok(mood.startsWith('PCP (in 4 to 6 weeks, sooner if mood worsens): Recheck mood and safety with the ASQ')); assert.ok(mood.includes('NIMH ASQ toolkit'));
              assert.ok(mood.includes('Brief Suicide Safety Assessment (BSSA) before the patient leaves'));
              assert.deepEqual(b.groups.other.rows.map(r=>r.id), ['tSuicide','tPsych','tRegress'], 'the suicide line is read first');
              // The note's own depression plan must not promise a clinic return the plan denies.
              const m=a.generateNote().main;
              assert.ok(m.includes('Mood and safety recheck in 4 to 6 weeks with primary care.')); assert.ok(!m.includes('Shortened return-to-clinic interval'));
              // While DBP follow-up continues the recheck stays with this clinic, in the note and the list alike.
              a.S.dbpFollowUp='dbp'; assert.ok(a.generateNote().main.includes('Shortened return-to-clinic interval: 4 to 6 weeks.'));
              assert.ok(!a.pcpBuild().groups.act.rows.some(r=>r.id==='mood')); assert.ok(a.pcpBuild().followUp[0].includes('to recheck mood and safety'));
              a.S.dbpFollowUp='pcp'; a.S.comorbidInPlan.delete('depression');
              assert.ok(!a.pcpBuild().groups.act.rows.some(r=>r.id==='mood'), 'a "note only" condition adds no row'); } },
  { name: 'pcp: confirmed ADHD in the plan hands stable medication to primary care; suspected ADHD stays with DBP',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.dbpFollowUp='pcp'; S.comorbid.add('adhd_combined'); S.comorbidInPlan.add('adhd_combined'); },
    check(a){ const b=a.pcpBuild();
              assert.ok(b.groups.manage.rows.find(r=>r.id==='adhd').text.startsWith('ADHD medication: We adjust the dose until it is stable. You take over prescribing from {now, or the date DBP confirms a stable dose}.'));
              assert.ok(b.groups.refer.rows.some(r=>r.id==='tAdhd')); assert.ok(b.groups.other.rows.some(r=>r.id==='tPsych'));
              assert.ok(b.followUp[0].startsWith('No routine DBP visits are planned;'));
              a.S.comorbid.delete('adhd_combined'); a.S.comorbidInPlan.delete('adhd_combined');
              a.S.comorbid.add('adhd_suspected'); a.S.comorbidInPlan.add('adhd_suspected');
              const b2=a.pcpBuild();
              assert.ok(!b2.groups.manage.rows.some(r=>r.id==='adhd')); assert.ok(b2.followUp[0].includes('to complete the ADHD evaluation')); } },
  { name: 'pcp: "DBP follow-up continues" and the unchosen plan each print their own line',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; },
    check(a){ assert.deepEqual(a.pcpBuild().followUp, ['{DBP follow-up plan: no routine DBP follow-up, or a return visit and its purpose}']);
              a.S.dbpFollowUp='dbp';
              assert.deepEqual(a.pcpBuild().followUp, ["We will keep seeing the child, next {interval}. Between our visits, you manage the items in this list. Thank you for sharing this child's care."]);
              assert.equal(a.pcpBuild().groups.refer.label, 'Contact DBP before the return visit if:');
              a.S.rtcInterval='6 months'; assert.ok(a.pcpBuild().followUp[0].includes('next in 6 months.'));
              a.S.dbpFollowUp='pcp'; a.S.rtcInterval=''; assert.equal(a.pcpBuild().groups.refer.label, 'Re-refer to DBP if:'); } },
  { name: 'pcp: rows follow the selections that drive them',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.needsComm.add('expressive'); },
    check(a){ const ids=()=>Object.values(a.pcpBuild().groups).flatMap(g=>g.rows.map(r=>r.id));
              const text=id=>Object.values(a.pcpBuild().groups).flatMap(g=>g.rows).find(r=>r.id===id).text;
              assert.ok(ids().includes('therapyStart')); assert.ok(text('therapyStart').includes('speech-language therapy has started'));
              // A therapy already under way needs no start check.
              a.S.therapyStatus.slp='continue'; assert.ok(!ids().includes('therapyStart'));
              // Overriding a referral off removes it from the list too.
              assert.ok(text('referrals').includes('clinical genetics')); a.S.overrides.genetics='no'; assert.ok(!ids().includes('referrals'));
              for(const [id,on] of [['sleep',S=>{S.sleep=true;}],['sibling',S=>S.ag.add('sibling')],['transition',S=>S.ag.add('transition')],
                ['safety',S=>S.safety.add('water_counsel')],['eeg',S=>{S.seizureConcern=true;}],['labs',S=>{S.labsOrdered='CBC';}],
                ['gi',S=>{S.comorbid.add('gi');S.comorbidInPlan.add('gi');}],['tCatatonia',S=>S.comorbid.add('catatonia_history')],
                ['schoolEval',S=>{S.schoolDoc='iep_needed';}]]){
                assert.ok(!ids().includes(id), id+' printed before its selection'); on(a.S); assert.ok(ids().includes(id), id+' missing after its selection'); }
              assert.ok(ids().includes('tSleep'));
              // Typed lab text is never echoed into the list.
              assert.ok(!a.generatePCPPlain().includes('CBC')); } },
  { name: 'pcp: ABA is not listed as "started" before the diagnosis is confirmed',
    setup(S){ S.diagStatus='suspected'; S.ageGroup='toddler'; S.needsComm.add('expressive'); },
    check(a){ const t=a.pcpBuild().groups.act.rows.find(r=>r.id==='therapyStart').text;
              assert.ok(!/ABA/.test(t), t); assert.ok(a.pcpBuild().groups.act.rows.some(r=>r.id==='earlySteps')); } },
  { name: 'pcp: watch-only toe walking goes to primary care unless a return visit is typed',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.needsMotor.add('toeWalk'); S.dbpFollowUp='pcp'; },
    check(a){ const has=()=>a.pcpBuild().groups.act.rows.some(r=>r.id==='gaitRecheck');
              assert.equal(has(), true);
              assert.ok(a.generateNote().main.includes('at the next well visit with primary care, no later than 12 months'));
              a.S.rtcInterval='6 months'; assert.equal(has(), false);
              assert.ok(a.generateNote().main.includes('at the return visit (see Return to Clinic)'));
              a.S.rtcInterval=''; a.S.dbpFollowUp='';
              assert.ok(a.generateNote().main.includes('with {primary care or this clinic}'), 'no plan chosen leaves the choice to the clinician');
              // While DBP follow-up continues the note leaves the owner open, so the list must not name the PCP.
              a.S.dbpFollowUp='dbp'; assert.equal(has(), false);
              // A left-out recheck is remembered while only the typed interval hides the row, and dropped with the gait selection.
              a.S.dbpFollowUp='pcp'; a.S.pcpOmit.add('gaitRecheck'); a.S.rtcInterval='6 months'; a.pcpPruneEdits();
              assert.deepEqual([...a.S.pcpOmit], ['gaitRecheck']);
              a.S.needsMotor.delete('toeWalk'); a.pcpPruneEdits(); assert.deepEqual([...a.S.pcpOmit], []); } },
  { name: 'pcp: leaving a line out and moving lines up change the copies, not the row set',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.dbpFollowUp='pcp'; S.sleep=true; S.ag.add('sibling'); },
    check(a){ const refer=()=>a.pcpBuild().groups.refer.rows;
              const before=refer().map(r=>r.id);
              assert.deepEqual(before, ['tNewConcern','tBehavior','tDocs','tSleep']);
              a.S.pcpOmit.add('tBehavior'); ['tSleep','tDocs'].forEach(k=>a.S.pcpFirst.add(k));
              // Moved-up rows lead in click order; the rest keep table order.
              assert.deepEqual(refer().map(r=>r.id), ['tSleep','tDocs','tNewConcern','tBehavior']);
              assert.equal(refer().find(r=>r.id==='tBehavior').omitted, true);
              const plain=a.generatePCPPlain(), rich=a.generatePCPHTML(false), view=a.generatePCPHTML(true);
              assert.ok(!plain.includes('Self-injury')); assert.ok(!rich.includes('Self-injury'));
              assert.ok(view.includes('Self-injury'), 'the workspace still shows a left-out line so it can be put back');
              assert.ok(plain.indexOf('Sleep problems continue')<plain.indexOf('School, insurance, disability services'));
              // Same lines on every surface (plain copy, Word copy, the note).
              for(const s of a.pcpSections()) for(const t of s.items){
                assert.ok(plain.includes('  • '+t), 'plain: '+t); assert.ok(rich.includes(t.replace(/&/g,'&amp;')), 'rich: '+t);
                assert.ok(a.generateNote().main.includes('  • '+t), 'note: '+t); } } },
  { name: 'pcp: the follow-up line always prints and stops promising triggers once all are left out',
    setup(S){ S.diagStatus='confirmed'; S.dbpFollowUp='pcp'; S.overrides.genetics='no'; },
    check(a){ ['tRegress','tNewConcern','tBehavior','tDocs'].forEach(k=>a.S.pcpOmit.add(k));
              const secs=a.pcpSections();
              assert.deepEqual(secs.map(s=>s.label), ['DBP follow-up:']);
              assert.equal(secs[0].items[0], "No routine DBP visits are planned; you can follow the child with the plan below. This is not a discharge: the child remains in our care and can return as needed. We are glad to see the child and family again whenever the need arises. Thank you for caring for this child.");
              assert.ok(secs[0].items[1].startsWith('How to come back:')); } },
  { name: 'pcp: the suicide line prints for any medication-treated problem and cannot be left out while the mood recheck prints',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='adolescent'; S.dbpFollowUp='pcp'; S.comorbid.add('adhd_combined'); S.comorbidInPlan.add('adhd_combined'); },
    check(a){ const other=()=>a.pcpBuild().groups.other.rows, kept=()=>a.pcpBuild().kept('other').map(r=>r.id);
              assert.equal(other()[0].id, 'tSuicide', 'ADHD medication alone is enough (atomoxetine carries the boxed warning)');
              assert.ok(other()[0].text.includes('within 72 hours')); assert.ok(other()[0].text.includes('call or text 988'));
              assert.ok(other()[1].text.includes('hold any stimulant until then'));
              a.S.pcpOmit.add('tSuicide'); assert.ok(!kept().includes('tSuicide'), 'removable when no mood recheck points to it');
              a.S.comorbid.add('depression'); a.S.comorbidInPlan.add('depression');
              assert.ok(kept().includes('tSuicide'), 'locked in while the mood row prints'); assert.equal(other()[0].locked, true);
              a.S.pcpOmit.add('mood'); assert.ok(!kept().includes('tSuicide'), 'released once the mood row is left out'); } },
  { name: 'pcp: not improving comes back to DBP; the school-entry check and the sleep recheck are actions',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='preschool'; S.dbpFollowUp='pcp'; ['anxiety','sleep_disorder'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); S.specifiers.add('withGDD'); },
    check(a){ const g=()=>a.pcpBuild().groups, text=(k,id)=>g()[k].rows.find(r=>r.id===id).text;
              assert.equal(text('refer','tMood'), 'Anxiety is not improving with treatment, or is worsening.');
              assert.ok(text('act','sleepRecheck').startsWith('PCP (in 4 to 6 weeks): Ask how sleep is going.'));
              assert.ok(!g().manage.rows.some(r=>r.id==='sleep'), 'the sleep line prints once, as the action');
              assert.ok(text('act','tGdd').startsWith('PCP (at school entry): Global developmental delay is a provisional diagnosis, so it needs retesting. Check that the school has repeated cognitive and adaptive testing'));
              a.S.specifiers.delete('withGDD'); a.S.specifiers.add('withSuspectedGDD'); assert.ok(text('act','tGdd').includes('the school has completed cognitive and adaptive testing'));
              a.S.comorbidInPlan.delete('sleep_disorder'); assert.ok(g().manage.rows.some(r=>r.id==='sleep')); assert.ok(!g().act.rows.some(r=>r.id==='sleepRecheck')); } },
  { name: 'pcp: only the exception is recorded when the plan was not discussed with the family',
    setup(S){ S.diagStatus='confirmed'; S.dbpFollowUp='pcp'; },
    check(a){ assert.ok(!a.generatePCPPlain().includes('discussed with the family'));
              a.S.pcpNotDiscussed=true;
              assert.equal(a.pcpBuild().followUp[2], 'This follow-up plan was not discussed with the family at the visit: {how and when the family will be told}.'); } },
  { name: 'pcp: a medication started or changed today keeps one DBP return visit',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='adolescent'; S.dbpFollowUp='pcp'; ['adhd_combined','depression'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); },
    check(a){ const line=()=>a.pcpBuild().followUp[0], rtc=()=>{const m=a.generateNote().main.split('\n');return m[m.indexOf('RETURN TO CLINIC')+1];};
              assert.ok(line().startsWith('No routine DBP visits are planned;'), 'unticked: a stable dose is handed back');
              assert.equal(rtc(), 'No routine return visit is scheduled (see Recommendations for Primary Care for when and how to return).');
              a.S.rxStartedToday=true;
              assert.equal(line(), 'We will see the patient for one more visit to adjust the medication started or changed today until the dose is stable. After that visit, no routine DBP visits are planned. This is not a discharge: the patient remains in our care and can return as needed.');
              assert.equal(rtc(), 'Return to clinic: {interval}', 'a titration visit is owed, so the interval stop stays');
              a.S.rtcInterval='4 weeks'; assert.ok(line().startsWith('We will see the patient for one more visit in 4 weeks to adjust the medication'));
              // Under DBP follow-up the visit names the titration as one of its purposes.
              a.S.dbpFollowUp='dbp'; assert.ok(line().includes('recheck mood and safety, and adjust the medication started or changed today until the dose is stable'), line());
              // With no medication block in the plan the box changes nothing.
              a.S.dbpFollowUp='pcp'; a.S.rtcInterval=''; a.S.comorbidInPlan.clear();
              assert.ok(line().startsWith('No routine DBP visits are planned;')); } },
  { name: 'note: psychiatry is referred by exception, with the reason stated',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; ['adhd_combined','anxiety','depression'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); },
    check(a){ const m=()=>a.generateNote().main;
              assert.ok(!m().includes('Child/Adolescent Psychiatry'), 'ADHD, anxiety and depression are managed here');
              assert.ok(!m().includes('Psychiatry co-management'));
              a.S.psychReasons.add('treatment_failure'); a.S.psychReasons.add('mania_psychosis');
              assert.ok(m().includes('Child/Adolescent Psychiatry: Referral for: concern for mania or psychosis; treatment that has not worked.'));
              a.S.psychReasons.clear(); a.S.comorbid.add('ocd'); a.S.comorbidInPlan.add('ocd');
              assert.ok(m().includes('Referral for: OCD (psychiatry OCD clinic).'));
              assert.ok(m().includes('psychiatry OCD clinic (medication management) and psychology OCD therapy clinic (ERP)'));
              a.S.comorbid.delete('ocd'); a.S.comorbidInPlan.delete('ocd'); a.S.overrides.psychiatry='yes';
              assert.ok(m().includes('Referral for: {reason for referral}.'), 'a forced referral leaves a fill-in, not an invented reason'); } },
  { name: 'note: medication blocks record what was prescribed and print no dose',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.sleep=true;
              ['adhd_combined','anxiety','depression','ocd','sleep_disorder'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); },
    check(a){ for(const dx of ['confirmed','ruleOut']){ a.S.diagStatus=dx; const m=a.generateNote().main;
                assert.ok(!/\d\s?(mg|mcg)\b/.test(m), 'a milligram figure printed with diagStatus='+dx+': '+(m.match(/.{40}\d\s?(mg|mcg)\b.{20}/)||[''])[0]);
                assert.ok(m.split('Medication: {agent, dose and schedule started today, or reason deferred}').length-1>=4);
                assert.ok(m.includes('Florida Best Practice Psychotherapeutic Medication Guidelines')); assert.ok(!/black box warning[^.]*counseled/i.test(m)); } } },
  { name: 'note: a medication block hands the medication to primary care only under "No routine DBP follow-up"',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.sleep=true;
              ['adhd_combined','anxiety','depression','ocd','sleep_disorder'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); },
    check(a){ // Everything from the first problem block to the primary care list / Return to Clinic.
              const blocks=()=>{ const m=a.generateNote().main; const i=m.indexOf('── Problem '); assert.ok(i>=0);
                const ends=['── Recommendations for Primary Care ──','RETURN TO CLINIC'].map(t=>m.indexOf(t,i)).filter(j=>j>=0);
                return m.slice(i,Math.min(...ends)); };
              const owner='This clinic prescribes and adjusts this medication.';
              for(const dx of ['confirmed','ruleOut']) for(const plan of ['','dbp']){ a.S.diagStatus=dx; a.S.dbpFollowUp=plan; const b=blocks();
                assert.ok(!/primary care/i.test(b), 'plan "'+plan+'", '+dx+': a problem block mentions primary care: '+(b.match(/.{60}primary care.{40}/i)||[''])[0]);
                assert.equal(b.split(owner).length-1, 3, 'ADHD, anxiety and depression each name this clinic as prescriber'); }
              a.S.diagStatus='confirmed'; a.S.dbpFollowUp='pcp'; const b=blocks();
              assert.ok(!b.includes(owner));
              assert.ok(b.includes('primary care then continues the medication')); assert.equal(b.split('once the dose is stable, primary care can continue it').length-1, 2); } },
  { name: 'note: follow-up lines in the problem blocks follow the plan',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; ['gi','adhd_suspected'].forEach(k=>{S.comorbid.add(k);S.comorbidInPlan.add(k);}); S.rtcInterval='as needed'; },
    check(a){ const m=()=>a.generateNote().main;
              assert.ok(m().includes('  • Reassess at next follow-up.')); assert.ok(m().includes('Re-evaluate ADHD status at the next follow-up visit'));
              assert.ok(m().includes('Return to clinic as needed.')); assert.ok(!m().includes('in as needed'));
              a.S.dbpFollowUp='pcp';
              assert.ok(m().includes('  • Primary care reassesses at the next visit.')); assert.ok(m().includes('Re-evaluate ADHD status at the DBP return visit'));
              a.S.dbpFollowUp='dbp';
              assert.ok(m().includes('  • Reassess at next follow-up.')); assert.ok(m().includes('Re-evaluate ADHD status at the DBP return visit')); } },
  { name: 'pcp: typed lines print after the generated actions, as typed, and never reach a selections string',
    setup(S){ S.diagStatus='confirmed'; S.ageGroup='schoolAge'; S.dbpFollowUp='dbp'; S.ag.add('sibling');
              S.pcpExtra='PCP: recheck weight in ZZTYPED\n\n  - Family: bring the form  '; },
    check(a){ const rows=a.pcpBuild().groups.act.rows;
              assert.deepEqual(rows.slice(-2).map(r=>[r.typed,r.text]), [[true,'PCP: recheck weight in ZZTYPED'],[true,'Family: bring the form']]);
              assert.ok(a.generatePCPPlain().includes('  • Family: bring the form'));
              assert.ok(!a.encodeSelections('full').includes('ZZTYPED')); } },
  { name: 'pcp: an edit goes when its row goes, except for rows that depend on typed text',
    setup(S){ S.diagStatus='confirmed'; S.sleep=true; S.labsOrdered='CBC';
              ['tSleep','labs','tGdd'].forEach(k=>S.pcpOmit.add(k)); ['sleep','tSleep','tCatatonia'].forEach(k=>S.pcpFirst.add(k)); },
    check(a){ a.pcpPruneEdits();
              assert.deepEqual([...a.S.pcpOmit], ['tSleep','labs'], 'tGdd is not produced by this form');
              assert.deepEqual([...a.S.pcpFirst], ['sleep'], 'a left-out row cannot also be moved up; tCatatonia is not produced');
              // Typed text is not restored with a selections string, so the labs edit stays.
              a.S.labsOrdered=''; a.S.sleep=false; a.pcpPruneEdits();
              assert.deepEqual([...a.S.pcpOmit], ['labs']); assert.deepEqual([...a.S.pcpFirst], []); } },
  { name: 'pcp: the plan and the edits are saved at Full; only the note switch is in a Template',
    setup(S){ S.ageGroup='schoolAge'; S.diagStatus='confirmed'; S.dbpFollowUp='pcp'; S.pcpInNote=false; S.pcpOmit.add('tDocs'); ['tBehavior','tRegress'].forEach(k=>S.pcpFirst.add(k)); },
    check(a){ assert.equal(a.encodeSelections('full'), 'APB1;ageGroup=schoolAge;diagStatus=confirmed;dbpFollowUp=pcp;pcpInNote=0;pcpOmit=tDocs;pcpFirst=tBehavior,tRegress');
              assert.equal(a.encodeSelections('template'), 'APB1;scope=template;ageGroup=schoolAge;pcpInNote=0');
              const ids=a.PCP_DEFS.map(d=>d.id);
              const r=a.decodeSelections('APB1;dbpFollowUp=pcp;pcpOmit=tDocs,notARow;pcpFirst=tBehavior,tRegress;pcpExtra=typed', {dbpFollowUp:['pcp','dbp'],pcpOmit:ids,pcpFirst:ids});
              assert.deepEqual([...r.state.pcpOmit], ['tDocs']); assert.deepEqual([...r.state.pcpFirst], ['tBehavior','tRegress']);
              assert.deepEqual(r.ignored, ['pcpOmit','pcpExtra'], 'an unknown row id and the typed field are refused'); } },
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
