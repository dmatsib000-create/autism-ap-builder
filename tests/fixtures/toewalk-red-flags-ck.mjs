// Toe walking with neurologic red flags and low tone: neurology referral gains the gait clause
// (with MRI and CK), and the gait problem prints neurology, neuroimaging, and CK lines.
// Asymmetry adds the cerebral palsy sentence.
export default {
  name: 'toewalk-red-flags-ck',
  describe: 'Suspected ASD, preschool, toe walking + asymmetry + UMN + LMN signs + hypotonia — neurology, MRI, CK',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'they';
    S.langLevel = 'singleWords';
    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');
    S.needsMotor.add('toeWalk');
    S.needsMotor.add('hypotonia');
    ['asymmetric', 'umn', 'lmn'].forEach(k => S.gaitExam.add(k));
    S.rtcInterval = '3 months';
  },
};
