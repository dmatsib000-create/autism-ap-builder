// Suspected ASD, school-age, language "mixed / SLP eval" with Expressive checked, fine motor
// plus a confirmed written-expression SLD, community safety, and SLP/OT services. Covers the
// neutral mixed-level expressive line, the motor line dropping keyboarding when the SLD line
// carries it, the dressing-only self-care goal, and the community-safety impact line plus
// supervision accommodation (no 1:1 aide requested).
export default {
  name: 'school-age-unclear-lang-motor-safety',
  describe: 'Suspected ASD, school-age, mixed language level, fine motor + written SLD, community safety',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'they';
    S.langLevel = 'unclearSLP';
    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');
    S.comorbid.add('ld_written');
    S.comorbidInPlan.add('ld_written');
    S.needsComm.add('expressive');
    S.needsMotor.add('fine');
    S.needsAdaptive.add('dressing');
    S.needsAdaptive.add('commSafety');
    S.schoolDoc = 'iep_needed';
    ['slp_school', 'ot_school'].forEach(k => S.schoolSvc.add(k));
    S.rtcInterval = '3 months';
  },
};
