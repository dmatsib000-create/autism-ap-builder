// Confirmed ASD with complete criteria where B is met through B1 + B3 (no B2), and the
// clinician ticked the transitions ABA target by hand. The note's target rationale must
// not claim "insistence on sameness documented (DSM-5 Criterion B2)" when B2 is unticked.
export default {
  name: 'aba-transitions-hand-ticked-no-b2',
  describe: 'Confirmed ASD, preschool, criteria complete without B2, transitions target ticked by hand',
  outputs: ['note', 'aba'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'phrase';
    S.cogProfile = 'unknown';
    S.visitType = 'initial';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsComm.add('expressive');
    S.needsBehavior.add('tantrums');

    S.insuranceType = 'medicaid';
    S.abaHours = '20';
    ['functional_comm', 'reduce_tantrum', 'transitions'].forEach(k => S.abaTargets.add(k));
  },
};
