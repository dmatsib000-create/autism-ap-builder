// Suspected ASD, preschool, with global developmental delay (suspected),
// comprehensive evaluation pending. Contrasts with the confirmed fixtures and
// with suspected-toddler: it exercises the suspected/under-evaluation branch at
// preschool age together with the withSuspectedGDD specifier and a GDD cognitive
// profile, plus the early-intervention / school-readiness referral language.
export default {
  name: 'suspected-preschool-gdd',
  describe: 'Suspected ASD, preschool, suspected GDD, comprehensive evaluation pending',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'they';
    S.langLevel = 'phrase';
    S.cogProfile = 'gdd';
    S.cogDataSource = 'clinical';
    S.adaptProfile = 'moderatelyImpaired';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'uncertainComp';
    S.specifiers.add('withSuspectedGDD');
    S.specifiersManuallySet.add('withSuspectedGDD');

    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaB.add('b1');
    S.criteriaB.add('b3');

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsSocial.add('play');
    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('tantrums');
    S.needsAdaptive.add('toileting');

    S.schoolPlacement = 'daycare';

    S.rtcInterval = '3 months';
  },
};
