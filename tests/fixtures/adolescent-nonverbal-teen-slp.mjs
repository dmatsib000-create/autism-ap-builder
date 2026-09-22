// Confirmed ASD, adolescent, single words, SLP service. Covers the teen add-on on the
// minimally verbal expressive tier (school and community settings, unfamiliar adults).
export default {
  name: 'adolescent-nonverbal-teen-slp',
  describe: 'Confirmed ASD, adolescent, single words, SLP service',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'she';
    S.langLevel = 'singleWord';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '3';
    S.asdLevelRRB = '2';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.needsComm.add('expressive');
    S.schoolDoc = 'iep';
    S.schoolSvc.add('slp_school');
    S.rtcInterval = '6 months';
  },
};
