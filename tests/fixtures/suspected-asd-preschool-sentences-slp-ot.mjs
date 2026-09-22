// Suspected ASD, preschool, speaking in simple sentences, with every preschool SLP and
// OT goal firing. Covers the simple-sentence expressive tier plus the preschool receptive,
// social-pragmatic, articulation, language-disorder, fine motor, praxis, and self-care
// wording, the preschool motor impact line, and the preschool motor accommodation.
export default {
  name: 'suspected-asd-preschool-sentences-slp-ot',
  describe: 'Suspected ASD, preschool, simple sentences, all preschool SLP/OT goals',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.langModifiers.add('pragmatic');
    S.langModifiers.add('speechSound');

    S.diagStatus = 'suspected';
    S.criteriaA.add('a1');
    S.criteriaA.add('a2');
    S.criteriaB.add('b1');
    S.comorbid.add('language_disorder');

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsMotor.add('fine');
    S.needsMotor.add('coordination');
    S.needsAdaptive.add('dressing');

    S.schoolDoc = 'iep';
    ['slp_school', 'ot_school'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '6 months';
  },
};
