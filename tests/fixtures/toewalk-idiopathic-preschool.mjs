// Toe walking with no contracture, no impact, no red flags: the gait problem must take the
// observation path (no PT referral, no lab line) per the BSCOS/APCP consensus, and the B1
// evidence text mentioning toe walking adds the "both readings" sentence.
export default {
  name: 'toewalk-idiopathic-preschool',
  describe: 'Confirmed ASD, preschool, persistent toe walking only, B1 evidence names toe walking — observation path',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b4'].forEach(k => S.criteriaB.add(k));
    S.ev.b1 = 'Persistent toe walking; hand flapping when excited';
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;
    S.needsMotor.add('toeWalk');
    S.rtcInterval = '6 months';
  },
};
