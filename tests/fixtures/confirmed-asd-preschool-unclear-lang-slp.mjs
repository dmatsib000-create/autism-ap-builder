// Confirmed ASD, preschool, language level left as "unclear, SLP to evaluate" with the
// expressive need checked by hand. Covers the preschool expressive tier used when the
// language level does not pick a specific tier.
export default {
  name: 'confirmed-asd-preschool-unclear-lang-slp',
  describe: 'Confirmed ASD, preschool, unclear language level, expressive need checked',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'he';
    S.langLevel = 'unclearSLP';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaA.add('a3');
    S.criteriaB.add('b1');
    S.criteriaB.add('b4');

    S.needsComm.add('expressive');

    S.schoolDoc = 'neither';
    S.schoolSvc.add('slp_school');

    S.rtcInterval = '6 months';
  },
};
