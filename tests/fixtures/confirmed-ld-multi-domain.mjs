// Confirmed ASD with a learning disorder confirmed in reading, written expression, and
// mathematics. Covers the multi-domain problem heading and codes (DSM-5-TR order) and the
// domain-matched classroom accommodations in the note.
export default {
  name: 'confirmed-ld-multi-domain',
  describe: 'Confirmed ASD, school-age, SLD confirmed in reading, written expression, and math',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b4'].forEach(k => S.criteriaB.add(k));
    ['ld_reading', 'ld_written', 'ld_math'].forEach(k => { S.comorbid.add(k); S.comorbidInPlan.add(k); });
    S.rtcInterval = '6 months';
  },
};
