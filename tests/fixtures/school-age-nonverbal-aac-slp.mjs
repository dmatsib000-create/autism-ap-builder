// Confirmed ASD, school-age, nonverbal, SLP service. Covers the school-age minimally verbal
// expressive tier, which must print beside the AAC goal instead of the narrative line.
export default {
  name: 'school-age-nonverbal-aac-slp',
  describe: 'Confirmed ASD, school-age, nonverbal, SLP service',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'nonverbal';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '3';
    S.asdLevelRRB = '2';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.needsComm.add('expressive');
    S.needsComm.add('functional_aac');
    S.schoolDoc = 'iep';
    S.schoolSvc.add('slp_school');
    S.rtcInterval = '6 months';
  },
};
