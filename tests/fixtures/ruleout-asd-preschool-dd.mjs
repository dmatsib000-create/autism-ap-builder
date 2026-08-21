// Autism ruled out for a preschooler with global developmental delay still under
// workup, and no school documentation in place yet. A common real presentation:
// delays are clear, ASD is not the explanation, and the family needs the district
// to evaluate under some other category.
//
// Covers the last two untested branches:
//   - the Developmental Delay candidate (preschool age triggers it; the letter
//     states Florida's ages-three-through-nine-or-completion-of-grade-2 ceiling)
//   - schoolDoc 'neither', which no fixture in the suite exercised at all
export default {
  name: 'ruleout-asd-preschool-dd',
  describe: 'ASD ruled out, preschool, suspected GDD, no IEP or 504 in place',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'phrase';
    S.cogProfile = 'unknown';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'ruleOut';
    S.specifiers.add('withSuspectedGDD');

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsAdaptive.add('toileting');
    S.needsMotor.add('gross');

    S.schoolDoc = 'neither';
    ['slp_school', 'ot_school', 'psychoed'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '3 months';
  },
};
