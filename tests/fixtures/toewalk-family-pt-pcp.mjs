// Watch-only toe walking where the family requests PT after counseling (council
// 2026-10-31), with no Return to Clinic interval: the gait problem prints the treatment
// offer, an outpatient PT line at the family's request, and a primary-care recheck with a
// 12-month ceiling. The PT section states no impairment or PE goal, and the IEP letter
// carries no toe-walking content, because a family request never sets ptIndicated.
export default {
  name: 'toewalk-family-pt-pcp',
  describe: 'Confirmed ASD, school-age, watch-only toe walking, family requests PT, no RTC interval, IEP',
  outputs: ['note', 'iep'],
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
    S.needsComm.add('expressive');
    S.needsMotor.add('toeWalk');
    S.gaitExam.add('familyPT');
    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    S.schoolSvc.add('slp_school');
  },
};
