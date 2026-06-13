// Unit 7 lock — the Part B output gate, exercised with STALE school state.
// In the browser, selecting toddler tears down Part B school state (placement, doc,
// services) via updateAgeBasedVisibility, and syncSchoolSvcFromNeeds early-returns —
// but the golden lane runs neither (both are DOM-driven). This fixture sets Part B
// state DIRECTLY on a toddler, simulating any path that mutates S without the DOM
// teardown (fixtures, future state restoration). The golden must show the school
// section with ONLY the Early Steps bullet + the Part C->B transition line: no
// "IEP in place", no "Recommended school-based services", no accommodations, no
// concurrent-billing note — even though schoolDoc/schoolSvc/schoolPlacement are set.
// The OT block also renders its frequency line WITHOUT the school-based clause.
export default {
  name: 'toddler-stale-school',
  describe: 'Confirmed ASD toddler with stale Part B school state — school output suppressed except Early Steps + transition',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'toddler';
    S.pronouns = 'he';
    S.langLevel = 'phrase';
    S.cogProfile = 'unknown';
    S.cogDataSource = 'clinical';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // Sensory need fires the OT block, exercising the toddler-gated frequency line.
    S.needsSensory.add('hypersensitivity');

    // Stale Part B state a DOM-less path could leave behind. None of it may render.
    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    ['slp_school', 'ot_school', 'visual'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '3 months';
  },
};
