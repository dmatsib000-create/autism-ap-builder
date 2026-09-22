// Confirmed ASD, preschool, conversational speech with the expressive need checked by
// hand (e.g. a grammar-based language disorder). Covers the preschool expressive tier for
// fluent speakers, which must not fall into the catch-all (signs, pictures, AAC) line.
export default {
  name: 'confirmed-asd-preschool-conversational-slp',
  describe: 'Confirmed ASD, preschool, conversational speech, expressive need checked',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'they';
    S.langLevel = 'conversational';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaA.add('a3');
    S.criteriaB.add('b1');
    S.criteriaB.add('b3');
    S.comorbid.add('language_disorder');

    S.needsComm.add('expressive');

    S.schoolDoc = 'neither';
    S.schoolSvc.add('slp_school');

    S.rtcInterval = '6 months';
  },
};
