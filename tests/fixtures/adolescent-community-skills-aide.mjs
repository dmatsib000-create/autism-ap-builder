// Confirmed ASD, adolescent, with community independence, community safety, and one school
// self-care area (toileting), plus a 1:1 aide and school OT. Covers the teen-only community
// living skills impact line, the teen examples in the safety teaching sentence, the supervision
// accommodation's fading tail (aide requested, but not for elopement, so it still prints), and
// the aide rationale naming the checked self-care area in age-banded wording instead of
// "significant adaptive skill deficits" (follow-up council 2026-09-26).
export default {
  name: 'adolescent-community-skills-aide',
  describe: 'Confirmed ASD, adolescent, community independence + safety + toileting, aide + OT',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;
    S.needsAdaptive.add('toileting');
    S.needsAdaptive.add('commSafety');
    S.needsAdaptive.add('commIndependence');
    S.schoolDoc = 'iep_needed';
    ['ot_school', 'aide'].forEach(k => S.schoolSvc.add(k));
    S.rtcInterval = '6 months';
  },
};
