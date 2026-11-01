// Toe walking where ankle range could not be assessed and the child was never seen with
// heels flat (council 2026-10-31): contracture is not excluded, so the note sends the child
// to outpatient PT to measure range, while "as needed" return routes the recheck to
// primary care.
export default {
  name: 'toewalk-not-assessed',
  describe: 'Suspected ASD, preschool, toe walking, ankle not assessable, heels never seen flat, RTC as needed',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'he';
    S.langLevel = 'singleWords';
    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');
    S.needsMotor.add('toeWalk');
    S.gaitExam.add('notAssessed');
    S.rtcInterval = 'as needed';
  },
};
