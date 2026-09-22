// Confirmed ASD with a reading-only learning disorder. Covers the conditional spelling line
// (reading without written expression) and the absence of keyboarding in the LD block.
export default {
  name: 'confirmed-ld-reading-only',
  describe: 'Confirmed ASD, school-age, SLD confirmed in reading only',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'conversational';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.comorbid.add('ld_reading');
    S.comorbidInPlan.add('ld_reading');
    S.rtcInterval = '6 months';
  },
};
