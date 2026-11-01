// Gait concerns alone (falls, tripping): PT and school PT fire, the problem is titled
// "Gait Abnormality (R26.89)", and the ABA fence holds: no motor line in the note's ABA
// justification or in the ABA letter's domain list.
export default {
  name: 'gait-falls-aba-fence',
  describe: 'Confirmed ASD, school-age, gait concerns only, ABA + IEP — gait stays out of ABA output',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;
    S.needsComm.add('expressive');
    S.needsBehavior.add('rigidity');
    S.needsMotor.add('gait');
    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    ['sped', 'pt_school'].forEach(k => S.schoolSvc.add(k));
    S.insuranceType = 'commercial';
    S.abaHours = '20';
    ['comm', 'transitions'].forEach(k => S.abaTargets.add(k));
    S.rtcInterval = '6 months';
  },
};
