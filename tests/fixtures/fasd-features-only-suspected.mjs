// fasdFeatures alone (no documented exposure) + suspected ASD.
// Exercises: the exposure-independent path (features line without the exposure
// line), R6a parallel-tracks prose, genetics firing on the features flag alone
// (diagStatus non-empty), FASD-only audiology variant, NO ophthalmology (both
// flags required), and the Florida Center line.
export default {
  name: 'fasd-features-only-suspected',
  describe: 'Suspected ASD, preschool, FASD features flagged without documented exposure — R6a, no ophthalmology',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'singleWords';
    S.cogProfile = 'unknown';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'uncertainComp';

    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');

    S.fasdFeatures = true;

    S.rtcInterval = '3 months';
  },
};
