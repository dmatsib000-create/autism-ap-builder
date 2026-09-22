// Autism confirmed in a preschooler whose global developmental delay is suspected
// and still under workup, with no IEP or 504 in place. Exercises the IEP letter's
// GDD branch on a non-rule-out letter: the developmental (not IQ/achievement)
// evaluation request, the suspected-GDD eligibility caveat, the developmental
// version of the psychoed service block, and the ask to consider the Developmental
// Delay category alongside Autism.
export default {
  name: 'confirmed-asd-preschool-gdd-iep',
  describe: 'Confirmed ASD, preschool, suspected GDD, initial evaluation request',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'he';
    S.langLevel = 'singleWord';
    S.cogProfile = 'gdd';
    S.cogDataSource = 'clinical';
    S.adaptProfile = 'moderatelyImpaired';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';
    S.specifiers.add('withSuspectedGDD');
    S.specifiersManuallySet.add('withSuspectedGDD');

    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaA.add('a3');
    S.criteriaB.add('b1');
    S.criteriaB.add('b2');

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsAdaptive.add('toileting');
    S.needsMotor.add('fine');

    S.schoolDoc = 'neither';
    ['slp_school', 'ot_school', 'psychoed'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '3 months';
  },
};
