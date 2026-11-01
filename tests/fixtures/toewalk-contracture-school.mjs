// Toe walking with a heel-cord contracture: PT section gains the toe-walking target, the gait
// problem prints the PT, recurrence-counseling, and orthopaedics-if-no-progress lines, and the
// IEP letter carries the toe-walking PT goal and gait accommodations.
export default {
  name: 'toewalk-contracture-school',
  describe: 'Confirmed ASD, school-age, toe walking + heel-cord contracture, IEP with school PT',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
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
    S.needsMotor.add('toeWalk');
    S.gaitExam.add('contracture');
    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    S.schoolSvc.add('pt_school');
    S.rtcInterval = '6 months';
  },
};
