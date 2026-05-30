// Suspected ASD, toddler, minimally verbal, comprehensive eval pending.
// Exercises: suspected/under-evaluation branch (no asserted diagnosis), Early
// Steps referral path, no IEP tab (toddler), no ABA letter (not confirmed).
export default {
  name: 'suspected-toddler',
  describe: 'Suspected ASD, toddler, single-word language, comprehensive evaluation pending',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'toddler';
    S.pronouns = 'she';
    S.langLevel = 'singleWord';
    S.cogProfile = 'unknown';
    S.cogDataSource = 'clinical';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'comprehensive';

    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaB.add('b1');

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('tantrums');

    S.rtcInterval = '3 months';
  },
};
