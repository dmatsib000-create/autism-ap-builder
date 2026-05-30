// Confirmed ASD with co-occurring confirmed ADHD (combined), adolescent.
// Exercises: comorbid plan block (ADHD), adolescent-specific accommodation
// language, comorbidInPlan inclusion, 504 plan path.
export default {
  name: 'adhd-comorbid-adolescent',
  describe: 'Confirmed ASD + confirmed ADHD (combined type), adolescent, 504 plan',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'they';
    S.langLevel = 'conversational';
    S.cogProfile = 'lowAverage';
    S.cogDataSource = 'priorExternal';
    S.adaptProfile = 'belowPotential';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.comorbid.add('adhd_combined');
    S.comorbidInPlan.add('adhd_combined');
    S.comorbid.add('anxiety');

    S.needsBehavior.add('noncompliance');
    S.needsSocial.add('perspective');

    S.schoolPlacement = 'general';
    S.schoolDoc = '504';
    ['counseling', 'lowRatio'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '6 months';
  },
};
