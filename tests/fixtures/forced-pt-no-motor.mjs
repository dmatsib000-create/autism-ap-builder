// PT forced on by override with no motor need: the targeting line falls back to a general
// target instead of printing "targeting: .".
export default {
  name: 'forced-pt-no-motor',
  describe: 'Confirmed ASD, school-age, PT override Include with no motor need — targeting fallback',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;
    S.overrides.pt = 'yes';
    S.rtcInterval = '6 months';
  },
};
